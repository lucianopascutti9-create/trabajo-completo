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
engine = create_engine(settings.DATABASE_URL)

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

