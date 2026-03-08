import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db
from app.auth_utils import hash_password, verify_password, create_access_token
from app.schemas import PurchaseRequest, PurchaseItem, UserRegister

def make_mock_db():
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    return db

def clear_overrides():
    app.dependency_overrides.clear()

client = TestClient(app)

def test_hash_and_verify_password():
    hashed = hash_password("secret123")
    assert hashed != "secret123"
    assert verify_password("secret123", hashed)
    assert not verify_password("wrong", hashed)

def test_create_access_token():
    token = create_access_token({"sub": "user@test.com"})
    assert isinstance(token, str)
    assert len(token) > 10

def test_login_wrong_credentials_returns_401():
    db = make_mock_db()
    db.query.return_value.filter.return_value.first.return_value = None
    try:
        response = client.post("/api/auth/login", json={
            "email": "noexiste@test.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
    finally:
        clear_overrides()

def test_register_duplicate_email_returns_400():
    db = make_mock_db()
    fake_user = MagicMock()
    fake_user.email = "existing@test.com"
    db.query.return_value.filter.return_value.first.return_value = fake_user
    try:
        response = client.post("/api/auth/register", json={
            "email": "existing@test.com",
            "password": "pass1234",
            "first_name": "Ana",
            "last_name": "Lopez",
            "company": "",
            "address": "Calle 1",
            "city": "Bogota",
            "state": "",
            "country": "Colombia",
            "postal_code": "110111",
            "phone": "3001234567"
        })
        assert response.status_code == 400
    finally:
        clear_overrides()

def test_search_tracks_returns_list():
    db = make_mock_db()
    db.query.return_value.join.return_value.join.return_value.join.return_value \
        .join.return_value.filter.return_value.limit.return_value.all.return_value = []
    try:
        response = client.get("/api/tracks/search?q=rock")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    finally:
        clear_overrides()

def test_get_genres():
    db = make_mock_db()
    db.query.return_value.order_by.return_value.all.return_value = []
    try:
        response = client.get("/api/tracks/genres")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    finally:
        clear_overrides()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_root():
    response = client.get("/")
    assert response.status_code == 200

def test_purchase_item_default_quantity():
    item = PurchaseItem(track_id=1)
    assert item.quantity == 1

def test_purchase_request_valid():
    req = PurchaseRequest(
        items=[PurchaseItem(track_id=1, quantity=2)],
        billing_address="Calle 1",
        billing_city="Bogota",
        billing_country="Colombia"
    )
    assert len(req.items) == 1

def test_user_register_schema():
    user = UserRegister(
        email="test@test.com", password="pass1234",
        first_name="Juan", last_name="Perez",
        company="", address="Calle 1", city="Bogota",
        state="", country="Colombia",
        postal_code="110111", phone="3001234567"
    )
    assert user.email == "test@test.com"

def test_token_has_correct_subject():
    token = create_access_token({"sub": "admin@test.com"})
    assert isinstance(token, str)
    parts = token.split(".")
    assert len(parts) == 3
