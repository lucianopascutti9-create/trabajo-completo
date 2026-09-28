"""
app/models.py
Modelos ORM de SQLAlchemy — representan las tablas de la base de datos.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Producto(Base):
    __tablename__ = "productos"

    id              = Column(Integer, primary_key=True, index=True)
    nombre          = Column(String,  nullable=False)
    precio_final    = Column(Float,   nullable=False, default=0.0)
    precio          = Column(Float,   nullable=True, default=0.0)
    precio_anterior = Column(Float,   nullable=True)
    cuotas_cantidad = Column(Integer, nullable=False, default=3)
    cuotas_valor    = Column(Float,   nullable=False, default=0.0)
    garantia_meses  = Column(Integer, nullable=False, default=0)
    stock           = Column(Integer, nullable=False, default=10)
    subtitulo       = Column(String,  nullable=True)
    categoria       = Column(String,  nullable=True, default="Flan Artesanal")
    badge           = Column(String,  nullable=True)
    rating          = Column(Float,   nullable=True, default=5.0)
    reviews_count   = Column(Integer, nullable=True, default=0)
    porciones       = Column(String,  nullable=True)
    imagen          = Column(String,  nullable=True)
    imagen_url      = Column(String,  nullable=True)
    en_stock        = Column(Boolean, nullable=True, default=True)
    categoria_id    = Column(Integer, nullable=True)

    items = relationship("ItemPedido", back_populates="producto")


class Usuario(Base):
    __tablename__ = "usuarios"

    id                  = Column(Integer,  primary_key=True, index=True)
    nombre              = Column(String,   nullable=False)
    email               = Column(String,   unique=True, nullable=False, index=True)
    hashed_password     = Column(String,   nullable=False)
    activo              = Column(Boolean,  default=True)
    rol                 = Column(String,   nullable=False, default="customer")
    acepto_tratamiento  = Column(Boolean,  nullable=False, default=False)
    fecha_consentimiento = Column(DateTime, nullable=True)

    pedidos = relationship("Pedido", back_populates="usuario")
    solicitudes_revocacion = relationship("SolicitudRevocacion", back_populates="usuario")


class Pedido(Base):
    __tablename__ = "pedidos"

    id                = Column(Integer, primary_key=True, index=True)
    usuario_id        = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    total             = Column(Float,  default=0.0)
    estado            = Column(String, default="pendiente")
    creado_en         = Column(DateTime, nullable=True)
    codigo_revocacion = Column(String, nullable=True)

    usuario              = relationship("Usuario",    back_populates="pedidos")
    items                = relationship("ItemPedido", back_populates="pedido", cascade="all, delete-orphan")
    solicitud_revocacion = relationship("SolicitudRevocacion", back_populates="pedido", uselist=False)


class ItemPedido(Base):
    __tablename__ = "items_pedido"

    id          = Column(Integer, primary_key=True, index=True)
    pedido_id   = Column(Integer, ForeignKey("pedidos.id"),   nullable=False)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    cantidad    = Column(Integer, nullable=False, default=1)
    precio_unit = Column(Float,  nullable=False)

    pedido   = relationship("Pedido",   back_populates="items")
    producto = relationship("Producto", back_populates="items")


class SolicitudRevocacion(Base):
    __tablename__ = "solicitudes_revocacion"

    id         = Column(Integer, primary_key=True, index=True)
    codigo     = Column(String, unique=True, index=True, nullable=False)
    pedido_id  = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha      = Column(DateTime, nullable=False)
    motivo     = Column(String, nullable=True, default="Arrepentimiento de compra (Art. 34 Ley 24.240)")

    pedido  = relationship("Pedido", back_populates="solicitud_revocacion")
    usuario = relationship("Usuario", back_populates="solicitudes_revocacion")

