"""
app/models.py
Modelos ORM de SQLAlchemy — representan las tablas de la base de datos.
"""

import uuid
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def generar_codigo() -> str:
    """
    Genera un código único para la SolicitudRevocacion.
    Usa UUID4 (random) → colisión prácticamente imposible.
    Formato: REV-<8 chars hex en mayúsculas>, e.g. REV-3F2A9C01.
    """
    return "REV-" + uuid.uuid4().hex[:8].upper()


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
    imagen_url      = Column(String,  nullable=True)   # ruta pública servida por StaticFiles

    # Relación inversa: permite ver en qué items aparece este producto
    items = relationship("ItemPedido", back_populates="producto")


class Usuario(Base):
    """
    Tabla `usuarios` en PostgreSQL.
    Representa a cada cliente registrado en el e-commerce.

    Ley 25.326 (Protección de Datos Personales):
    - hashed_password   : la contraseña NUNCA se almacena en texto plano.
    - acepto_tratamiento: registra el consentimiento explícito del usuario
                          al momento del registro (Art. 5, Ley 25.326).
    - fecha_consentimiento: timestamp UTC del momento en que se dio el consentimiento.
    """

    __tablename__ = "usuarios"

    id                  = Column(Integer,  primary_key=True, index=True)
    nombre              = Column(String,   nullable=False)
    email               = Column(String,   unique=True, nullable=False, index=True)
    hashed_password     = Column(String,   nullable=False)
    activo               = Column(Boolean,  default=True)
    fecha_baja           = Column(DateTime, nullable=True)                       # UTC timestamp de baja (Ley 25.326, Art. 6 — cancelación)
    rol                  = Column(String,   nullable=False, default="customer")  # "admin" | "customer"
    acepto_tratamiento   = Column(Boolean,  nullable=False, default=False)       # Ley 25.326, Art. 5
    fecha_consentimiento = Column(DateTime, nullable=True)                       # UTC timestamp

    # Un usuario puede tener muchos pedidos
    pedidos = relationship("Pedido", back_populates="usuario")
    # Solicitudes de revocación emitidas por el usuario (Ley 24.240, Art. 34)
    solicitudes_revocacion = relationship("SolicitudRevocacion", back_populates="usuario")


class Pedido(Base):
    """
    Tabla `pedidos` en PostgreSQL.
    Representa una orden de compra realizada por un usuario.
    """

    __tablename__ = "pedidos"

    id         = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    total      = Column(Float,  default=0.0)
    estado     = Column(String, default="pendiente")  # pendiente / pagado / enviado / cancelado
    creado_en  = Column(DateTime, nullable=True)       # UTC timestamp de creación del pedido

    # Muchos pedidos pertenecen a un usuario
    usuario = relationship("Usuario",    back_populates="pedidos")
    # Un pedido contiene muchos items; si se borra el pedido, se borran sus items
    items   = relationship("ItemPedido", back_populates="pedido",
                           cascade="all, delete-orphan")
    # Solicitud de revocación asociada al pedido
    solicitud_revocacion = relationship("SolicitudRevocacion", back_populates="pedido", uselist=False)


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


class SolicitudRevocacion(Base):
    """
    Tabla `solicitudes_revocacion` en PostgreSQL.

    Registra el ejercicio del derecho de arrepentimiento de compra.
    Base legal:
    - Ley 24.240, Art. 34  : derecho de revocación dentro de los 10 días corridos.
    - Disposición 954/2025 : exige botón de arrepentimiento visible en e-commerce.

    El campo `codigo` sirve como comprobante entregado al consumidor.
    """

    __tablename__ = "solicitudes_revocacion"

    id         = Column(Integer,  primary_key=True, index=True)
    codigo     = Column(String,   unique=True, nullable=False, default=generar_codigo, index=True)
    pedido_id  = Column(Integer,  ForeignKey("pedidos.id"),   nullable=False)
    usuario_id = Column(Integer,  ForeignKey("usuarios.id"),  nullable=False)
    creada_en  = Column(DateTime, nullable=False)  # UTC timestamp del momento de la solicitud

    # Relaciones
    pedido  = relationship("Pedido",   back_populates="solicitud_revocacion")
    usuario = relationship("Usuario",  back_populates="solicitudes_revocacion")
