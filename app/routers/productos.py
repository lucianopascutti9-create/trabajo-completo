"""
app/routers/productos.py
Endpoints de productos — montados en app/main.py con prefix="/productos".
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas import ProductoCreate, ProductoOut
from app.services.productos import crear_producto, listar_productos

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
    Delega toda la lógica a la capa de servicio.
    Los parámetros de paginación y filtro son opcionales; si no se envían
    se devuelven los primeros 10 productos sin filtrar.
    """
    return listar_productos(db, skip=skip, limit=limit, nombre=nombre, precio_max=precio_max)


@router.post(
    "/",
    response_model=ProductoOut,
    status_code=201,
    summary="Agregar producto",
    description="Recibe un objeto Producto, lo persiste en PostgreSQL y lo retorna con su `id`.",
)
def post_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
) -> ProductoOut:
    """
    Delega la creación y persistencia del producto a la capa de servicio.
    El endpoint solo valida la entrada (vía ProductoCreate) y serializa
    la salida (vía ProductoOut); la lógica de negocio vive en services/.
    """
    return crear_producto(db, producto)
