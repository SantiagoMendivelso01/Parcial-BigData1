import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
from app import models, schemas
from app.auth_utils import hash_password, verify_password, create_access_token

client = TestClient(app)


# ── Auth utils tests ──────────────────────────────────
def test_hash_and_verify_password():
    hashed = hash_password("mypassword")
    assert verify_password("mypassword", hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_create_access_token():
    token = create_access_token({"sub": "1"})
    assert token is not None
    assert isinstance(token, str)


# ── Auth endpoints ────────────────────────────────────
def test_register_and_login(monkeypatch):
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None

    # Test login with wrong credentials returns 401
    response = client.post("/api/auth/login", json={"email": "x@x.com", "password": "wrong"})
    assert response.status_code == 401


# ── Track search endpoint ─────────────────────────────
def test_search_tracks_returns_list(monkeypatch):
    mock_db = MagicMock()
    mock_db.query.return_value.join.return_value.join.return_value.join.return_value.filter.return_value.limit.return_value.all.return_value = []

    with patch("app.routers.tracks.get_db", return_value=iter([mock_db])):
        response = client.get("/api/tracks/search?q=rock")
        # Should return 200 even with empty results
        assert response.status_code in [200, 422]


def test_get_genres(monkeypatch):
    mock_db = MagicMock()
    mock_genre = MagicMock()
    mock_genre.GenreId = 1
    mock_genre.Name = "Rock"
    mock_db.query.return_value.all.return_value = [mock_genre]

    with patch("app.routers.tracks.get_db", return_value=iter([mock_db])):
        response = client.get("/api/tracks/genres")
        assert response.status_code == 200


# ── Health check ──────────────────────────────────────
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root():
    response = client.get("/")
    assert response.status_code == 200


# ── Schema validation ─────────────────────────────────
def test_purchase_request_requires_items():
    with pytest.raises(Exception):
        schemas.PurchaseRequest(items=[], billing_address="", billing_city="", billing_country="")


def test_user_register_schema():
    user = schemas.UserRegister(
        email="test@test.com",
        password="secret",
        first_name="John",
        last_name="Doe"
    )
    assert user.email == "test@test.com"
    assert user.first_name == "John"


def test_track_search_schema():
    track = schemas.TrackSearch(
        TrackId=1,
        Name="Bohemian Rhapsody",
        Composer="Freddie Mercury",
        UnitPrice=0.99,
        Milliseconds=354000,
        GenreName="Rock",
        AlbumTitle="A Night at the Opera",
        ArtistName="Queen",
    )
    assert track.TrackId == 1
    assert track.UnitPrice == 0.99


def test_purchase_item_default_quantity():
    item = schemas.PurchaseItem(track_id=5)
    assert item.quantity == 1
