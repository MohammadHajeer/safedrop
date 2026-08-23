from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str
    test_database_url: str | None = None
    jwt_secret: str
    jwt_algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int
    drop_encryption_key: str

    storage_bucket: str
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_endpoint_url_s3: str
    aws_region: str

    test_storage_bucket: str | None = None
    test_aws_access_key_id: str | None = None
    test_aws_secret_access_key: str | None = None
    test_aws_endpoint_url_s3: str | None = None
    test_aws_region: str | None = None

    cookie_secure: bool = False
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
