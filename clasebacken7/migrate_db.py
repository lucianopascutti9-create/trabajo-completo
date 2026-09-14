from app.database import engine, Base
from sqlalchemy import text
from app import models

def update_db():
    print("Migrating database...")
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP DEFAULT NOW();"))
        conn.execute(text("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS codigo_revocacion VARCHAR;"))
        conn.commit()
    
    # Create any missing tables (e.g. solicitudes_revocacion)
    Base.metadata.create_all(bind=engine)
    print("Database migration completed successfully!")

if __name__ == "__main__":
    update_db()
