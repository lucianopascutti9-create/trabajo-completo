"""
app/dependencies.py
Dependencias de FastAPI inyectadas con Depends().

¿Por qué un archivo separado?
Centralizar las dependencias evita importar desde main.py y permite
reutilizarlas en cualquier router sin crear ciclos de importación.

Dependencias disponibles:
- get_db           : sesión SQLAlchemy por request (generador).
- get_current_user : extrae y valida el JWT del header Authorization.
- require_admin    : extiende get_current_user exigiendo rol == "admin".
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import SessionLocal
from app import models


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


# ---------------------------------------------------------------------------
# Esquema OAuth2 con Bearer token.
# tokenUrl apunta al endpoint de login; esto permite que FastAPI Docs (Swagger)
# muestre el botón "Authorize" y obtenga el token automáticamente al probar.
# ---------------------------------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ---------------------------------------------------------------------------
# get_current_user — valida el JWT del header Authorization: Bearer <token>
# ---------------------------------------------------------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Usuario:
    """
    Dependencia que valida el access token JWT y retorna el usuario activo.

    Flujo:
    1. FastAPI extrae el token del header 'Authorization: Bearer <token>'.
    2. python-jose decodifica y verifica la firma con la SECRET_KEY.
    3. Se comprueba que el claim 'type' sea 'access' (rechaza refresh tokens).
    4. Se busca el usuario por email (claim 'sub') en la base de datos.
    5. Se verifica que el usuario esté activo (activo == True).

    Si cualquier paso falla, se lanza HTTP 401 Unauthorized.
    El detalle del error es genérico ('credenciales inválidas') para no
    revelar si el token expiró, el usuario no existe, etc. (evita enumeración).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        email: str | None = payload.get("sub")
        tipo: str | None = payload.get("type")

        # Rechazar refresh tokens usados como access tokens
        if email is None or tipo != "access":
            raise credentials_exception

    except JWTError:
        # Cubre: firma inválida, token expirado, formato malformado
        raise credentials_exception

    usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()

    if usuario is None:
        raise credentials_exception

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada. Contactá al administrador.",
        )

    return usuario


# ---------------------------------------------------------------------------
# require_admin — extiende get_current_user exigiendo rol "admin"
# ---------------------------------------------------------------------------
def require_admin(
    current_user: models.Usuario = Depends(get_current_user),
) -> models.Usuario:
    """
    Dependencia que garantiza que el usuario autenticado tenga rol 'admin'.

    Patrón de composición de dependencias: require_admin depende de
    get_current_user, que a su vez depende de oauth2_scheme y get_db.
    FastAPI resuelve toda la cadena automáticamente con Depends().

    Si el usuario no es admin, se retorna HTTP 403 Forbidden (no 401):
    - 401 Unauthorized → no autenticado (sin token o token inválido).
    - 403 Forbidden    → autenticado pero sin permisos suficientes.
    Esta distinción es semánticamente correcta según RFC 7235/RFC 7231.
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol 'admin'.",
        )
    return current_user
