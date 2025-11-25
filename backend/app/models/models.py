"""Database models for TCE EduRide."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Admin(Base):
    """Admin user model."""
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Student(Base):
    """Student model."""
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    roll_number = Column(String(50), unique=True, nullable=False, index=True)
    phone = Column(String(15), nullable=False)
    password = Column(String(255), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    route = relationship("Route", back_populates="students")


class Driver(Base):
    """Driver model."""
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(15), nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    bus = relationship("Bus", back_populates="driver")


class Bus(Base):
    """Bus model."""
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String(50), unique=True, nullable=False, index=True)
    capacity = Column(Integer, nullable=False)
    model = Column(String(100), nullable=False)
    registration_number = Column(String(50), unique=True, nullable=False)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    driver = relationship("Driver", back_populates="bus", uselist=False)
    schedules = relationship("Schedule", back_populates="bus")


class Route(Base):
    """Route model."""
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    stops = relationship("RouteStop", back_populates="route", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="route")
    schedules = relationship("Schedule", back_populates="route")


class RouteStop(Base):
    """Route stop model."""
    __tablename__ = "route_stops"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    stop_name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    order = Column(Integer, nullable=False)

    route = relationship("Route", back_populates="stops")


class Schedule(Base):
    """Schedule model."""
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    departure_time = Column(String(20), nullable=False)
    days_of_week = Column(String(100), nullable=False)  # Comma-separated
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    bus = relationship("Bus", back_populates="schedules")
    route = relationship("Route", back_populates="schedules")


class Feedback(Base):
    """Feedback model."""
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    user_type = Column(String(20), nullable=False)  # student, driver, admin
    rating = Column(Integer, nullable=False)  # 1-5
    category = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)


class Location(Base):
    """Real-time location tracking model."""
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
