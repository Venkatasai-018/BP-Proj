"""Admin-related API endpoints."""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password
from app.services import crud

router = APIRouter(prefix="/admin", tags=["admin"])


class AdminLoginRequest(BaseModel):
    """Admin login credentials."""
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    """Admin login response with token."""
    access_token: str
    token_type: str
    user: dict


class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_buses: int
    total_routes: int
    total_students: int
    total_drivers: int
    active_buses: int


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(credentials: AdminLoginRequest, db: Session = Depends(get_db)) -> AdminLoginResponse:
    """
    Authenticate admin users from database.
    
    Default admin accounts:
    - Username: admin, Password: admin123
    - Username: tceeduride, Password: tce@2025
    """
    admin = crud.get_admin_by_username(db, credentials.username)
    if not admin or not verify_password(credentials.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    return AdminLoginResponse(
        access_token=f"simple_token_{admin.id}_{admin.username}",
        token_type="bearer",
        user={
            "id": admin.id,
            "username": admin.username,
            "name": admin.name,
            "role": "admin"
        }
    )


@router.get("/dashboard", response_model=DashboardStats)
async def admin_dashboard(db: Session = Depends(get_db)) -> DashboardStats:
    """Return summary metrics for the admin dashboard."""
    from app.models.models import Bus, Route, Student, Driver
    
    total_buses = db.query(Bus).count()
    total_routes = db.query(Route).count()
    total_students = db.query(Student).count()
    total_drivers = db.query(Driver).count()
    active_buses = db.query(Bus).filter(Bus.status == "active").count()
    
    return DashboardStats(
        total_buses=total_buses,
        total_routes=total_routes,
        total_students=total_students,
        total_drivers=total_drivers,
        active_buses=active_buses
    )


# Student Management by Admin
class StudentCreate(BaseModel):
    """Schema for creating a student."""
    name: str
    email: str
    roll_number: str
    phone: str
    route_id: int | None = None
    password: str


class StudentResponse(BaseModel):
    """Schema for student response."""
    id: int
    name: str
    email: str
    roll_number: str
    phone: str
    route_id: int | None
    status: str


@router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(student: StudentCreate, db: Session = Depends(get_db)) -> StudentResponse:
    """Admin creates a new student account."""
    # Check if email already exists
    existing = crud.get_student_by_email(db, student.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_student = crud.create_student(
        db=db,
        name=student.name,
        email=student.email,
        roll_number=student.roll_number,
        phone=student.phone,
        password=student.password,
        route_id=student.route_id
    )
    return StudentResponse(
        id=db_student.id,
        name=db_student.name,
        email=db_student.email,
        roll_number=db_student.roll_number,
        phone=db_student.phone,
        route_id=db_student.route_id,
        status=db_student.status
    )


@router.get("/students", response_model=list[StudentResponse])
async def list_students(db: Session = Depends(get_db)) -> list[StudentResponse]:
    """Admin views all students."""
    students = crud.get_students(db)
    return [
        StudentResponse(
            id=s.id,
            name=s.name,
            email=s.email,
            roll_number=s.roll_number,
            phone=s.phone,
            route_id=s.route_id,
            status=s.status
        )
        for s in students
    ]


@router.put("/students/{student_id}", response_model=StudentResponse)
async def update_student(student_id: int, student: StudentCreate) -> StudentResponse:
    """Admin updates student information."""
    # TODO: Update in database
    return StudentResponse(
        id=student_id,
        name=student.name,
        email=student.email,
        roll_number=student.roll_number,
        phone=student.phone,
        route_id=student.route_id,
        status="active"
    )


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(student_id: int, db: Session = Depends(get_db)) -> None:
    """Admin deletes a student account."""
    if not crud.delete_student(db, student_id):
        raise HTTPException(status_code=404, detail="Student not found")


# Driver Management by Admin
class DriverCreate(BaseModel):
    """Schema for creating a driver."""
    name: str
    email: str
    phone: str
    license_number: str
    bus_id: int | None = None
    password: str


class DriverResponse(BaseModel):
    """Schema for driver response."""
    id: int
    name: str
    email: str
    phone: str
    license_number: str
    bus_id: int | None
    status: str


@router.post("/drivers", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
async def create_driver(driver: DriverCreate, db: Session = Depends(get_db)) -> DriverResponse:
    """Admin creates a new driver account."""
    # Check if email already exists
    existing = crud.get_driver_by_email(db, driver.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_driver = crud.create_driver(
        db=db,
        name=driver.name,
        email=driver.email,
        phone=driver.phone,
        license_number=driver.license_number,
        password=driver.password,
        bus_id=driver.bus_id
    )
    return DriverResponse(
        id=db_driver.id,
        name=db_driver.name,
        email=db_driver.email,
        phone=db_driver.phone,
        license_number=db_driver.license_number,
        bus_id=db_driver.bus_id,
        status=db_driver.status
    )


@router.get("/drivers", response_model=list[DriverResponse])
async def list_drivers(db: Session = Depends(get_db)) -> list[DriverResponse]:
    """Admin views all drivers."""
    drivers = crud.get_drivers(db)
    return [
        DriverResponse(
            id=d.id,
            name=d.name,
            email=d.email,
            phone=d.phone,
            license_number=d.license_number,
            bus_id=d.bus_id,
            status=d.status
        )
        for d in drivers
    ]


@router.put("/drivers/{driver_id}", response_model=DriverResponse)
async def update_driver(driver_id: int, driver: DriverCreate) -> DriverResponse:
    """Admin updates driver information."""
    # TODO: Update in database
    return DriverResponse(
        id=driver_id,
        name=driver.name,
        email=driver.email,
        phone=driver.phone,
        license_number=driver.license_number,
        bus_id=driver.bus_id,
        status="active"
    )


@router.delete("/drivers/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_driver(driver_id: int, db: Session = Depends(get_db)) -> None:
    """Admin deletes a driver account."""
    if not crud.delete_driver(db, driver_id):
        raise HTTPException(status_code=404, detail="Driver not found")
