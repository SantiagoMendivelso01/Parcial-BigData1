from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth_utils import hash_password, verify_password, create_access_token, get_current_user
from datetime import datetime

router = APIRouter()


@router.post("/register", response_model=schemas.Token)
def register(data: schemas.UserRegister, db: Session = Depends(get_db)):
    if db.query(models.AppUser).filter(models.AppUser.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create Chinook customer record linked to app user
    customer = models.Customer(
        FirstName=data.first_name,
        LastName=data.last_name,
        Email=data.email,
    )
    db.add(customer)
    db.flush()

    user = models.AppUser(
        email=data.email,
        hashed_password=hash_password(data.password),
        role="user",
        customer_id=customer.CustomerId,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.AppUser).filter(models.AppUser.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.AppUser = Depends(get_current_user)):
    return current_user
