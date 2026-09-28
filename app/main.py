"""
Actividad Clase 2 - FastAPI + SQLAlchemy + PostgreSQL
Culto al Flan — E-commerce de postres tradicionales
Ley 24.240 de Defensa del Consumidor (Argentina)

Ejecutar con:
    uvicorn app.main:app --reload
"""

import pathlib

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app import models  # noqa: F401 — necesario para que Base registre los modelos
from app.core.config import settings
from app.routers import productos
from app.routers import auth
from app.routers import pedidos
from app.routers import usuarios

# ---------------------------------------------------------------------------
# Creación de tablas en PostgreSQL al iniciar la aplicación.
# SQLAlchemy compara los modelos ORM contra el esquema real y crea las tablas
# que no existan todavía. No modifica tablas existentes (para eso usaremos
# Alembic en la próxima etapa).
# ---------------------------------------------------------------------------
Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Directorio de archivos estáticos (imágenes subidas).
# Se crea al arrancar para que StaticFiles no falle si aún está vacío.
# ---------------------------------------------------------------------------
pathlib.Path("uploads").mkdir(exist_ok=True)
pathlib.Path("uploads/productos").mkdir(exist_ok=True)


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
app.include_router(pedidos.router)    # POST /pedidos/{id}/revocacion (Ley 24.240 / Disp. 954/2025)
app.include_router(usuarios.router)   # GET|DELETE /usuarios/me/...  (Ley 25.326)

# ---------------------------------------------------------------------------
# Archivos estáticos — imágenes de productos
# Montado DESPUÉS de los routers para que no interfiera con ningún endpoint.
# Las imágenes quedan accesibles en: GET /static/productos/<nombre>
# ---------------------------------------------------------------------------
app.mount("/static", StaticFiles(directory="uploads"), name="static")


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
