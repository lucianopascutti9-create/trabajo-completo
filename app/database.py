"""
app/database.py
Configuración de la conexión a PostgreSQL con SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# ---------------------------------------------------------------------------
# Cadena de conexión
# Formato: postgresql://<user>:<password>@<host>/<db>
# Ajustá usuario y contraseña según tu instalación local de PostgreSQL.
# ---------------------------------------------------------------------------
DATABASE_URL = "postgresql://postgres:postgres@localhost/ecommerce_db"

# ---------------------------------------------------------------------------
# Engine — objeto central que gestiona la conexión con la base de datos.
# ---------------------------------------------------------------------------
engine = create_engine(DATABASE_URL)

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
# Dependencia get_db — inyectada en los endpoints con Depends(get_db).
#
# ¿Qué hace el `yield`?
# El código ANTES del yield se ejecuta cuando arranca el request: abre la
# sesión y la entrega al endpoint.  El código DESPUÉS del yield se ejecuta
# siempre al finalizar el request (incluso si ocurrió un error): cierra la
# sesión y devuelve la conexión al pool.  FastAPI maneja esto internamente
# a través de los "context managers" del sistema de dependencias, garantizando
# que ningún request deje una sesión abierta aunque el endpoint lance una
# excepción.
# ---------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db          # ← FastAPI entrega `db` al endpoint
    finally:
        db.close()        # ← siempre se ejecuta al terminar el request
