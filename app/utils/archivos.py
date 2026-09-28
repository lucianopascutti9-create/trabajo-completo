"""
app/utils/archivos.py
Utilidades para validación segura de archivos subidos por el cliente.

Principio: nunca confiar en el nombre ni en el content-type declarado
por el cliente; siempre verificar los bytes reales (magic bytes / firma).
"""

# ---------------------------------------------------------------------------
# Firmas de bytes (magic bytes) de los formatos de imagen permitidos.
# ---------------------------------------------------------------------------
FIRMAS: tuple[bytes, ...] = (
    b"\xff\xd8\xff",           # JPEG / JPG
    b"\x89PNG\r\n\x1a\n",     # PNG
    b"RIFF",                   # WEBP  (los bytes 0-3 son RIFF; 8-11 serán WEBP)
)


def parece_imagen(contenido: bytes) -> bool:
    """
    Verifica si `contenido` comienza con alguna de las firmas conocidas.

    Retorna True si el archivo parece ser un JPEG, PNG o WEBP legítimo;
    False en cualquier otro caso (PDF disfrazado, ejecutable, etc.).

    Se usa `contenido.startswith(FIRMAS)` que acepta una tupla y evalúa
    cada elemento de forma eficiente sin recorrer el archivo completo.
    """
    return contenido.startswith(FIRMAS)
