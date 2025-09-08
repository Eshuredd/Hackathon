from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    env: str = Field(default="development", alias="ENV")
    secret_key: str = Field(default="change-me", alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    database_url: str = Field(default="sqlite:///./grocery_scout.db", alias="DATABASE_URL")
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    broker_url: str = Field(default="redis://localhost:6379/1", alias="BROKER_URL")
    default_admin_email: str = Field(default="admin@example.com", alias="DEFAULT_ADMIN_EMAIL")
    default_admin_password: str = Field(default="admin123", alias="DEFAULT_ADMIN_PASSWORD")
    token_issuer: str = Field(default="grocery-scout-backend", alias="TOKEN_ISSUER")
    token_algorithm: str = Field(default="HS256")
    
    # Descope Configuration
    descope_project_id: str = Field(default="", alias="DESCOPE_PROJECT_ID")
    descope_management_key: str = Field(default="", alias="DESCOPE_MANAGEMENT_KEY")
    descope_public_key: str = Field(default="", alias="DESCOPE_PUBLIC_KEY")
    
    # OpenAI Configuration
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")

    # Frontend CORS - using string first, then converting
    frontend_origins_str: str = Field(default="http://localhost:3000,http://localhost:5173,http://localhost:8080", alias="FRONTEND_ORIGINS")
    
    @property
    def frontend_origins(self) -> List[str]:
        return [origin.strip() for origin in self.frontend_origins_str.split(',') if origin.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
