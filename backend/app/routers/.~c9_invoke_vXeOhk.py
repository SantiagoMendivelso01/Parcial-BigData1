from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.auth_utils import get_current_user

router = APIRouter()


@router.post("/purchase", response_model=schemas.InvoiceOut)
def purchase(
    data: schemas.PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: models.AppUser = Depends(get_current_user)
):
    if not current_user.customer_id:
        raise HTTPException(status_code=400, detail="No customer profile linked to your account")

    if not data.items:
        raise HTTPException(status_code=400, detail="No items in purchase")

    total = 0.0
    invoice_lines = []

    for item in data.items:
        track = db.query(models.Track).filter(models.Track.TrackId == item.track_id).first()
        if not track:
            raise HTTPException(status_code=404, detail=f"Track {item.track_id} not found")
        line_total = track.UnitPrice + item.quantity
        total += line_total
        invoice_lines.append({"track": track, "quantity": item.quantity, "unit_price": track.UnitPrice})

    invoice = models.Invoice(
        CustomerId=current_user.customer_id,
        InvoiceDate=datetime.utcnow(),
        BillingAddress=data.billing_address,
        BillingCity=data.billing_city,
        BillingCountry=data.billing_country,
        Total=round(total, 2),
    )
    db.add(invoice)
    db.flush()

    lines_out = []
    for line in invoice_lines:
        il = models.InvoiceLine(
            InvoiceId=invoice.InvoiceId,
            TrackId=line["track"].TrackId,
            UnitPrice=line["unit_price"],
            Quantity=line["quantity"],
        )
        db.add(il)
        db.flush()
        lines_out.append(schemas.InvoiceLineOut(
            InvoiceLineId=il.InvoiceLineId,
            TrackId=il.TrackId,
            UnitPrice=il.UnitPrice,
            Quantity=il.Quantity,
            track_name=line["track"].Name,
        ))

    db.commit()

    return schemas.InvoiceOut(
        InvoiceId=invoice.InvoiceId,
        InvoiceDate=invoice.InvoiceDate,
        Total=invoice.Total,
        BillingAddress=invoice.BillingAddress,
        BillingCity=invoice.BillingCity,
        BillingCountry=invoice.BillingCountry,
        items=lines_out,
    )


@router.get("/my", response_model=List[schemas.InvoiceOut])
def my_invoices(
    db: Session = Depends(get_db),
    current_user: models.AppUser = Depends(get_current_user)
):
    invoices = (
        db.query(models.Invoice)
        .filter(models.Invoice.CustomerId == current_user.customer_id)
        .order_by(models.Invoice.InvoiceDate.desc())
        .all()
    )
    result = []
    for inv in invoices:
        lines = db.query(models.InvoiceLine).filter(models.InvoiceLine.InvoiceId == inv.InvoiceId).all()
        lines_out = []
        for l in lines:
            track = db.query(models.Track).filter(models.Track.TrackId == l.TrackId).first()
            lines_out.append(schemas.InvoiceLineOut(
                InvoiceLineId=l.InvoiceLineId,
                TrackId=l.TrackId,
                UnitPrice=l.UnitPrice,
                Quantity=l.Quantity,
                track_name=track.Name if track else None,
            ))
        result.append(schemas.InvoiceOut(
            InvoiceId=inv.InvoiceId,
            InvoiceDate=inv.InvoiceDate,
            Total=inv.Total,
            BillingAddress=inv.BillingAddress,
            BillingCity=inv.BillingCity,
            BillingCountry=inv.BillingCountry,
            items=lines_out,
        ))
    return result
