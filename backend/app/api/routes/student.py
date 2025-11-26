"""Student-facing endpoints."""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password
from app.services import crud

router = APIRouter(prefix="/students", tags=["student"])


class StudentLoginRequest(BaseModel):
    """Student login credentials."""
    email: EmailStr
    password: str


class StudentLoginResponse(BaseModel):
    """Student login response."""
    access_token: str
    token_type: str
    student: dict


class BusTrackingInfo(BaseModel):
    """Real-time bus tracking information."""
    bus_number: str
    route_name: str
    current_location: dict
    estimated_arrival: str
    status: str


@router.post("/login", response_model=StudentLoginResponse)
async def student_login(credentials: StudentLoginRequest, db: Session = Depends(get_db)) -> StudentLoginResponse:
    """Authenticate student users."""
    student = crud.get_student_by_email(db, credentials.email)
    if not student or not verify_password(credentials.password, student.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return StudentLoginResponse(
        access_token=f"student_token_{student.id}_{student.email}",
        token_type="bearer",
        student={
            "id": student.id,
            "email": student.email,
            "name": student.name,
            "roll_number": student.roll_number,
            "phone": student.phone,
            "route_id": student.route_id
        }
    )


@router.get("/dashboard", response_model=dict)
async def student_dashboard() -> dict:
    """Get student dashboard data."""
    # TODO: Fetch from database
    return {
        "student_name": "John Doe",
        "roll_number": "TCE2021001",
        "route_assigned": "Route A - Main Campus",
        "bus_number": "BUS-001"
    }


@router.get("/track-bus", response_model=BusTrackingInfo)
async def track_bus() -> BusTrackingInfo:
    """Get real-time bus location for the student's route."""
    # TODO: Integrate with GPS tracking system
    return BusTrackingInfo(
        bus_number="BUS-001",
        route_name="Route A - Main Campus",
        current_location={"lat": 11.0168, "lng": 76.9558},
        estimated_arrival="10 minutes",
        status="on_route"
    )
