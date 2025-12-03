"""Bus management endpoints."""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import crud

router = APIRouter(prefix="/buses", tags=["bus"])


class BusCreate(BaseModel):
    """Schema for creating a new bus."""
    bus_number: str
    capacity: int
    model: str
    registration_number: str


class BusResponse(BaseModel):
    """Schema for bus response."""
    id: int
    bus_number: str
    capacity: int
    model: str
    registration_number: str
    status: str


class BusUpdate(BaseModel):
    """Schema for updating bus information."""
    bus_number: str
    capacity: int
    model: str
    registration_number: str


@router.get("/", response_model=list[BusResponse])
async def list_buses(db: Session = Depends(get_db)) -> list[BusResponse]:
    """List all buses registered in the system."""
    buses = crud.get_buses(db)
    return [
        BusResponse(
            id=b.id,
            bus_number=b.bus_number,
            capacity=b.capacity,
            model=b.model,
            registration_number=b.registration_number,
            status=b.status
        )
        for b in buses
    ]


@router.get("/{bus_id}", response_model=BusResponse)
async def get_bus(bus_id: int, db: Session = Depends(get_db)) -> BusResponse:
    """Get details of a specific bus."""
    bus = crud.get_bus(db, bus_id)
    if not bus:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bus not found")
    return BusResponse(
        id=bus.id,
        bus_number=bus.bus_number,
        capacity=bus.capacity,
        model=bus.model,
        registration_number=bus.registration_number,
        status=bus.status
    )


@router.post("/", response_model=BusResponse, status_code=status.HTTP_201_CREATED)
async def create_bus(bus: BusCreate, db: Session = Depends(get_db)) -> BusResponse:
    """Register a new bus in the system."""
    db_bus = crud.create_bus(
        db=db,
        bus_number=bus.bus_number,
        capacity=bus.capacity,
        model=bus.model,
        registration_number=bus.registration_number
    )
    return BusResponse(
        id=db_bus.id,
        bus_number=db_bus.bus_number,
        capacity=db_bus.capacity,
        model=db_bus.model,
        registration_number=db_bus.registration_number,
        status=db_bus.status
    )


@router.put("/{bus_id}", response_model=BusResponse)
async def update_bus(bus_id: int, bus: BusUpdate, db: Session = Depends(get_db)) -> BusResponse:
    """Update bus information."""
    # Check if bus exists
    existing = crud.get_bus(db, bus_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    # Check if bus_number is being changed and already exists
    if bus.bus_number != existing.bus_number:
        bus_exists = crud.get_bus_by_number(db, bus.bus_number)
        if bus_exists and bus_exists.id != bus_id:
            raise HTTPException(status_code=400, detail="Bus number already exists")
    
    # Check if registration_number is being changed and already exists
    if bus.registration_number != existing.registration_number:
        reg_exists = crud.get_bus_by_registration(db, bus.registration_number)
        if reg_exists and reg_exists.id != bus_id:
            raise HTTPException(status_code=400, detail="Registration number already exists")
    
    # Update bus
    updated_bus = crud.update_bus(
        db=db,
        bus_id=bus_id,
        bus_number=bus.bus_number,
        capacity=bus.capacity,
        model=bus.model,
        registration_number=bus.registration_number
    )
    
    if not updated_bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    return BusResponse(
        id=updated_bus.id,
        bus_number=updated_bus.bus_number,
        capacity=updated_bus.capacity,
        model=updated_bus.model,
        registration_number=updated_bus.registration_number,
        status=updated_bus.status
    )


@router.delete("/{bus_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bus(bus_id: int, db: Session = Depends(get_db)) -> None:
    """Remove a bus from the system."""
    if not crud.delete_bus(db, bus_id):
        raise HTTPException(status_code=404, detail="Bus not found")
