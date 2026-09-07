"""
app/core/config.py
Configuración centralizada de la aplicación usando pydantic-settings.
Lee variables de entorno desde el archivo .env de la raíz del proyecto.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Clase de configuración de la aplicación.
    Cada campo se mapea automáticamente a una variable de entorno del mismo nombre.
    Si la variable no existe en el entorno, se usa el valor por defecto definido aquí.
    """

    PROJECT_NAME: str = "Culto al Flan — API"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost/ecommerce_db"
    CORS_ORIGINS: str = "http://localhost,http://localhost:3000,http://localhost:5173"

    @property
    def origins(self) -> list[str]:
        """
        Convierte el string CORS_ORIGINS (separado por comas) en una lista de strings.
        Elimina espacios vacíos alrededor de cada origen para evitar errores silenciosos.

        Ejemplo:
            "http://localhost, http://localhost:3000" → ["http://localhost", "http://localhost:3000"]
        """
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


# Instancia global — importar desde aquí en el resto de la aplicación:
#   from app.core.config import settings
settings = Settings()
