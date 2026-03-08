from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/search", response_model=List[schemas.TrackSearch])
def search_tracks(
    q: Optional[str] = Query(None, description="Search by song name, artist, or genre"),
    genre: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = (
        db.query(
            models.Track.TrackId,
            models.Track.Name,
            models.Track.Composer,
            models.Track.UnitPrice,
            models.Track.Milliseconds,
            models.Genre.Name.label("GenreName"),
            models.Album.Title.label("AlbumTitle"),
            models.Artist.Name.label("ArtistName"),
        )
        .join(models.Album, models.Track.AlbumId == models.Album.AlbumId, isouter=True)
        .join(models.Artist, models.Album.ArtistId == models.Artist.ArtistId, isouter=True)
        .join(models.Genre, models.Track.GenreId == models.Genre.GenreId, isouter=True)
    )

    if q:
        query = query.filter(
            or_(
                models.Track.Name.ilike(f"%{q}%"),
                models.Artist.Name.ilike(f"%{q}%"),
                models.Genre.Name.ilike(f"%{q}%"),
            )
        )
    if genre:
        query = query.filter(models.Genre.Name.ilike(f"%{genre}%"))

    results = query.limit(50).all()
    return [
        schemas.TrackSearch(
            TrackId=r.TrackId,
            Name=r.Name,
            Composer=r.Composer,
            UnitPrice=r.UnitPrice,
            Milliseconds=r.Milliseconds,
            GenreName=r.GenreName,
            AlbumTitle=r.AlbumTitle,
            ArtistName=r.ArtistName,
        )
        for r in results
    ]


@router.get("/genres")
def get_genres(db: Session = Depends(get_db)):
    genres = db.query(models.Genre).all()
    return [{"GenreId": g.GenreId, "Name": g.Name} for g in genres]


@router.get("/{track_id}", response_model=schemas.TrackSearch)
def get_track(track_id: int, db: Session = Depends(get_db)):
    r = (
        db.query(
            models.Track.TrackId,
            models.Track.Name,
            models.Track.Composer,
            models.Track.UnitPrice,
            models.Track.Milliseconds,
            models.Genre.Name.label("GenreName"),
            models.Album.Title.label("AlbumTitle"),
            models.Artist.Name.label("ArtistName"),
        )
        .join(models.Album, models.Track.AlbumId == models.Album.AlbumId, isouter=True)
        .join(models.Artist, models.Album.ArtistId == models.Artist.ArtistId, isouter=True)
        .join(models.Genre, models.Track.GenreId == models.Genre.GenreId, isouter=True)
        .filter(models.Track.TrackId == track_id)
        .first()
    )
    if not r:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Track not found")
    return schemas.TrackSearch(
        TrackId=r.TrackId, Name=r.Name, Composer=r.Composer,
        UnitPrice=r.UnitPrice, Milliseconds=r.Milliseconds,
        GenreName=r.GenreName, AlbumTitle=r.AlbumTitle, ArtistName=r.ArtistName,
    )
