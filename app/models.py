"""
app/models.py
Modelos ORM de SQLAlchemy — representan las tablas de la base de datos.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
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

    # Relación inversa: permite ver en qué items aparece este producto
    items = relationship("ItemPedido", back_populates="producto")


class Usuario(Base):
    """
    Tabla `usuarios` en PostgreSQL.
    Representa a cada cliente registrado en el e-commerce.
    """

    __tablename__ = "usuarios"

    id       = Column(Integer, primary_key=True, index=True)
    nombre   = Column(String,  nullable=False)
    email    = Column(String,  unique=True, nullable=False, index=True)
    password = Column(String,  nullable=False)
    activo   = Column(Boolean, default=True)

    # Un usuario puede tener muchos pedidos
    pedidos = relationship("Pedido", back_populates="usuario")


class Pedido(Base):
    """
    Tabla `pedidos` en PostgreSQL.
    Representa una orden de compra realizada por un usuario.
    """

    __tablename__ = "pedidos"

    id         = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    total      = Column(Float,  default=0.0)
    estado     = Column(String, default="pendiente")  # pendiente / pagado / enviado

    # Muchos pedidos pertenecen a un usuario
    usuario = relationship("Usuario",    back_populates="pedidos")
    # Un pedido contiene muchos items; si se borra el pedido, se borran sus items
    items   = relationship("ItemPedido", back_populates="pedido",
                           cascade="all, delete-orphan")


class ItemPedido(Base):
    """
    Tabla `items_pedido` en PostgreSQL.
    Tabla intermedia entre Pedido y Producto (relación muchos-a-muchos).
    Guarda además la cantidad y el precio unitario al momento de la compra.
    """

    __tablename__ = "items_pedido"

    id          = Column(Integer, primary_key=True, index=True)
    pedido_id   = Column(Integer, ForeignKey("pedidos.id"),   nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad    = Column(Integer, nullable=False, default=1)
    precio_unit = Column(Float,  nullable=False)  # precio al momento de comprar

    # Cada item pertenece a un pedido y a un producto
    pedido   = relationship("Pedido",   back_populates="items")
    producto = relationship("Producto", back_populates="items")
