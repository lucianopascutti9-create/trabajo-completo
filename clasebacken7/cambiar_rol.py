"""
Script de utilidad para cambiar el rol de un usuario en PostgreSQL sin necesidad de abrir pgAdmin.
Uso:
    python cambiar_rol.py luciano@test.com admin
    python cambiar_rol.py luciano@test.com customer
"""
import sys
from app.database import SessionLocal
from app.models import Usuario

def cambiar_rol(email: str, nuevo_rol: str):
    db = SessionLocal()
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        print(f"Error: No se encontró el usuario con email: {email}")
        db.close()
        return

    usuario.rol = nuevo_rol
    db.commit()
    print(f"Éxito: El usuario {email} ahora tiene el rol: '{usuario.rol}'")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python cambiar_rol.py <email> <admin|customer>")
        print("Ejemplo: python cambiar_rol.py luciano@test.com admin")
    else:
        cambiar_rol(sys.argv[1], sys.argv[2])
