"""
app/routers/productos.py
Endpoints de productos — montados en app/main.py con prefix="/productos".
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models
from app.dependencies import get_db, require_admin
from app.schemas.producto import ProductoCreate, ProductoOut
from app.services.productos import crear_producto, listar_productos

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get(
    "",
    response_model=list[ProductoOut],
    summary="Listar productos",
)
@router.get(
    "/",
    response_model=list[ProductoOut],
    summary="Listar productos (con barra final)",
)
def get_productos(
    skip: int = Query(default=0, ge=0),
    page: int | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    nombre: str | None = Query(default=None),
    precio_max: float | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
) -> list[ProductoOut]:
    offset = (page * limit) if page is not None else skip
    return listar_productos(db, skip=offset, limit=limit, nombre=nombre, precio_max=precio_max)


@router.get(
    "/{producto_id}",
    response_model=ProductoOut,
    summary="Obtener producto por ID",
)
def get_producto_por_id(
    producto_id: int,
    db: Session = Depends(get_db),
) -> ProductoOut:
    db_producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id={producto_id} no encontrado.",
        )
    return db_producto


@router.post(
    "",
    response_model=ProductoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar producto",
)
@router.post(
    "/",
    response_model=ProductoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar producto (con barra final)",
)
def post_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),
) -> ProductoOut:
    return crear_producto(db, producto)


@router.put(
    "/{producto_id}",
    response_model=ProductoOut,
    summary="Actualizar producto",
)
def put_producto(
    producto_id: int,
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),
) -> ProductoOut:
    db_producto = db.query(models.Producto).filter(
        models.Producto.id == producto_id
    ).first()

    if not db_producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id={producto_id} no encontrado.",
        )

    for campo, valor in producto.model_dump().items():
        setattr(db_producto, campo, valor)

    db.commit()
    db.refresh(db_producto)
    return db_producto


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar producto",
)
def delete_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    _admin: models.Usuario = Depends(require_admin),
) -> None:
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
