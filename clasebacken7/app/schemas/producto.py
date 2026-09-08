"""
app/schemas/producto.py
Schemas Pydantic — contratos de entrada/salida de la API para Producto.
"""

from pydantic import BaseModel
from typing import Optional


class ProductoCreate(BaseModel):
    nombre: str
    precio_final: float = 0.0
    precio: Optional[float] = None
    precio_anterior: Optional[float] = None
    cuotas_cantidad: int = 3
    cuotas_valor: float = 0.0
    garantia_meses: int = 0
    stock: int = 10
    subtitulo: Optional[str] = None
    categoria: Optional[str] = "Flan Artesanal"
    badge: Optional[str] = None
    rating: Optional[float] = 5.0
    reviews_count: Optional[int] = 0
    porciones: Optional[str] = None
    imagen: Optional[str] = None
    en_stock: Optional[bool] = True
    categoria_id: Optional[int] = None


class ProductoOut(ProductoCreate):
    id: int

    model_config = {"from_attributes": True}
