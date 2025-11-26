"""Database configuration and session management."""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Create SQLite engine
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables and seed initial data."""
    Base.metadata.create_all(bind=engine)
    
    # Seed default accounts
    from app.services.crud import (
        create_admin, get_admin_by_username,
        create_student, get_student_by_email,
        create_driver, get_driver_by_email
    )
    db = SessionLocal()
    try:
        # Create admin accounts
        if not get_admin_by_username(db, "admin"):
            create_admin(db, username="admin", password="admin123", name="Administrator")
        if not get_admin_by_username(db, "tceeduride"):
            create_admin(db, username="tceeduride", password="tce@2025", name="TCE Admin")
        
        # Create test student account
        if not get_student_by_email(db, "student@tce.edu"):
            create_student(
                db,
                name="Test Student",
                email="student@tce.edu",
                roll_number="TCE2025001",
                password="student123",
                phone="9876543210",
                route_id=None
            )
        
        # Create test driver account
        if not get_driver_by_email(db, "driver@tce.edu"):
            create_driver(
                db,
                name="Test Driver",
                email="driver@tce.edu",
                phone="9876543211",
                license_number="DL123456789",
                password="driver123",
                bus_id=None
            )
    finally:
        db.close()
