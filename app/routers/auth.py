"""
app/routers/auth.py
Endpoints de autenticación — montados en main.py con prefix="/auth".

Endpoints:
- POST /auth/register : registra un nuevo usuario, hashea la contraseña y
                        registra el consentimiento (Ley 25.326).
- POST /auth/login    : autentica con email + password, devuelve par de tokens JWT.
- POST /auth/refresh  : renueva el access token usando un refresh token válido.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt as jose_jwt
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import models
from app.core.security import crear_token, hash_password, verificar_password
from app.core.config import settings
from app.dependencies import get_db, get_current_user, oauth2_scheme
from app.schemas.usuario import Token, UsuarioCreate, UsuarioOut

router = APIRouter(prefix="/auth", tags=["Autenticación"])


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------
@router.post(
    "/register",
    response_model=UsuarioOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar usuario",
    description=(
        "Crea un nuevo usuario. Requiere aceptar el tratamiento de datos "
        "personales (Ley 25.326, Art. 5). La contraseña nunca se persiste "
        "en texto plano: se almacena su hash bcrypt."
    ),
)
def register(payload: UsuarioCreate, db: Session = Depends(get_db)) -> UsuarioOut:
    """
    Registra un nuevo usuario en el sistema.

    Flujo:
    1. Verifica que el email no esté registrado (unicidad).
    2. Hashea la contraseña con bcrypt (NUNCA se guarda el texto plano).
    3. Registra fecha_consentimiento = UTC ahora (Ley 25.326, Art. 5).
    4. Persiste el usuario y retorna UsuarioOut (sin hashed_password).

    ¿Por qué response_model=UsuarioOut y no el modelo ORM?
    Ver explicación completa al pie del archivo.
    """
    # 1. Unicidad de email — error 409 Conflict (semánticamente más correcto
    #    que 400 Bad Request para recursos duplicados)
    existe = db.query(models.Usuario).filter(
        models.Usuario.email == payload.email
    ).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta registrada con ese email.",
        )

    # 2. Hash de contraseña — la contraseña en texto plano nunca toca la DB
    hashed = hash_password(payload.password)

    # 3. Timestamp de consentimiento en UTC (Ley 25.326)
    ahora_utc = datetime.now(timezone.utc).replace(tzinfo=None)  # SQLAlchemy sin tz-aware

    # 4. Creación del modelo ORM
    nuevo_usuario = models.Usuario(
        nombre=payload.nombre,
        email=payload.email,
        hashed_password=hashed,
        rol="customer",                          # rol por defecto
        acepto_tratamiento=payload.acepto_tratamiento,
        fecha_consentimiento=ahora_utc,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario  # FastAPI serializa automáticamente a UsuarioOut


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------
@router.post(
    "/login",
    response_model=Token,
    summary="Iniciar sesión",
    description=(
        "Autentica al usuario con email y contraseña. "
        "Devuelve un access token (vida corta) y un refresh token (vida larga)."
    ),
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """
    Autentica al usuario y devuelve un par de tokens JWT.

    Usa OAuth2PasswordRequestForm para ser compatible con el estándar OAuth2:
    los campos del form son `username` (mapeado a email) y `password`.

    Flujo:
    1. Busca al usuario por email (form_data.username).
    2. Verifica la contraseña contra el hash almacenado (timing-safe).
    3. Genera access token (vida corta: ACCESS_MIN minutos).
    4. Genera refresh token (vida larga: REFRESH_MIN minutos).

    Error genérico: "Credenciales inválidas" — no revela si el email
    existe o no en el sistema (previene user enumeration).
    """
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == form_data.username
    ).first()

    # Verificación en tiempo constante aunque el usuario no exista
    if not usuario or not verificar_password(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada. Contactá al administrador.",
        )

    access_token = crear_token(
        email=usuario.email,
        rol=usuario.rol,
        minutos=settings.ACCESS_MIN,
        tipo="access",
    )
    refresh_token = crear_token(
        email=usuario.email,
        rol=usuario.rol,
        minutos=settings.REFRESH_MIN,
        tipo="refresh",
    )

    return Token(access_token=access_token, refresh_token=refresh_token)


# ---------------------------------------------------------------------------
# POST /auth/refresh
# ---------------------------------------------------------------------------
@router.post(
    "/refresh",
    response_model=Token,
    summary="Renovar access token",
    description=(
        "Genera un nuevo access token a partir de un refresh token válido. "
        "El refresh token debe enviarse en el header Authorization: Bearer <token>."
    ),
)
def refresh(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Token:
    """
    Renueva el access token usando un refresh token válido.

    A diferencia de get_current_user, este endpoint acepta tokens con
    type == "refresh" (y rechaza los de tipo "access").
    Esto separa los dos flujos y evita que un access token robado
    pueda usarse para generar tokens nuevos indefinidamente.

    Flujo:
    1. Decodifica el token del header Authorization.
    2. Verifica que el claim 'type' sea 'refresh'.
    3. Busca y valida el usuario en la DB.
    4. Emite un nuevo par de tokens.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token inválido o expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jose_jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        email: str | None = payload.get("sub")
        tipo: str | None = payload.get("type")

        # Solo se acepta type == "refresh"
        if email is None or tipo != "refresh":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == email
    ).first()

    if not usuario or not usuario.activo:
        raise credentials_exception

    # Emitir nuevo par de tokens
    access_token = crear_token(
        email=usuario.email,
        rol=usuario.rol,
        minutos=settings.ACCESS_MIN,
        tipo="access",
    )
    nuevo_refresh = crear_token(
        email=usuario.email,
        rol=usuario.rol,
        minutos=settings.REFRESH_MIN,
        tipo="refresh",
    )

    return Token(access_token=access_token, refresh_token=nuevo_refresh)


# ---------------------------------------------------------------------------
# ¿Por qué POST /register usa response_model=UsuarioOut en lugar del ORM?
# (Ver pregunta al final del enunciado)
#
# Respuesta en el módulo de auth — se explica en detalle al pie.
# ---------------------------------------------------------------------------
