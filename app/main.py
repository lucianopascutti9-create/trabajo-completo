"""
Actividad Clase 2 - FastAPI + Pydantic
Ley 24.240 de Defensa del Consumidor (Argentina)

Ejecutar con:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Inicialización de la aplicación
# ---------------------------------------------------------------------------

app = FastAPI(
    title="API Tienda Tech",
    description="API de productos de tecnología — Actividad Clase 2",
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# Modelo de datos — Pydantic
# ---------------------------------------------------------------------------

class Producto(BaseModel):
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


# ---------------------------------------------------------------------------
# Base de datos en memoria
# ---------------------------------------------------------------------------

productos_db: list[Producto] = [
    Producto(
        id=1,
        nombre="Notebook Lenovo IdeaPad 3 — AMD Ryzen 5 / 16 GB RAM / 512 GB SSD",
        precio_final=849_999.99,
        cuotas_cantidad=12,
        cuotas_valor=70_833.33,
        garantia_meses=12,
        stock=8,
    ),
    Producto(
        id=2,
        nombre="Smartphone Samsung Galaxy A55 5G — 128 GB / Negro",
        precio_final=524_999.00,
        cuotas_cantidad=6,
        cuotas_valor=87_499.83,
        garantia_meses=12,
        stock=15,
    ),
    Producto(
        id=3,
        nombre="Monitor LG UltraWide 29\" — Full HD IPS / 75 Hz",
        precio_final=389_499.50,
        cuotas_cantidad=3,
        cuotas_valor=129_833.17,
        garantia_meses=24,
        stock=4,
    ),
]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get(
    "/productos",
    response_model=list[Producto],
    summary="Listar productos",
    description="Devuelve la lista completa de productos disponibles en la tienda.",
)
def get_productos() -> list[Producto]:
    """Retorna todos los productos registrados en la base de datos en memoria."""
    return productos_db


@app.post(
    "/productos",
    response_model=Producto,
    status_code=201,
    summary="Agregar producto",
    description="Recibe un objeto Producto, lo agrega a la base de datos y lo retorna.",
)
def create_producto(producto: Producto) -> Producto:
    """
    Agrega un nuevo producto a la lista en memoria.

    - El cuerpo de la petición debe ser un JSON válido con todos los campos del modelo.
    - FastAPI/Pydantic se encargan de la validación automática.
    """
    productos_db.append(producto)
    return producto


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
