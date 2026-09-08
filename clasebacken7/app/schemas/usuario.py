"""
app/schemas/usuario.py
Schemas Pydantic para registro, autenticación y respuesta de usuarios.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator


class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    acepto_tratamiento: bool

    @field_validator("acepto_tratamiento")
    @classmethod
    def debe_aceptar_tratamiento(cls, v: bool) -> bool:
        if not v:
            raise ValueError(
                "Debés aceptar el tratamiento de datos personales "
                "para registrarte (Ley 25.326, Art. 5)."
            )
        return v


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str
    activo: bool = True
    acepto_tratamiento: bool = True
    fecha_consentimiento: datetime | None = None

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str
