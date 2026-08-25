"""
app/models.py
Modelos ORM de SQLAlchemy — representan las tablas de la base de datos.
"""

from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class Producto(Base):
    """
    Tabla `productos` en PostgreSQL.
    Cada instancia de esta clase equivale a una fila de la tabla.
    """

    __tablename__ = "productos"

    id              = Column(Integer, primary_key=True, index=True)
    nombre          = Column(String,  nullable=False)
    precio_final    = Column(Float,   nullable=False)
    cuotas_cantidad = Column(Integer, nullable=False)
    cuotas_valor    = Column(Float,   nullable=False)
    garantia_meses  = Column(Integer, nullable=False)
    stock           = Column(Integer, nullable=False)
