"""
app/core/security.py
Utilidades criptográficas centralizadas.
"""

from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
import bcrypt

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    try:
        return pwd_context.hash(plain)
    except Exception:
        pwd_bytes = plain.encode('utf-8')
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def verificar_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        try:
            return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
        except Exception:
            return False


def crear_token(email: str, rol: str, minutos: int, tipo: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=minutos)
    payload = {
        "sub": email,
        "rol": rol,
        "type": tipo,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
