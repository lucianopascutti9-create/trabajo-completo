"""
app/routers/usuarios.py
Endpoints de gestión de datos personales — montados en main.py con prefix="/usuarios".

Endpoints:
- GET  /usuarios/me/datos   : acceso a datos propios (Ley 25.326, Art. 14).
- GET  /usuarios/me/exportar: exportar datos en archivo descargable (Art. 14).
- DELETE /usuarios/me       : anonimizar y dar de baja la cuenta (Art. 6 y 16).

Base legal:
- Ley 25.326, Art. 14 : derecho de acceso a los propios datos personales.
- Ley 25.326, Art. 6  : datos deben destruirse cuando dejaron de ser necesarios.
- Ley 25.326, Art. 16 : derecho de rectificación, actualización y supresión.
"""

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app import models
from app.core.security import hash_password
from app.dependencies import get_db, get_current_user

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


# ---------------------------------------------------------------------------
# Helper: construir el payload de datos personales del usuario
# ---------------------------------------------------------------------------
def _construir_datos_personales(usuario: models.Usuario) -> dict:
    """
    Arma el diccionario con el perfil, consentimiento y pedidos del usuario.
    Utilizado por GET /me/datos y GET /me/exportar para evitar duplicación.

    Los datos retornados son los mínimos necesarios (principio de minimización,
    compatible con el espíritu del Art. 4, Ley 25.326).
    """
    pedidos_data = []
    for pedido in usuario.pedidos:
        items_data = [
            {
                "producto_id": item.producto_id,
                "cantidad": item.cantidad,
                "precio_unit": item.precio_unit,
            }
            for item in pedido.items
        ]
        pedidos_data.append(
            {
                "id": pedido.id,
                "estado": pedido.estado,
                "total": pedido.total,
                "creado_en": pedido.creado_en.isoformat() if pedido.creado_en else None,
                "items": items_data,
            }
        )

    return {
        "perfil": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol,
            "activo": usuario.activo,
        },
        "consentimiento": {
            "acepto_tratamiento": usuario.acepto_tratamiento,
            "fecha_consentimiento": (
                usuario.fecha_consentimiento.isoformat()
                if usuario.fecha_consentimiento
                else None
            ),
            "base_legal": "Ley 25.326, Art. 5 — consentimiento libre, expreso e informado.",
        },
        "pedidos": pedidos_data,
    }


# ---------------------------------------------------------------------------
# GET /usuarios/me/datos
# Derecho de acceso a los propios datos — Ley 25.326, Art. 14
# ---------------------------------------------------------------------------
@router.get(
    "/me/datos",
    status_code=status.HTTP_200_OK,
    summary="Ver mis datos personales",
    description=(
        "Retorna el perfil, consentimiento y pedidos del usuario autenticado. "
        "Base legal: Ley 25.326, Art. 14 — derecho de acceso a los propios datos."
    ),
)
def obtener_mis_datos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
) -> dict:
    """
    Devuelve todos los datos personales del usuario autenticado en formato JSON.

    El usuario puede consultar en cualquier momento qué información tiene
    registrada el sistema sobre su persona (Art. 14, Ley 25.326).
    """
    return _construir_datos_personales(current_user)


# ---------------------------------------------------------------------------
# GET /usuarios/me/exportar
# Exportación de datos personales — Ley 25.326, Art. 14
# ---------------------------------------------------------------------------
@router.get(
    "/me/exportar",
    status_code=status.HTTP_200_OK,
    summary="Exportar mis datos personales",
    description=(
        "Descarga los datos personales del usuario autenticado como archivo JSON. "
        "El header Content-Disposition fuerza la descarga en el navegador. "
        "Base legal: Ley 25.326, Art. 14."
    ),
)
def exportar_mis_datos(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
) -> Response:
    """
    Retorna los datos personales como archivo JSON descargable.

    El header 'Content-Disposition: attachment' instruye al navegador a
    descargar el archivo en lugar de renderizarlo, facilitando al usuario
    guardar una copia de su información (portabilidad de datos).
    """
    datos = _construir_datos_personales(current_user)
    json_bytes = json.dumps(datos, indent=2, ensure_ascii=False).encode("utf-8")

    nombre_archivo = f"mis_datos_culto_al_flan_{current_user.id}.json"

    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo}"'
        },
    )


# ---------------------------------------------------------------------------
# DELETE /usuarios/me
# Anonimización y baja de cuenta — Ley 25.326, Arts. 6 y 16
# ---------------------------------------------------------------------------
@router.delete(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Eliminar mi cuenta (anonimización)",
    description=(
        "Anonimiza los datos personales del usuario: reemplaza nombre, email y "
        "contraseña con valores neutros, y desactiva la cuenta con fecha_baja. "
        "El registro contable de pedidos se conserva por obligación legal. "
        "Base legal: Ley 25.326, Arts. 6 y 16."
    ),
)
def eliminar_mi_cuenta(
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
) -> dict:
    """
    Anonimiza la cuenta del usuario autenticado.

    ¿Por qué anonimizar en lugar de borrar físicamente?
    Los pedidos contienen información contable (totales, precios) que puede
    estar sujeta a obligaciones de conservación (AFIP, Ley 19.550). La
    anonimización desvincula al individuo de sus registros sin eliminar
    los datos de negocio necesarios.

    Campos anonimizados:
    - nombre        → "USUARIO_ANONIMIZADO"
    - email         → "anonimizado_{id}@cultoalflan.invalid"
    - hashed_password → hash de UUID aleatorio (inutilizable para login)
    - activo        → False (la cuenta no puede usarse)
    - fecha_baja    → UTC ahora (registro del momento de baja)
    """
    import uuid

    ahora_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    current_user.nombre          = "USUARIO_ANONIMIZADO"
    current_user.email           = f"anonimizado_{current_user.id}@cultoalflan.invalid"
    current_user.hashed_password = hash_password(str(uuid.uuid4()))  # hash inutilizable
    current_user.activo          = False
    current_user.fecha_baja      = ahora_utc

    db.commit()

    return {
        "detail": (
            "Cuenta anonimizada exitosamente. "
            "Tus datos personales fueron eliminados del sistema. "
            "(Ley 25.326, Arts. 6 y 16)"
        )
    }
