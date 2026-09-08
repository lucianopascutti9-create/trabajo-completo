"""
Actividad Clase 2 - FastAPI + SQLAlchemy + PostgreSQL
Culto al Flan — E-commerce de postres tradicionales
Ley 24.240 de Defensa del Consumidor (Argentina)

Ejecutar con:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models  # noqa: F401 — necesario para que Base registre los modelos
from app.core.config import settings
from app.routers import productos
from app.routers import auth
from app.routers import pedidos

# ---------------------------------------------------------------------------
# Creación de tablas en PostgreSQL al iniciar la aplicación.
# SQLAlchemy compara los modelos ORM contra el esquema real y crea las tablas
# que no existan todavía. No modifica tablas existentes (para eso usaremos
# Alembic en la próxima etapa).
# ---------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# Inicialización de la aplicación
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API de productos de postres tradicionales — Actividad Clase 2",
    version="3.0.0",
)


# ---------------------------------------------------------------------------
# Configuración de CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(pedidos.router)


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
