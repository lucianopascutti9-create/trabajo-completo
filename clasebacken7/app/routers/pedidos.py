"""
app/routers/pedidos.py
Endpoints para creación de pedidos y consulta de historial de compras.
"""

from datetime import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.models import Usuario, Producto, Pedido, ItemPedido, SolicitudRevocacion
from app.schemas.pedido import PedidoCreate, PedidoOut, ItemPedidoOut

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


@router.post("", response_model=PedidoOut, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    pedido_in: PedidoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Crea un pedido validando stock y calculando el total desde la base de datos.
    - Rechaza si no hay stock suficiente con 409 Conflict.
    - Descuenta las unidades del stock del producto.
    - Guarda el pedido asociado al usuario autenticado.
    """
    total_calculado = 0.0
    items_a_crear = []

    # Validar productos y disponibilidad de stock
    for item in pedido_in.items:
        producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto #{item.producto_id} no encontrado"
            )

        if producto.stock < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"No hay suficiente stock para {producto.nombre}. Stock disponible: {producto.stock}"
            )

        precio_unit = producto.precio_final if (producto.precio_final and producto.precio_final > 0) else (producto.precio or 0.0)
        total_calculado += precio_unit * item.cantidad

        # Descontar stock
        producto.stock -= item.cantidad

        items_a_crear.append({
            "producto": producto,
            "cantidad": item.cantidad,
            "precio_unit": precio_unit
        })

    # Crear el pedido
    ahora = datetime.utcnow()
    nuevo_pedido = Pedido(
        usuario_id=current_user.id,
        total=total_calculado,
        estado="confirmado",
        creado_en=ahora
    )
    db.add(nuevo_pedido)
    db.flush()  # Para obtener nuevo_pedido.id

    # Crear los ítems del pedido
    items_out = []
    for item_data in items_a_crear:
        item_db = ItemPedido(
            pedido_id=nuevo_pedido.id,
            producto_id=item_data["producto"].id,
            cantidad=item_data["cantidad"],
            precio_unit=item_data["precio_unit"]
        )
        db.add(item_db)
        db.flush()
        items_out.append(
            ItemPedidoOut(
                id=item_db.id,
                producto_id=item_db.producto_id,
                cantidad=item_db.cantidad,
                precio_unit=item_db.precio_unit,
                nombre=item_data["producto"].nombre
            )
        )

    db.commit()
    db.refresh(nuevo_pedido)

    return PedidoOut(
        id=nuevo_pedido.id,
        usuario_id=nuevo_pedido.usuario_id,
        total=nuevo_pedido.total,
        estado=nuevo_pedido.estado,
        creado_en=nuevo_pedido.creado_en,
        codigo_revocacion=nuevo_pedido.codigo_revocacion,
        items=items_out
    )


@router.get("/mis-pedidos", response_model=List[PedidoOut])
@router.get("", response_model=List[PedidoOut])
def get_mis_pedidos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Devuelve únicamente los pedidos correspondientes al usuario autenticado.
    """
    pedidos_db = (
        db.query(Pedido)
        .filter(Pedido.usuario_id == current_user.id)
        .order_by(Pedido.id.desc())
        .all()
    )

    resultado = []
    for p in pedidos_db:
        items_out = []
        for it in p.items:
            prod_nombre = it.producto.nombre if it.producto else f"Producto #{it.producto_id}"
            items_out.append(
                ItemPedidoOut(
                    id=it.id,
                    producto_id=it.producto_id,
                    cantidad=it.cantidad,
                    precio_unit=it.precio_unit,
                    nombre=prod_nombre
                )
            )
        resultado.append(
            PedidoOut(
                id=p.id,
                usuario_id=p.usuario_id,
                total=p.total,
                estado=p.estado,
                creado_en=p.creado_en,
                codigo_revocacion=p.codigo_revocacion,
                items=items_out
            )
        )

    return resultado


@router.post("/{pedido_id}/revocar", status_code=status.HTTP_201_CREATED)
def revocar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Ejerce el derecho de revocación / arrepentimiento (Disposición 954/2025 y Ley 24.240, Art. 34).
    - 404 si el pedido no existe o no pertenece al usuario.
    - 409 si ya está cancelado o si transcurrieron más de 10 días corridos.
    - 201 con código identificador de la solicitud y actualización del estado del pedido.
    """
    pedido = (
        db.query(Pedido)
        .filter(Pedido.id == pedido_id, Pedido.usuario_id == current_user.id)
        .first()
    )

    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido #{pedido_id} no encontrado en tu historial de compras."
        )

    if pedido.estado == "cancelado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"El pedido #{pedido_id} ya fue cancelado o revocado previamente. Código: {pedido.codigo_revocacion or 'Sin código previo'}."
        )

    if pedido.creado_en:
        dias_transcurridos = (datetime.utcnow() - pedido.creado_en).total_seconds() / 86400.0
        if dias_transcurridos > 10.0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El plazo legal de 10 días corridos para revocar la compra ha expirado (creado hace {int(dias_transcurridos)} días)."
            )

    # Generar código único de identificación de solicitud conforme a la Disposición 954/2025
    codigo = f"REV-{pedido.id:04d}-{uuid.uuid4().hex[:6].upper()}"

    # Restaurar stock de los productos
    for item in pedido.items:
        if item.producto:
            item.producto.stock += item.cantidad

    pedido.estado = "cancelado"
    pedido.codigo_revocacion = codigo

    # Registrar la solicitud
    solicitud = SolicitudRevocacion(
        codigo=codigo,
        pedido_id=pedido.id,
        usuario_id=current_user.id,
        fecha=datetime.utcnow(),
        motivo="Arrepentimiento de compra (Art. 34 Ley 24.240 y Disp. 954/2025)"
    )
    db.add(solicitud)
    db.commit()

    return {
        "codigo": codigo,
        "codigo_solicitud": codigo,
        "pedido_id": pedido.id,
        "mensaje": "Solicitud de revocación registrada exitosamente conforme a la Disposición 954/2025.",
        "fecha": solicitud.fecha.isoformat()
    }

