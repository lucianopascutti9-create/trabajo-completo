"""
app/schemas/__init__.py
Re-exporta los schemas de todos los módulos para mantener compatibilidad
con imports existentes que usaban `from app.schemas import ...`
"""

from app.schemas.producto import ProductoCreate, ProductoOut  # noqa: F401
from app.schemas.usuario import UsuarioCreate, UsuarioOut, Token  # noqa: F401
