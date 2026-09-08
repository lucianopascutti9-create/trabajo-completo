import sys
from app.database import engine, SessionLocal, Base
from app import models

flanes_data = [
  {
    "id": 1,
    "nombre": "Flan Mixto Tradicional",
    "subtitulo": "El clásico porteño con doble porción de dulce de leche colonial y crema chantilly artesanal",
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
    "imagen": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": 2,
    "nombre": "Flan de Dulce de Leche Volcánico",
    "subtitulo": "Masa cremosa elaborada íntegramente con dulce de leche repostero premium y corazón fundente",
    "precio": 9800.0,
    "precio_final": 9800.0,
    "precio_anterior": 11000.0,
    "en_stock": True,
    "stock": 9,
    "categoria": "De Autor",
    "categoria_id": 2,
    "badge": "Favorito del Chef 🍯",
    "rating": 5.0,
    "reviews_count": 98,
    "porciones": "6 - 8 porciones (1.3 kg)",
    "garantia_meses": 0,
    "cuotas_cantidad": 6,
    "cuotas_valor": 1633.33,
    "imagen": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": 3,
    "nombre": "Flan de Queso Mascarpone & Frutos Rojos",
    "subtitulo": "Inspiración italiana con queso mascarpone artesanal, reducción de frutos del bosque y caramelo cítrico",
    "precio": 10500.0,
    "precio_final": 10500.0,
    "precio_anterior": 12000.0,
    "en_stock": True,
    "stock": 6,
    "categoria": "De Autor",
    "categoria_id": 2,
    "badge": "Edición Gourmet ✨",
    "rating": 4.8,
    "reviews_count": 67,
    "porciones": "6 - 8 porciones (1.1 kg)",
    "garantia_meses": 0,
    "cuotas_cantidad": 3,
    "cuotas_valor": 3500.0,
    "imagen": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": 4,
    "nombre": "Flan Parisino de Chocolate Belga 70%",
    "subtitulo": "Cacao fino de aroma, chocolate amargo 70% belga y caramelo con infusión de café torrado",
    "precio": 11200.0,
    "precio_final": 11200.0,
    "precio_anterior": 12900.0,
    "en_stock": True,
    "stock": 8,
    "categoria": "Especiales",
    "categoria_id": 3,
    "badge": "Novedad 🍫",
    "rating": 4.9,
    "reviews_count": 53,
    "porciones": "6 - 8 porciones (1.25 kg)",
    "garantia_meses": 0,
    "cuotas_cantidad": 6,
    "cuotas_valor": 1866.66,
    "imagen": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": 5,
    "nombre": "Flan de Coco Tostado & Leche Condensada",
    "subtitulo": "Receta caribeña con leche de coco natural, finas hebras de coco tostado crocante y caramelo de caña",
    "precio": 9200.0,
    "precio_final": 9200.0,
    "precio_anterior": 10200.0,
    "en_stock": True,
    "stock": 11,
    "categoria": "Especiales",
    "categoria_id": 3,
    "badge": "Exótico 🥥",
    "rating": 4.7,
    "reviews_count": 41,
    "porciones": "6 - 8 porciones (1.15 kg)",
    "garantia_meses": 0,
    "cuotas_cantidad": 3,
    "cuotas_valor": 3066.66,
    "imagen": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": 6,
    "nombre": "Gran Banquete Familiar Culto (Flan XXL)",
    "subtitulo": "Versión monumental de 2.5 kg ideal para celebraciones, cumpleaños y grandes sobremesas domingueras",
    "precio": 16500.0,
    "precio_final": 16500.0,
    "precio_anterior": 18900.0,
    "en_stock": True,
    "stock": 5,
    "categoria": "Familiares",
    "categoria_id": 4,
    "badge": "Edición Familiar 👑",
    "rating": 5.0,
    "reviews_count": 84,
    "porciones": "14 - 18 porciones (2.5 kg)",
    "garantia_meses": 0,
    "cuotas_cantidad": 6,
    "cuotas_valor": 2750.0,
    "imagen": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"
  }
]

def seed():
    # Drop and recreate productos table to ensure columns match
    models.Producto.__table__.drop(bind=engine, checkfirst=True)
    models.Producto.__table__.create(bind=engine, checkfirst=True)
    
    db = SessionLocal()
    for item in flanes_data:
        prod = models.Producto(**item)
        db.add(prod)
    db.commit()
    db.close()
    print("Seed process finished! 6 flanes inserted into PostgreSQL.")

if __name__ == "__main__":
    seed()
