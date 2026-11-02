"""
app/seed.py  —  Carga inicial de datos de demostración.
Regla: no pregunta antes de insertar, pero tampoco duplica.
Corre con:  python -m app.seed
Variables requeridas en el entorno (no en .env):
    DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
"""

import os
import sys
from datetime import datetime, timezone

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, Base
from app import models  # noqa: F401

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------------------------
# Productos de demo — solo los 2 productos solicitados
# ---------------------------------------------------------------------------

FLANES = [
    {
        "id": 1,
        "nombre": "Flan Clásico",
        "subtitulo": "El clásico porteño con abundante caramelo líquido dorado casero",
        "precio": 8500.0,
        "precio_final": 8500.0,
        "precio_anterior": 9500.0,
        "en_stock": True,
        "stock": 15,
        "categoria": "Clásicos",
        "categoria_id": 1,
        "badge": "Más Vendido ⭐",
        "rating": 4.9,
        "reviews_count": 142,
        "porciones": "6 - 8 porciones (1.2 kg)",
        "garantia_meses": 0,
        "cuotas_cantidad": 3,
        "cuotas_valor": 2833.33,
        "imagen": "/flan_clasico.jpg",
        "imagen_url": "/flan_clasico.jpg",
    },
    {
        "id": 2,
        "nombre": "Flan Chocolate",
        "subtitulo": "Exquisito flan de chocolate intenso con baño de caramelo fundente",
        "precio": 9800.0,
        "precio_final": 9800.0,
        "precio_anterior": 11000.0,
        "en_stock": True,
        "stock": 12,
        "categoria": "Especiales",
        "categoria_id": 2,
        "badge": "Favorito del Chef 🍫",
        "rating": 5.0,
        "reviews_count": 98,
        "porciones": "6 - 8 porciones (1.25 kg)",
        "garantia_meses": 0,
        "cuotas_cantidad": 3,
        "cuotas_valor": 3266.66,
        "imagen": "/flan_chocolate.jpg",
        "imagen_url": "/flan_chocolate.jpg",
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        _seed_productos(db)
        _seed_admin(db)
    finally:
        db.close()
    print("Seed listo.")


def _seed_productos(db: Session):
    try:
        # Purgar productos que no estén en la nueva lista de 2 flanes
        target_ids = [item["id"] for item in FLANES]
        # Primero eliminar referencias dependientes de productos que ya no existen
        productos_a_borrar = db.query(models.Producto).filter(~models.Producto.id.in_(target_ids)).all()
        for p in productos_a_borrar:
            db.query(models.ItemPedido).filter(models.ItemPedido.producto_id == p.id).delete()
            db.delete(p)
        db.commit()

        # Insertar o actualizar los 2 flanes
        for data in FLANES:
            existente = db.get(models.Producto, data["id"])
            if existente is None:
                db.add(models.Producto(**data))
            else:
                for k, v in data.items():
                    setattr(existente, k, v)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error en _seed_productos: {e}")


def _seed_admin(db: Session):
    email = os.environ.get("SEED_ADMIN_EMAIL")
    password = os.environ.get("SEED_ADMIN_PASSWORD")
    if not email or not password:
        print("  [seed] Sin SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD — omitiendo admin.")
        return
    existente = db.query(models.Usuario).filter_by(email=email).first()
    if existente is None:
        admin = models.Usuario(
            nombre="Admin",
            email=email,
            hashed_password=pwd_context.hash(password),
            activo=True,
            rol="admin",
            acepto_tratamiento=True,
            fecha_consentimiento=datetime.now(timezone.utc),
        )
        db.add(admin)
        db.commit()
        print(f"  [seed] Admin creado: {email}")
    else:
        print(f"  [seed] Admin ya existe: {email}")


if __name__ == "__main__":
    seed()
