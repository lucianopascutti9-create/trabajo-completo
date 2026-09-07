"""
app/services/productos.py
Capa de servicio para el CRUD de productos.
Toda la lógica de negocio y acceso a la base de datos vive aquí,
manteniendo los endpoints de main.py delgados y fácilmente testeables.
"""

from sqlalchemy.orm import Session
from app import models
from app.schemas import ProductoCreate, ProductoOut


def crear_producto(db: Session, producto: ProductoCreate) -> models.Producto:
    """
    Persiste un nuevo producto en PostgreSQL y lo retorna con su `id` asignado.

    Flujo:
    1. Convierte el schema Pydantic a kwargs con model_dump().
    2. Crea la instancia ORM (todavía no escrita en la DB).
    3. db.add()    → registra el objeto en la sesión (staged).
    4. db.commit() → escribe la fila en PostgreSQL.
    5. db.refresh()→ recarga el objeto para obtener el `id` generado por la DB.
    """
    db_producto = models.Producto(**producto.model_dump())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto


def listar_productos(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    nombre: str | None = None,
    precio_max: float | None = None,
) -> list[models.Producto]:
    """
    Retorna una lista paginada de productos con filtros opcionales.

    Parámetros:
    - skip:      cantidad de registros a saltear (offset para paginación).
    - limit:     cantidad máxima de registros a devolver.
    - nombre:    filtra por coincidencia parcial, case-insensitive (ilike).
    - precio_max: filtra productos con precio_final <= precio_max.

    ilike("%texto%") equivale a SQL: WHERE nombre ILIKE '%texto%'
    ILIKE es la variante case-insensitive de LIKE en PostgreSQL.
    """
    query = db.query(models.Producto)

    if nombre is not None:
        query = query.filter(models.Producto.nombre.ilike(f"%{nombre}%"))

    if precio_max is not None:
        query = query.filter(models.Producto.precio_final <= precio_max)

    return query.offset(skip).limit(limit).all()
