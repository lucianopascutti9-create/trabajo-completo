"""
app/routers/pedidos.py
Endpoints de gestión de pedidos — montados en main.py con prefix="/pedidos".

Endpoints:
- POST /pedidos/{pedido_id}/revocacion : ejercer el derecho de arrepentimiento
                                         (Ley 24.240, Art. 34 / Disp. 954/2025).
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import models
from app.dependencies import get_db, get_current_user
from app.services import revocacion_service

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


# ---------------------------------------------------------------------------
# POST /pedidos/{pedido_id}/revocacion
# Botón de arrepentimiento — Ley 24.240, Art. 34 / Disposición 954/2025
# ---------------------------------------------------------------------------
@router.post(
    "/{pedido_id}/revocacion",
    status_code=status.HTTP_201_CREATED,
    summary="Ejercer derecho de arrepentimiento",
    description=(
        "Permite al usuario revocar una compra dentro de los 10 días corridos. "
        "Devuelve el código de la solicitud como comprobante. "
        "Base legal: Ley 24.240, Art. 34 / Disposición 954/2025."
    ),
)
def crear_revocacion(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user),
) -> dict:
    """
    Inicia el proceso de arrepentimiento de compra.

    Retorna:
        - codigo : comprobante único de la solicitud (ej. "REV-3F2A9C01").
        - detail : mensaje informativo para el consumidor.

    HTTP 201 → solicitud creada exitosamente.
    HTTP 404 → pedido no encontrado o no pertenece al usuario.
    HTTP 409 → pedido ya cancelado o fuera del plazo legal.
    """
    solicitud = revocacion_service.revocar(
        pedido_id=pedido_id,
        usuario=current_user,
        db=db,
    )

    return {
        "codigo": solicitud.codigo,
        "detail": (
            f"Revocación registrada exitosamente. "
            f"Guardá tu código de comprobante: {solicitud.codigo}. "
            f"(Ley 24.240, Art. 34 / Disp. 954/2025)"
        ),
    }
