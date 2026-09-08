"""
app/routers/pedidos.py
Endpoints para creación de pedidos y consulta de historial de compras.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.models import Usuario, Producto, Pedido, ItemPedido
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
    nuevo_pedido = Pedido(
        usuario_id=current_user.id,
        total=total_calculado,
        estado="confirmado"
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
                items=items_out
            )
        )

    return resultado
