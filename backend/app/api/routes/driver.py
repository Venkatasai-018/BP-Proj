"""Driver-related endpoints."""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password
from app.services import crud

router = APIRouter(prefix="/drivers", tags=["driver"])


class DriverLoginRequest(BaseModel):
    """Driver login credentials."""
    email: EmailStr
    password: str


class DriverLoginResponse(BaseModel):
    """Driver login response."""
    access_token: str
    token_type: str
    driver: dict


class LocationUpdate(BaseModel):
    """GPS location update from driver."""
    latitude: float
    longitude: float
    speed: float | None = None


@router.post("/login", response_model=DriverLoginResponse)
async def driver_login(credentials: DriverLoginRequest, db: Session = Depends(get_db)) -> DriverLoginResponse:
    """Authenticate driver users."""
    driver = crud.get_driver_by_email(db, credentials.email)
    if not driver or not verify_password(credentials.password, driver.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    bus_number = None
    if driver.bus_id:
        bus = crud.get_bus(db, driver.bus_id)
        if bus:
            bus_number = bus.bus_number
    
    return DriverLoginResponse(
        access_token=f"driver_token_{driver.id}_{driver.email}",
        token_type="bearer",
        driver={
            "id": driver.id,
            "email": driver.email,
            "name": driver.name,
            "license_number": driver.license_number,
            "phone": driver.phone,
            "bus_assigned": bus_number
        }
    )


@router.get("/dashboard", response_model=dict)
async def driver_dashboard() -> dict:
    """Get driver dashboard data."""
    # TODO: Fetch from database
    return {
        "driver_name": "Ram Kumar",
        "bus_assigned": "BUS-001",
        "route_assigned": "Route A - Main Campus",
        "schedule_today": [
            {"time": "07:00 AM", "stop": "Starting Point"},
            {"time": "07:30 AM", "stop": "College Gate"}
        ]
    }


@router.post("/location", status_code=200)
async def update_location(location: LocationUpdate) -> dict:
    """Update driver's current GPS location."""
    # TODO: Store in database and broadcast to students
    return {
        "status": "success",
        "message": "Location updated successfully"
    }
