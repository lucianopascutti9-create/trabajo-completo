"""
app/dependencies.py
Dependencias de FastAPI inyectadas con Depends().

¿Por qué un archivo separado?
Centralizar las dependencias evita importar desde main.py
y permite reutilizarlas en cualquier router sin crear ciclos de importación.
"""

from app.database import SessionLocal


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
