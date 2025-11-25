"""Basic health test for the API."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_health_check() -> None:
    """Ensure the service returns a healthy status."""
    response = client.get("/")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "TCE EduRide API"


def test_health_endpoint() -> None:
    """Test the dedicated health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "healthy"


def test_admin_login_success() -> None:
    """Test admin login with valid credentials."""
    response = client.post(
        "/api/v1/admin/login",
        json={"username": "admin", "password": "admin123"}
    )
    assert response.status_code == 200
    payload = response.json()
    assert "access_token" in payload
    assert payload["token_type"] == "bearer"


def test_admin_login_failure() -> None:
    """Test admin login with invalid credentials."""
    response = client.post(
        "/api/v1/admin/login",
        json={"username": "admin", "password": "wrong"}
    )
    assert response.status_code == 401
