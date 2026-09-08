"""
app/core/config.py
Configuración centralizada de la aplicación.
"""

import os

try:
    from pydantic_settings import BaseSettings
    class Settings(BaseSettings):
        PROJECT_NAME: str = "Culto al Flan — API"
        DATABASE_URL: str = "postgresql://postgres:lucben2009@localhost:5432/ecommerce_db"
        CORS_ORIGINS: str = "http://localhost,http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:3000"
        SECRET_KEY: str = "9f8a4b7c2d1e0f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a"
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
        REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080
        ACCESS_MIN: int = 30
        REFRESH_MIN: int = 10080

        @property
        def origins(self) -> list[str]:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

        model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}
except ImportError:
    from pydantic import BaseModel
    
    def _load_env():
        env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if k.strip() not in os.environ:
                            os.environ[k.strip()] = v.strip()

    _load_env()

    class Settings(BaseModel):
        PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Culto al Flan — API")
        DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:lucben2009@localhost:5432/ecommerce_db")
        CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost,http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:3000")
        SECRET_KEY: str = os.getenv("SECRET_KEY", "9f8a4b7c2d1e0f3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        REFRESH_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "10080"))
        ACCESS_MIN: int = int(os.getenv("ACCESS_MIN", "30"))
        REFRESH_MIN: int = int(os.getenv("REFRESH_MIN", "10080"))

        @property
        def origins(self) -> list[str]:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
