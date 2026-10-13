"""
Actividad Clase 2 - FastAPI + SQLAlchemy + PostgreSQL
Culto al Flan — E-commerce de postres tradicionales
Ley 24.240 de Defensa del Consumidor (Argentina)

Ejecutar con:
    uvicorn app.main:app --reload
"""

import os
from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import Base, engine, get_db
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
app.include_router(usuarios.router)

# Montar directorio estático para servir imágenes según el contrato DSI2 (/static/productos/...)
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
os.makedirs(os.path.join(static_dir, "productos"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Crear carpeta de uploads para imágenes subidas en producción
Path("uploads/productos").mkdir(parents=True, exist_ok=True)

# Montar /demo → app/static/demo (imágenes de demo que van en el repositorio)
_demo_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "demo")
os.makedirs(_demo_dir, exist_ok=True)
app.mount("/demo", StaticFiles(directory=_demo_dir), name="demo")


# ---------------------------------------------------------------------------
# Endpoint de salud — verifica que la aplicación y la base de datos responden
# ---------------------------------------------------------------------------

@app.get("/salud", tags=["Salud"])
def salud(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"estado": "ok", "base": "ok"}


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
