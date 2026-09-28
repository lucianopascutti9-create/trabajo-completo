"""
app/routers/productos.py
Endpoints de productos — montados en app/main.py con prefix="/productos".

Control de acceso:
- GET  /productos/    → público (cualquier usuario, autenticado o no).
- POST /productos/    → requiere rol "admin" (require_admin).
- PUT  /productos/{id}→ requiere rol "admin" (require_admin).
- DELETE /productos/{id}→ requiere rol "admin" (require_admin).
"""

import pathlib
import secrets

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app import models
from app.dependencies import get_db, require_admin
from app.schemas import ProductoCreate, ProductoOut
from app.services.productos import crear_producto, listar_productos
from app.utils.archivos import parece_imagen

router = APIRouter(prefix="/productos", tags=["Productos"])


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=list[ProductoOut],
    summary="Listar productos",
    description=(
        "Devuelve productos paginados con filtros opcionales por nombre "
        "(búsqueda parcial, case-insensitive) y precio máximo."
    ),
)
def get_productos(
    skip: int = Query(default=0, ge=0, description="Registros a saltear (offset)"),
    limit: int = Query(default=10, ge=1, le=100, description="Cantidad máxima a devolver"),
    nombre: str | None = Query(default=None, description="Filtro parcial por nombre (ilike)"),
    precio_max: float | None = Query(default=None, ge=0, description="Precio final máximo"),
    db: Session = Depends(get_db),
) -> list[ProductoOut]:
    """
    Endpoint público — no requiere autenticación.
    Delega toda la lógica a la capa de servicio.
    Los parámetros de paginación y filtro son opcionales; si no se envían
    se devuelven los primeros 10 productos sin filtrar.
    """
    return listar_productos(db, skip=skip, limit=limit, nombre=nombre, precio_max=precio_max)


@router.post(
    "/",
    response_model=ProductoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar producto",
    description="Recibe un objeto Producto, lo persiste en PostgreSQL y lo retorna con su `id`. Requiere rol 'admin'.",
)
def post_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),  # ← guard de autorización
) -> ProductoOut:
    """
    Crea un nuevo producto. Solo accesible para usuarios con rol 'admin'.

    Delega la creación y persistencia del producto a la capa de servicio.
    El endpoint solo valida la entrada (vía ProductoCreate) y serializa
    la salida (vía ProductoOut); la lógica de negocio vive en services/.

    _admin se llama con guión bajo para indicar que es solo para autorización
    y no se usa dentro del cuerpo de la función.
    """
    return crear_producto(db, producto)


@router.put(
    "/{producto_id}",
    response_model=ProductoOut,
    summary="Actualizar producto",
    description="Actualiza todos los campos de un producto existente. Requiere rol 'admin'.",
)
def put_producto(
    producto_id: int,
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),  # ← guard de autorización
) -> ProductoOut:
    """
    Actualiza un producto existente por su ID. Solo accesible para admins.

    Utiliza actualización total (PUT): todos los campos del schema
    ProductoCreate son reemplazados. Para actualizaciones parciales
    se debería usar PATCH con un schema de campos opcionales.

    Retorna HTTP 404 si el producto no existe.
    """
    db_producto = db.query(models.Producto).filter(
        models.Producto.id == producto_id
    ).first()

    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id={producto_id} no encontrado.",
        )

    # Actualización total de todos los campos
    for campo, valor in producto.model_dump().items():
        setattr(db_producto, campo, valor)

    db.commit()
    db.refresh(db_producto)
    return db_producto


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar producto",
    description="Elimina un producto por su ID. Requiere rol 'admin'.",
)
def delete_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),  # ← guard de autorización
) -> None:
    """
    Elimina un producto por su ID. Solo accesible para admins.

    Retorna HTTP 204 No Content al eliminar correctamente (sin cuerpo).
    Retorna HTTP 404 si el producto no existe.
    """
    db_producto = db.query(models.Producto).filter(
        models.Producto.id == producto_id
    ).first()

    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id={producto_id} no encontrado.",
        )

    db.delete(db_producto)
    db.commit()


# ---------------------------------------------------------------------------
# Subida de imagen de producto
# ---------------------------------------------------------------------------

# Extensiones de imagen permitidas (en minúsculas)
_EXTENSIONES_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp"}

# Tamaño máximo: 2 MB
_TAMANO_MAX_BYTES = 2 * 1024 * 1024


@router.post(
    "/{producto_id}/imagen",
    response_model=ProductoOut,
    summary="Subir imagen de producto",
    description=(
        "Sube una imagen (JPG, PNG o WEBP, máx 2 MB) para el producto indicado. "
        "Valida extensión, tamaño y firma real de bytes. Requiere rol 'admin'."
    ),
)
async def subir_imagen_producto(
    producto_id: int,
    archivo: UploadFile = File(..., description="Imagen del producto (JPG, PNG o WEBP, máx. 2 MB)"),
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),  # ← guard de autorización
) -> ProductoOut:
    """
    Endpoint de subida segura de imagen para un producto.

    Orden de validaciones (de la más barata a la más cara):
      1. Extensión  → operación de string, O(k) sin I/O.
      2. Tamaño     → requiere leer los bytes completos (await archivo.read()).
      3. Firma real  → requiere tener los bytes en memoria (solo después de leer).

    El nombre del archivo en disco se genera con secrets.token_hex; NO se usa
    archivo.filename para evitar path traversal y directory injection.
    """
    # -- 0. Verificar que el producto exista -----------------------------------
    db_producto = db.query(models.Producto).filter(
        models.Producto.id == producto_id
    ).first()

    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id={producto_id} no encontrado.",
        )

    # -- 1. Validar extensión (barata: solo strings, sin I/O) ------------------
    ext = pathlib.Path(archivo.filename or "").suffix.lower()
    if ext not in _EXTENSIONES_PERMITIDAS:
        raise HTTPException(
            status_code=415,
            detail="Formato no permitido. Extensiones válidas: .jpg, .jpeg, .png, .webp",
        )

    # -- 2. Leer bytes y validar tamaño (una sola lectura) -------------------
    contenido = await archivo.read()
    if len(contenido) > _TAMANO_MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Máximo 2 MB.",
        )

    # -- 3. Validar firma real (magic bytes) ----------------------------------
    if not parece_imagen(contenido):
        raise HTTPException(
            status_code=415,
            detail="No es una imagen. El contenido del archivo no corresponde a JPG, PNG ni WEBP.",
        )

    # -- Guardado seguro en disco ---------------------------------------------
    # Nombre generado internamente: nunca se usa archivo.filename para evitar
    # path traversal (ej: "../../etc/passwd.jpg").
    nombre = f"{producto_id}-{secrets.token_hex(8)}{ext}"
    destino = pathlib.Path("uploads") / "productos"
    destino.mkdir(parents=True, exist_ok=True)
    (destino / nombre).write_bytes(contenido)

    # Guardar la ruta pública en la base de datos
    db_producto.imagen_url = f"/static/productos/{nombre}"
    db.commit()
    db.refresh(db_producto)

    return db_producto
