from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Artist(Base):
    __tablename__ = "Artist"
    ArtistId = Column(Integer, primary_key=True, index=True)
    Name = Column(String(120))
    albums = relationship("Album", back_populates="artist")


class Album(Base):
    __tablename__ = "Album"
    AlbumId = Column(Integer, primary_key=True, index=True)
    Title = Column(String(160))
    ArtistId = Column(Integer, ForeignKey("Artist.ArtistId"))
    artist = relationship("Artist", back_populates="albums")
    tracks = relationship("Track", back_populates="album")


class Genre(Base):
    __tablename__ = "Genre"
    GenreId = Column(Integer, primary_key=True, index=True)
    Name = Column(String(120))


class MediaType(Base):
    __tablename__ = "MediaType"
    MediaTypeId = Column(Integer, primary_key=True, index=True)
    Name = Column(String(120))


class Track(Base):
    __tablename__ = "Track"
    TrackId = Column(Integer, primary_key=True, index=True)
    Name = Column(String(200))
    AlbumId = Column(Integer, ForeignKey("Album.AlbumId"))
    MediaTypeId = Column(Integer, ForeignKey("MediaType.MediaTypeId"))
    GenreId = Column(Integer, ForeignKey("Genre.GenreId"))
    Composer = Column(String(220))
    Milliseconds = Column(Integer)
    Bytes = Column(Integer)
    UnitPrice = Column(Float)
    album = relationship("Album", back_populates="tracks")
    genre = relationship("Genre")
    media_type = relationship("MediaType")


class Customer(Base):
    __tablename__ = "Customer"
    CustomerId = Column(Integer, primary_key=True, index=True)
    FirstName = Column(String(40))
    LastName = Column(String(20))
    Email = Column(String(60), unique=True)
    Phone = Column(String(24))
    Address = Column(String(70))
    City = Column(String(40))
    Country = Column(String(40))
    invoices = relationship("Invoice", back_populates="customer")


class Invoice(Base):
    __tablename__ = "Invoice"
    InvoiceId = Column(Integer, primary_key=True, index=True)
    CustomerId = Column(Integer, ForeignKey("Customer.CustomerId"))
    InvoiceDate = Column(DateTime)
    BillingAddress = Column(String(70))
    BillingCity = Column(String(40))
    BillingCountry = Column(String(40))
    Total = Column(Float)
    customer = relationship("Customer", back_populates="invoices")
    items = relationship("InvoiceLine", back_populates="invoice")


class InvoiceLine(Base):
    __tablename__ = "InvoiceLine"
    InvoiceLineId = Column(Integer, primary_key=True, index=True)
    InvoiceId = Column(Integer, ForeignKey("Invoice.InvoiceId"))
    TrackId = Column(Integer, ForeignKey("Track.TrackId"))
    UnitPrice = Column(Float)
    Quantity = Column(Integer)
    invoice = relationship("Invoice", back_populates="items")
    track = relationship("Track")


class AppUser(Base):
    __tablename__ = "AppUser"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))
    role = Column(String(20), default="user")  # "admin" or "user"
    customer_id = Column(Integer, ForeignKey("Customer.CustomerId"), nullable=True)
