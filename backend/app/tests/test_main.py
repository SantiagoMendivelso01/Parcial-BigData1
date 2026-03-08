import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.auth_utils import hash_password, verify_password, create_access_token
from app.schemas import PurchaseRequest, PurchaseItem, UserRegister, TrackSearch

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
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None
    with patch("app.routers.auth.get_db", return_value=iter([mock_db])):
        response = client.post("/api/auth/login", json={
            "email": "noexiste@test.com",
            "password": "wrongpass"
        })
    assert response.status_code == 401

def test_register_duplicate_email_returns_400():
    fake_user = MagicMock()
    fake_user.email = "existing@test.com"
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = fake_user
    with patch("app.routers.auth.get_db", return_value=iter([mock_db])):
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

def test_search_tracks_returns_list():
    mock_db = MagicMock()
    mock_db.query.return_value.join.return_value.join.return_value.join.return_value\
        .join.return_value.filter.return_value.limit.return_value.all.return_value = []
    with patch("app.routers.tracks.get_db", return_value=iter([mock_db])):
        response = client.get("/api/tracks/search?q=rock")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_genres():
    mock_db = MagicMock()
    mock_db.query.return_value.order_by.return_value.all.return_value = []
    with patch("app.routers.tracks.get_db", return_value=iter([mock_db])):
        response = client.get("/api/tracks/genres")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_root():
    response = client.get("/")
    assert response.status_code == 200

def test_purchase_request_requires_items():
    with pytest.raises(Exception):
        PurchaseRequest(items=[], billing_address="x", billing_city="x", billing_country="x")

def test_user_register_schema():
    user = UserRegister(
        email="test@test.com", password="pass1234",
        first_name="Juan", last_name="Perez",
        company="", address="Calle 1", city="Bogota",
        state="", country="Colombia",
        postal_code="110111", phone="3001234567"
    )
    assert user.email == "test@test.com"

def test_track_search_schema():
    ts = TrackSearch(q="rock", genre="Rock")
    assert ts.q == "rock"

def test_purchase_item_default_quantity():
    item = PurchaseItem(track_id=1)
    assert item.quantity == 1
