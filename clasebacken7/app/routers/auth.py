"""
app/routers/auth.py
Endpoints de autenticación — montados en main.py con prefix="/auth".
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Header
from jose import JWTError, jwt as jose_jwt
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional

from app import models
from app.core.security import crear_token, hash_password, verificar_password
from app.core.config import settings
from app.dependencies import get_db, get_current_user, oauth2_scheme
from app.schemas.usuario import Token, UsuarioCreate, UsuarioOut, RefreshTokenRequest

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/register",
    response_model=UsuarioOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar usuario",
)
def register(payload: UsuarioCreate, db: Session = Depends(get_db)) -> UsuarioOut:
    if not payload.acepto_tratamiento:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debés aceptar el tratamiento de datos personales para registrarte (Ley 25.326, Art. 5).",
        )

    existe = db.query(models.Usuario).filter(
        models.Usuario.email == payload.email
    ).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta registrada con ese email.",
        )

    hashed = hash_password(payload.password)
    ahora_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    nuevo_usuario = models.Usuario(
        nombre=payload.nombre,
        email=payload.email,
        hashed_password=hashed,
        rol="customer",
        activo=True,
        acepto_tratamiento=payload.acepto_tratamiento,
        fecha_consentimiento=ahora_utc,
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario


@router.post(
    "/login",
    response_model=Token,
    summary="Iniciar sesión",
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == form_data.username
    ).first()

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


@router.post(
    "/refresh",
    response_model=Token,
    summary="Renovar access token",
)
def refresh(
    body: Optional[RefreshTokenRequest] = None,
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> Token:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token inválido o expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    raw_token = None
    if body and body.refresh_token:
        raw_token = body.refresh_token
    elif authorization and authorization.startswith("Bearer "):
        raw_token = authorization.split(" ")[1]

    if not raw_token:
        raise credentials_exception

    try:
        payload = jose_jwt.decode(
            raw_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        email: str | None = payload.get("sub")
        tipo: str | None = payload.get("type") or payload.get("tipo")

        if email is None or tipo != "refresh":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == email
    ).first()

    if not usuario or not usuario.activo:
        raise credentials_exception

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


@router.get(
    "/me",
    response_model=UsuarioOut,
    summary="Obtener usuario actual",
)
def me(current_user: models.Usuario = Depends(get_current_user)) -> UsuarioOut:
    return current_user
