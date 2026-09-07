"""
app/core/security.py
Utilidades criptográficas centralizadas.

- hash_password / verificar_password  →  bcrypt a través de passlib
- crear_token                         →  JWT firmado con HS256 a través de python-jose

¿Por qué bcrypt?
bcrypt es el estándar recomendado para almacenar contraseñas: es lento por diseño
(factor de costo ajustable) y resistente a ataques de fuerza bruta y tablas arcoíris.
Nunca se almacena la contraseña en texto plano — Ley 25.326, Art. 9.
"""

from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# ---------------------------------------------------------------------------
# Contexto de hashing — bcrypt con actualización automática de esquemas viejos.
# deprecated="auto" hace que passlib re-hashee automáticamente hashes obsoletos
# la próxima vez que el usuario se loguee, sin intervención manual.
# ---------------------------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """
    Recibe la contraseña en texto plano y devuelve su hash bcrypt.

    Nunca se almacena el texto plano en la base de datos.
    El hash resultante incluye: algoritmo, factor de costo y salt (todo en un
    solo string), por lo que no es necesario guardar el salt por separado.
    """
    return pwd_context.hash(plain)


def verificar_password(plain: str, hashed: str) -> bool:
    """
    Compara la contraseña ingresada contra el hash almacenado en la DB.

    Devuelve True si coinciden, False si no.
    La comparación interna de passlib es timing-safe: tarda el mismo tiempo
    independientemente de si la contraseña es correcta o no, protegiéndose
    así contra timing attacks.
    """
    return pwd_context.verify(plain, hashed)


def crear_token(email: str, rol: str, minutos: int, tipo: str) -> str:
    """
    Genera un JWT firmado con la SECRET_KEY del settings.

    Claims incluidos en el payload:
    - sub   : email del usuario (claim estándar JWT — "subject")
    - rol   : "admin" | "customer"
    - type  : "access" | "refresh" — permite que el backend rechace un
              refresh token usado como access token y viceversa.
    - exp   : timestamp UTC de expiración (claim estándar JWT)

    Parámetros:
    - email   : identidad del usuario (usado como subject del token)
    - rol     : rol del usuario para autorización basada en roles (RBAC)
    - minutos : tiempo de vida del token en minutos
    - tipo    : "access" o "refresh"

    El token se firma con HMAC-SHA256 (HS256). La SECRET_KEY debe tener
    al menos 32 bytes de entropía en producción.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=minutos)
    payload = {
        "sub": email,
        "rol": rol,
        "type": tipo,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
