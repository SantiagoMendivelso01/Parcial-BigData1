from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    customer_id: Optional[int]
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ── Tracks ────────────────────────────────────────────
class GenreOut(BaseModel):
    GenreId: int
    Name: str
    
    model_config = ConfigDict(from_attributes=True)

class ArtistOut(BaseModel):
    ArtistId: int
    Name: str
    
    model_config = ConfigDict(from_attributes=True)

class TrackOut(BaseModel):
    TrackId: int
    Name: str
    Composer: Optional[str]
    UnitPrice: float
    Milliseconds: int
    genre: Optional[GenreOut]
    album: Optional[dict]
    
    model_config = ConfigDict(from_attributes=True)

class TrackSearch(BaseModel):
    TrackId: int
    Name: str
    Composer: Optional[str]
    UnitPrice: float
    Milliseconds: int
    GenreName: Optional[str]
    AlbumTitle: Optional[str]
    ArtistName: Optional[str]


# ── Purchase ──────────────────────────────────────────
class PurchaseItem(BaseModel):
    track_id: int
    quantity: int = 1

class PurchaseRequest(BaseModel):
    items: List[PurchaseItem]
    billing_address: str
    billing_city: str
    billing_country: str

class InvoiceLineOut(BaseModel):
    InvoiceLineId: int
    TrackId: int
    UnitPrice: float
    Quantity: int
    track_name: Optional[str]

class InvoiceOut(BaseModel):
    InvoiceId: int
    InvoiceDate: datetime
    Total: float
    BillingAddress: str
    BillingCity: str
    BillingCountry: str
    items: List[InvoiceLineOut] = []
    
    model_config = ConfigDict(from_attributes=True)
