"""Security utilities for password verification."""


def verify_password(plain_password: str, stored_password: str) -> bool:
    """Verify a password against stored password (plain text comparison)."""
    return plain_password == stored_password


def get_password_hash(password: str) -> str:
    """Return password as-is (no hashing)."""
    return password
