"""
app/schemas.py
Schemas Pydantic — contratos de entrada/salida de la API.
Son independientes de los modelos ORM: permiten controlar exactamente
qué campos se validan al recibir datos y cuáles se exponen al responder.
"""

from pydantic import BaseModel


class ProductoCreate(BaseModel):
    """
    Schema de entrada para crear un producto.
    No incluye `id` porque ese campo lo genera automáticamente PostgreSQL.
    """

    nombre: str
    precio_final: float
    cuotas_cantidad: int
    cuotas_valor: float
    garantia_meses: int
    stock: int


class ProductoOut(ProductoCreate):
    """
    Schema de salida para leer un producto.
    Hereda todos los campos de ProductoCreate y agrega `id`.

    from_attributes = True (anteriormente orm_mode = True en Pydantic v1)
    le indica a Pydantic que, además de leer diccionarios, puede leer los
    atributos de instancias ORM de SQLAlchemy (objetos que NO son dicts).
    Sin esta configuración, `ProductoOut.model_validate(orm_obj)` fallaría
    porque Pydantic intentaría acceder a las claves como en un dict y no
    encontraría ninguna.
    """

    id: int

    model_config = {"from_attributes": True}
