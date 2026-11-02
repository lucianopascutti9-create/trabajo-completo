import sys
from app.database import engine, SessionLocal, Base
from app import models

flanes_data = [
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
    "imagen_url": "/flan_clasico.jpg"
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
    "imagen_url": "/flan_chocolate.jpg"
  }
]

def seed():
    db = SessionLocal()
    try:
        # Eliminar registros con dependencias en el orden correcto
        db.query(models.SolicitudRevocacion).delete()
        db.query(models.ItemPedido).delete()
        db.query(models.Pedido).delete()
        db.query(models.Producto).delete()
        db.commit()

        for item in flanes_data:
            prod = models.Producto(**item)
            db.add(prod)
        db.commit()
        print("Seed completado exitosamente: Solo 2 productos (Flan Clásico y Flan Chocolate).")
    except Exception as e:
        db.rollback()
        print(f"Error durante el seed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
