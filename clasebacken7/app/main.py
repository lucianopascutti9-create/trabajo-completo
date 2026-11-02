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
from fastapi.middleware.gzip import GZipMiddleware
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

# Sincronizar catálogo con los productos definidos
try:
    from app.seed import seed as run_seed
    run_seed()
except Exception as e:
    print(f"Advertencia al ejecutar seed al inicio: {e}")


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
    allow_origins=settings.origins if "*" not in settings.origins else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_middleware(GZipMiddleware, minimum_size=1000)


class StaticConCache(StaticFiles):
    async def get_response(self, path, scope):
        respuesta = await super().get_response(path, scope)
        if respuesta.status_code == 200:
            respuesta.headers["Cache-Control"] = "public, max-age=2592000, immutable"
        return respuesta


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(pedidos.router)
app.include_router(usuarios.router)

# Montar directorio estático para servir imágenes con encabezados de caché
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
os.makedirs(os.path.join(static_dir, "productos"), exist_ok=True)
Path("uploads/productos").mkdir(parents=True, exist_ok=True)

# Montar /static con StaticConCache (soporta tanto /static de archivos como uploads)
app.mount("/static", StaticConCache(directory=static_dir), name="static")

# Montar /demo → app/static/demo con StaticConCache
_demo_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "demo")
os.makedirs(_demo_dir, exist_ok=True)
app.mount("/demo", StaticConCache(directory=_demo_dir), name="demo")


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
