"""
app/routers/usuarios.py
Endpoints para el ejercicio de derechos sobre datos personales (Ley 25.326)
y gestión de cuenta de usuario.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
import json

from app.dependencies import get_db, get_current_user
from app.models import Usuario, Pedido, SolicitudRevocacion

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/me")
def obtener_mis_datos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Devuelve todos los datos que el sistema almacena sobre el usuario actual,
    conforme al Derecho de Acceso (Art. 14, Ley 25.326 de Protección de Datos Personales).
    Incluye:
    - Datos personales y de cuenta
    - Fecha en que otorgó el consentimiento informado
    - Historial completo de pedidos
    - Historial de solicitudes de revocación / arrepentimiento
    """
    pedidos = (
        db.query(Pedido)
        .filter(Pedido.usuario_id == current_user.id)
        .order_by(Pedido.id.desc())
        .all()
    )

    solicitudes = (
        db.query(SolicitudRevocacion)
        .filter(SolicitudRevocacion.usuario_id == current_user.id)
        .order_by(SolicitudRevocacion.id.desc())
        .all()
    )

    pedidos_data = []
    for p in pedidos:
        items = []
        for it in p.items:
            items.append({
                "id": it.id,
                "producto_id": it.producto_id,
                "nombre": it.producto.nombre if it.producto else f"Producto #{it.producto_id}",
                "cantidad": it.cantidad,
                "precio_unit": it.precio_unit,
            })
        pedidos_data.append({
            "id": p.id,
            "total": p.total,
            "estado": p.estado,
            "creado_en": p.creado_en.isoformat() if p.creado_en else None,
            "codigo_revocacion": p.codigo_revocacion,
            "items": items,
        })

    solicitudes_data = []
    for s in solicitudes:
        solicitudes_data.append({
            "id": s.id,
            "codigo": s.codigo,
            "pedido_id": s.pedido_id,
            "fecha": s.fecha.isoformat() if s.fecha else None,
            "motivo": s.motivo,
        })

    return {
        "id": current_user.id,
        "nombre": current_user.nombre,
        "email": current_user.email,
        "rol": current_user.rol,
        "activo": current_user.activo,
        "acepto_tratamiento": current_user.acepto_tratamiento,
        "fecha_consentimiento": current_user.fecha_consentimiento.isoformat() if current_user.fecha_consentimiento else None,
        "pedidos": pedidos_data,
        "solicitudes_revocacion": solicitudes_data,
    }


@router.get("/me/exportar")
def exportar_mis_datos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Exportación de datos personales en formato JSON (Portabilidad de datos).
    Requiere autenticación con Token Bearer. Si se invoca sin cabecera (p. ej. mediante <a href>),
    FastAPI rechaza automáticamente con 401 Unauthorized.
    """
    datos = obtener_mis_datos(db=db, current_user=current_user)
    contenido = json.dumps(datos, indent=2, ensure_ascii=False)

    return Response(
        content=contenido,
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=mis-datos-usuario-{current_user.id}.json"
        },
    )


@router.delete("/me", status_code=status.HTTP_200_OK)
def eliminar_mi_cuenta(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Derecho de Supresión / Cancelación (Art. 16, Ley 25.326).
    Elimina o anonimiza los datos personales identificatorios (nombre, email, contraseña),
    desactiva la cuenta y conserva los registros contables de compras disociados de datos personales.
    """
    user_id = current_user.id

    # Anonimizar datos identificatorios
    current_user.nombre = "Usuario Anonimizado"
    current_user.email = f"anonimo_{user_id}_{int(datetime.utcnow().timestamp())}@eliminado.local"
    current_user.hashed_password = "DELETED_ACCOUNT"
    current_user.activo = False
    current_user.acepto_tratamiento = False
    current_user.fecha_consentimiento = None

    db.commit()

    return {
        "mensaje": "Tu cuenta ha sido eliminada y tus datos personales han sido suprimidos correctamente conforme a la Ley 25.326.",
        "usuario_id": user_id,
        "estado": "eliminado"
    }
