"""
app/services/revocacion_service.py
Capa de servicio para el derecho de arrepentimiento de compra.

Base legal:
- Ley 24.240, Art. 34  : revocación dentro de los 10 días corridos
                         desde la entrega del bien o celebración del contrato.
- Disposición 954/2025 : botón de arrepentimiento obligatorio en e-commerce.
"""

from datetime import datetime, timezone, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app import models


# Plazo legal máximo (días corridos) — Ley 24.240, Art. 34
PLAZO_REVOCACION_DIAS = 10


def revocar(
    pedido_id: int,
    usuario: models.Usuario,
    db: Session,
) -> models.SolicitudRevocacion:
    """
    Ejecuta el flujo completo del derecho de arrepentimiento de compra.

    Validaciones previas (fail-fast, antes de tocar la DB):
    1. El pedido existe y pertenece al usuario autenticado (404).
    2. El pedido no está ya cancelado (409).
    3. No superó el plazo de 10 días corridos (409).

    Transacción (try/except con rollback):
    - Devuelve el stock de cada ítem al producto correspondiente.
    - Marca el pedido como "cancelado".
    - Registra la SolicitudRevocacion con su código único.

    Manejo de datetime:
    Toda comparación usa datetime.now(timezone.utc) para evitar el error
    'can't compare offset-naive and offset-aware datetimes' de Python.
    La DB almacena sin tz (naive) → se convierte con replace(tzinfo=timezone.utc).
    """

    # ------------------------------------------------------------------
    # 1. Verificar existencia y titularidad del pedido
    # ------------------------------------------------------------------
    pedido: models.Pedido | None = (
        db.query(models.Pedido)
        .filter(
            models.Pedido.id == pedido_id,
            models.Pedido.usuario_id == usuario.id,
        )
        .first()
    )

    if pedido is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado o no pertenece al usuario autenticado.",
        )

    # ------------------------------------------------------------------
    # 2. Verificar que el pedido no esté ya cancelado
    # ------------------------------------------------------------------
    if pedido.estado == "cancelado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El pedido ya fue cancelado anteriormente.",
        )

    # ------------------------------------------------------------------
    # 3. Verificar plazo de 10 días corridos (Ley 24.240, Art. 34)
    # ------------------------------------------------------------------
    ahora_utc = datetime.now(timezone.utc)

    # creado_en viene de la DB como naive → lo tratamos como UTC
    if pedido.creado_en is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede determinar la fecha de creación del pedido.",
        )

    creado_en_utc = pedido.creado_en.replace(tzinfo=timezone.utc)
    dias_transcurridos = (ahora_utc - creado_en_utc).days

    if dias_transcurridos > PLAZO_REVOCACION_DIAS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"El plazo legal de {PLAZO_REVOCACION_DIAS} días corridos para "
                f"arrepentirse venció. Han pasado {dias_transcurridos} días "
                f"(Ley 24.240, Art. 34 / Disp. 954/2025)."
            ),
        )

    # ------------------------------------------------------------------
    # 4. Transacción: stock → cancelar → registrar solicitud
    # ------------------------------------------------------------------
    try:
        # 4a. Devolver stock de cada ítem al producto correspondiente
        for item in pedido.items:
            item.producto.stock += item.cantidad

        # 4b. Marcar el pedido como cancelado
        pedido.estado = "cancelado"

        # 4c. Registrar la solicitud de revocación
        solicitud = models.SolicitudRevocacion(
            pedido_id=pedido.id,
            usuario_id=usuario.id,
            # codigo se genera automáticamente por default=generar_codigo en el modelo
            creada_en=ahora_utc.replace(tzinfo=None),  # almacenar naive en la DB
        )
        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)

    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al procesar la revocación. Operación revertida.",
        ) from exc

    return solicitud
