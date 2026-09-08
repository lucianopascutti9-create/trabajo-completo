"""
app/schemas/pedido.py
Schemas Pydantic para el flujo de compras y pedidos.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ItemPedidoCreate(BaseModel):
    producto_id: int = Field(..., description="ID del producto")
    cantidad: int = Field(..., gt=0, description="Cantidad a comprar (mínimo 1)")


class PedidoCreate(BaseModel):
    items: List[ItemPedidoCreate] = Field(..., min_length=1, description="Lista de ítems a comprar")


class ItemPedidoOut(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unit: float
    nombre: Optional[str] = None

    model_config = {"from_attributes": True}


class PedidoOut(BaseModel):
    id: int
    usuario_id: int
    total: float
    estado: str
    items: List[ItemPedidoOut] = []

    model_config = {"from_attributes": True}
