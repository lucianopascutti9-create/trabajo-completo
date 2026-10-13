"""
app/database.py
Configuración de la conexión a PostgreSQL con SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

# ---------------------------------------------------------------------------
# Cadena de conexión — leída desde settings (app/core/config.py → .env).
# Copiá el archivo .env.example como .env y completá tus credenciales.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Engine — objeto central que gestiona la conexión con la base de datos.
# ---------------------------------------------------------------------------

# Forzar el driver psycopg2 explícitamente para evitar que SQLAlchemy 2.x
# intente usar psycopg v3 (que no está instalado).
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
elif _db_url.startswith("postgres://"):
    # Render a veces devuelve "postgres://" (sin ql)
    _db_url = _db_url.replace("postgres://", "postgresql+psycopg2://", 1)

engine = create_engine(_db_url)


# ---------------------------------------------------------------------------
# SessionLocal — fábrica de sesiones.
# autocommit=False → los commits deben ser explícitos (db.commit()).
# autoflush=False  → evita flushes automáticos antes de cada query.
# ---------------------------------------------------------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ---------------------------------------------------------------------------
# Base declarativa — todas las clases ORM (modelos) heredan de aquí.
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# get_db — generador de sesión para inyección de dependencias en FastAPI.
# ---------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
