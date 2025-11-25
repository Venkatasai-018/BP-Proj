"""CRUD operations for database models."""
from sqlalchemy.orm import Session
from typing import Optional

from app.models.models import Admin, Student, Driver, Bus, Route, RouteStop, Schedule, Feedback
from app.core.security import get_password_hash


# Admin CRUD
def get_admin_by_username(db: Session, username: str) -> Optional[Admin]:
    """Get admin by username."""
    return db.query(Admin).filter(Admin.username == username).first()


def create_admin(db: Session, username: str, password: str, name: str) -> Admin:
    """Create a new admin."""
    hashed_password = get_password_hash(password)
    admin = Admin(username=username, password=hashed_password, name=name)
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


# Student CRUD
def get_students(db: Session, skip: int = 0, limit: int = 100):
    """Get all students."""
    return db.query(Student).offset(skip).limit(limit).all()


def get_student_by_email(db: Session, email: str) -> Optional[Student]:
    """Get student by email."""
    return db.query(Student).filter(Student.email == email).first()


def create_student(db: Session, name: str, email: str, roll_number: str, 
                   phone: str, password: str, route_id: Optional[int] = None) -> Student:
    """Create a new student."""
    hashed_password = get_password_hash(password)
    student = Student(
        name=name,
        email=email,
        roll_number=roll_number,
        phone=phone,
        password=hashed_password,
        route_id=route_id
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def delete_student(db: Session, student_id: int) -> bool:
    """Delete a student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if student:
        db.delete(student)
        db.commit()
        return True
    return False


# Driver CRUD
def get_drivers(db: Session, skip: int = 0, limit: int = 100):
    """Get all drivers."""
    return db.query(Driver).offset(skip).limit(limit).all()


def get_driver_by_email(db: Session, email: str) -> Optional[Driver]:
    """Get driver by email."""
    return db.query(Driver).filter(Driver.email == email).first()


def create_driver(db: Session, name: str, email: str, phone: str, 
                  license_number: str, password: str, bus_id: Optional[int] = None) -> Driver:
    """Create a new driver."""
    hashed_password = get_password_hash(password)
    driver = Driver(
        name=name,
        email=email,
        phone=phone,
        license_number=license_number,
        password=hashed_password,
        bus_id=bus_id
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


def delete_driver(db: Session, driver_id: int) -> bool:
    """Delete a driver."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if driver:
        db.delete(driver)
        db.commit()
        return True
    return False


# Bus CRUD
def get_buses(db: Session, skip: int = 0, limit: int = 100):
    """Get all buses."""
    return db.query(Bus).offset(skip).limit(limit).all()


def get_bus(db: Session, bus_id: int) -> Optional[Bus]:
    """Get bus by ID."""
    return db.query(Bus).filter(Bus.id == bus_id).first()


def create_bus(db: Session, bus_number: str, capacity: int, 
               model: str, registration_number: str) -> Bus:
    """Create a new bus."""
    bus = Bus(
        bus_number=bus_number,
        capacity=capacity,
        model=model,
        registration_number=registration_number
    )
    db.add(bus)
    db.commit()
    db.refresh(bus)
    return bus


def delete_bus(db: Session, bus_id: int) -> bool:
    """Delete a bus."""
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if bus:
        db.delete(bus)
        db.commit()
        return True
    return False


# Route CRUD
def get_routes(db: Session, skip: int = 0, limit: int = 100):
    """Get all routes."""
    return db.query(Route).offset(skip).limit(limit).all()


def get_route(db: Session, route_id: int) -> Optional[Route]:
    """Get route by ID."""
    return db.query(Route).filter(Route.id == route_id).first()


def create_route(db: Session, route_name: str, description: str) -> Route:
    """Create a new route."""
    route = Route(route_name=route_name, description=description)
    db.add(route)
    db.commit()
    db.refresh(route)
    return route


def create_route_stop(db: Session, route_id: int, stop_name: str, 
                      latitude: float, longitude: float, order: int) -> RouteStop:
    """Create a route stop."""
    stop = RouteStop(
        route_id=route_id,
        stop_name=stop_name,
        latitude=latitude,
        longitude=longitude,
        order=order
    )
    db.add(stop)
    db.commit()
    db.refresh(stop)
    return stop


# Schedule CRUD
def get_schedules(db: Session, skip: int = 0, limit: int = 100):
    """Get all schedules."""
    return db.query(Schedule).offset(skip).limit(limit).all()


def create_schedule(db: Session, bus_id: int, route_id: int, 
                    departure_time: str, days_of_week: str) -> Schedule:
    """Create a new schedule."""
    schedule = Schedule(
        bus_id=bus_id,
        route_id=route_id,
        departure_time=departure_time,
        days_of_week=days_of_week
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


# Feedback CRUD
def get_feedbacks(db: Session, skip: int = 0, limit: int = 100):
    """Get all feedbacks."""
    return db.query(Feedback).offset(skip).limit(limit).all()


def create_feedback(db: Session, user_id: int, user_type: str, 
                    rating: int, category: str, message: str) -> Feedback:
    """Create a new feedback."""
    feedback = Feedback(
        user_id=user_id,
        user_type=user_type,
        rating=rating,
        category=category,
        message=message
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback
