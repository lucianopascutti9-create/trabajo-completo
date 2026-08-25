"""
Actividad Clase 2 - FastAPI + SQLAlchemy + PostgreSQL
Culto al Flan — E-commerce de postres tradicionales
Ley 24.240 de Defensa del Consumidor (Argentina)

Ejecutar con:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import Base, engine, get_db
from app import models  # noqa: F401 — necesario para que Base registre los modelos

# ---------------------------------------------------------------------------
# Creación de tablas en PostgreSQL al iniciar la aplicación.
# SQLAlchemy compara los modelos ORM contra el esquema real y crea las tablas
# que no existan todavía. No modifica tablas existentes (para eso usaremos
# Alembic en la próxima etapa).
# ---------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# Inicialización de la aplicación
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Culto al Flan — API",
    description="API de productos de postres tradicionales — Actividad Clase 2",
    version="2.0.0",
)


# ---------------------------------------------------------------------------
# Schema Pydantic — usado para validar entrada/salida de la API.
# Es independiente del modelo ORM; permite controlar qué campos se exponen.
# ---------------------------------------------------------------------------

class ProductoSchema(BaseModel):
    """
    Representa un producto de la tienda.

    Campos obligatorios según la Ley 24.240 (deber de información):
    - precio_final:    precio total que paga el consumidor (IVA incluido).
    - cuotas_cantidad: cantidad de cuotas disponibles para financiamiento.
    - cuotas_valor:    valor de cada cuota en pesos.
    - garantia_meses:  período de garantía legal/comercial en meses.
    """

    id: int
    nombre: str
    precio_final: float
    cuotas_cantidad: int
    cuotas_valor: float
    garantia_meses: int
    stock: int

    class Config:
        # Permite que Pydantic lea atributos desde instancias ORM de SQLAlchemy
        from_attributes = True


class ProductoCreate(BaseModel):
    """Schema para la creación de un producto (sin `id`, lo genera la DB)."""
    nombre: str
    precio_final: float
    cuotas_cantidad: int
    cuotas_valor: float
    garantia_meses: int
    stock: int


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get(
    "/productos",
    response_model=list[ProductoSchema],
    summary="Listar productos",
    description="Devuelve la lista completa de productos disponibles en la tienda.",
)
def get_productos(db: Session = Depends(get_db)) -> list[ProductoSchema]:
    """
    Consulta todos los productos almacenados en PostgreSQL.
    La sesión `db` es inyectada por FastAPI a través de Depends(get_db).
    """
    return db.query(models.Producto).all()


@app.post(
    "/productos",
    response_model=ProductoSchema,
    status_code=201,
    summary="Agregar producto",
    description="Recibe un objeto Producto, lo persiste en PostgreSQL y lo retorna.",
)
def create_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
) -> ProductoSchema:
    """
    Persiste un nuevo producto en PostgreSQL.

    Flujo:
    1. Crea una instancia ORM a partir del schema Pydantic.
    2. La agrega a la sesión (staged, no escrito aún).
    3. Hace commit → escribe en la base de datos.
    4. Refresca el objeto para obtener el `id` generado por la DB.
    5. Lo retorna serializado como ProductoSchema.
    """
    db_producto = models.Producto(**producto.model_dump())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto


# ---------------------------------------------------------------------------
# Reflexión — Ley 24.240, Art. 4 (Deber de información)
#
# ¿Qué campo agregarías al modelo para cumplir mejor con la Ley 24.240?
#
# Agregaría el campo `tasa_cft` (float), que representa la Tasa de Costo
# Financiero Total del financiamiento en cuotas. La Ley 24.240 y las
# normativas complementarias del BCRA exigen que el vendedor informe el
# costo real del crédito, no solo el valor nominal de cada cuota; sin ese
# dato el consumidor no puede comparar ofertas ni conocer el sobreprecio
# que paga por financiarse.
# ---------------------------------------------------------------------------
