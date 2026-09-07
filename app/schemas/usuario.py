"""
app/schemas/usuario.py
Schemas Pydantic para registro, autenticación y respuesta de usuarios.

Separación modelo ORM ↔ schema Pydantic (principio fundamental):
- El modelo ORM (models.py) representa la tabla SQL y puede tener campos
  sensibles como hashed_password. El schema controla exactamente qué datos
  entran y salen de la API.
- UsuarioCreate valida la entrada del cliente; UsuarioOut define lo que
  la API devuelve — sin contraseña ni datos internos.

Ley 25.326 (Protección de Datos Personales, Argentina):
- UsuarioCreate exige que `acepto_tratamiento` sea True como condición
  de registro. Art. 5: el consentimiento debe ser libre, expreso e informado.
- UsuarioOut excluye `hashed_password` para que nunca se exponga por la API
  (Art. 9: deber de seguridad y confidencialidad de los datos).
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


class UsuarioCreate(BaseModel):
    """
    Schema de entrada para registrar un nuevo usuario.

    Campos:
    - nombre             : nombre completo del usuario.
    - email              : dirección de correo electrónico (validada por EmailStr).
    - password           : contraseña en texto plano — se hashea en el servicio,
                           NUNCA se persiste tal cual.
    - acepto_tratamiento : debe ser True; si es False se rechaza con ValueError.

    Validación Ley 25.326, Art. 5:
    El consentimiento para el tratamiento de datos personales debe ser
    libre, expreso e informado. Si el usuario no acepta, el registro
    se rechaza con un error descriptivo antes de tocar la DB.
    """

    nombre: str
    email: EmailStr
    password: str
    acepto_tratamiento: bool

    @field_validator("acepto_tratamiento")
    @classmethod
    def debe_aceptar_tratamiento(cls, v: bool) -> bool:
        """
        Rechaza el registro si el usuario no aceptó el tratamiento de datos.

        Cumple con el Art. 5 de la Ley 25.326: el consentimiento debe ser
        explícito; no puede asumirse ni ser inferido por omisión.
        Se ejecuta antes de cualquier escritura en la base de datos.
        """
        if not v:
            raise ValueError(
                "Debés aceptar el tratamiento de datos personales "
                "para registrarte (Ley 25.326, Art. 5)."
            )
        return v


class UsuarioOut(BaseModel):
    """
    Schema de salida para exponer datos de usuario por la API.

    Incluye deliberadamente solo los campos seguros:
    - id, nombre, email, rol, activo, acepto_tratamiento, fecha_consentimiento.

    ¿Por qué NO incluye hashed_password?
    Exponer el hash bcrypt en la respuesta HTTP violaría el principio de
    mínima exposición de datos (Art. 9, Ley 25.326). Aunque el hash no es
    la contraseña original, puede usarse en ataques de fuerza bruta offline
    y quedaría registrado en logs, proxies y caches del cliente.

    from_attributes = True (ex orm_mode): permite que Pydantic lea
    atributos de instancias ORM de SQLAlchemy directamente, en lugar de
    requerir un diccionario.
    """

    id: int
    nombre: str
    email: str
    rol: str
    activo: bool
    acepto_tratamiento: bool
    fecha_consentimiento: datetime | None

    model_config = {"from_attributes": True}


class Token(BaseModel):
    """
    Schema de respuesta para los endpoints /login y /refresh.

    Devuelve dos tokens JWT:
    - access_token  : vida corta (ACCESS_MIN). Se envía en el header
                      Authorization: Bearer <token> en cada request.
    - refresh_token : vida larga (REFRESH_MIN). Se usa SOLO para renovar
                      el access token; no autoriza operaciones de negocio.
    - token_type    : siempre "bearer" según el estándar OAuth2.
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
