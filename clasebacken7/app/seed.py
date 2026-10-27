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
# Productos de demo — imagen_url apunta a /demo/<archivo>
# ---------------------------------------------------------------------------

FLANES = [
    {
        "id": 1,
        "nombre": "Flan de Vainilla Clásico",
        "subtitulo": "Receta tradicional con vainilla Bourbon, caramelo rubio y el sabor de siempre",
        "precio": 8500.0,
        "precio_final": 8500.0,
        "precio_anterior": 9500.0,
        "en_stock": True,
        "stock": 14,
        "categoria": "Clásicos",
        "categoria_id": 1,
        "badge": "Más Vendido ⭐",
        "rating": 4.9,
        "reviews_count": 142,
        "porciones": "6 - 8 porciones (1.2 kg)",
        "garantia_meses": 0,
        "cuotas_cantidad": 3,
        "cuotas_valor": 2833.33,
        "imagen_url": "/demo/flan_vainilla.jpg",
    },
    {
        "id": 2,
        "nombre": "Flan de Chocolate",
        "subtitulo": "Intenso cacao amargo con caramelo tostado y textura fundente irresistible",
        "precio": 9800.0,
        "precio_final": 9800.0,
        "precio_anterior": 11000.0,
        "en_stock": True,
        "stock": 10,
        "categoria": "Especiales",
        "categoria_id": 3,
        "badge": "Novedad 🍫",
        "rating": 5.0,
        "reviews_count": 98,
        "porciones": "6 - 8 porciones (1.3 kg)",
        "garantia_meses": 0,
        "cuotas_cantidad": 6,
        "cuotas_valor": 1633.33,
        "imagen_url": "/demo/flan_chocolate.jpg",
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
    # Borrar productos viejos que ya no están en la lista
    ids_actuales = [f["id"] for f in FLANES]
    db.query(models.Producto).filter(~models.Producto.id.in_(ids_actuales)).delete(synchronize_session="fetch")
    db.commit()

    for data in FLANES:
        existente = db.get(models.Producto, data["id"])
        if existente is None:
            db.add(models.Producto(**data))
        else:
            # Actualizar datos del producto existente
            for key, value in data.items():
                if key != "id":
                    setattr(existente, key, value)
    db.commit()
    print(f"  [seed] {len(FLANES)} productos cargados.")


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
