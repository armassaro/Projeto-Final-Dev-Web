import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

TYPESAFE_API_KEY = os.getenv("TYPESAFE_API_KEY", "").strip()
TYPESAFE_BASE_URL = os.getenv("TYPESAFE_BASE_URL", "https://api.typesafe.ai").strip().rstrip("/")
TYPESAFE_MODEL = os.getenv("TYPESAFE_MODEL", "jev-latest").strip()
TYPESAFE_TIMEOUT_SECONDS = float(os.getenv("TYPESAFE_TIMEOUT_SECONDS", "15"))
TYPESAFE_MAX_RETRIES = int(os.getenv("TYPESAFE_MAX_RETRIES", "2"))
