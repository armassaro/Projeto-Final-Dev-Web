import bcrypt

BCRYPT_MAX_BYTES = 72


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    return hashed.decode()


def verify_password(password: str, password_hash: str) -> bool:
    password_bytes = password.encode()
    if len(password_bytes) > BCRYPT_MAX_BYTES:
        return False
    return bcrypt.checkpw(password_bytes, password_hash.encode())
