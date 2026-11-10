from functools import lru_cache
from typesafe_sdk import RetryPolicy, TypeSafeClient
import config


@lru_cache(maxsize=1)
def get_jev_client() -> TypeSafeClient:
    return TypeSafeClient(
        api_key=config.TYPESAFE_API_KEY,
        base_url=config.TYPESAFE_BASE_URL,
        model=config.TYPESAFE_MODEL,
        timeout=config.TYPESAFE_TIMEOUT_SECONDS,
        retry=RetryPolicy(max_retries=config.TYPESAFE_MAX_RETRIES),
    )
