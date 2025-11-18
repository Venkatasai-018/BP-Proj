from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

DATABASE_URL = "sqlite:///./bus_tracking.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Enums
class UserRoleEnum(enum.Enum):
    STUDENT = "student"
    STAFF = "staff"
    DRIVER = "driver"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class BusStatusEnum(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    OUT_OF_SERVICE = "out_of_service"

# User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    permissions = relationship("UserPermission", back_populates="user")
    activity_logs = relationship("UserActivityLog", back_populates="user")

# Bus Model
class Bus(Base):
    __tablename__ = "buses"
    
    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String, unique=True, index=True)
    driver_name = Column(String)
    driver_contact = Column(String, nullable=True)
    capacity = Column(Integer, default=50)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    status = Column(Enum(BusStatusEnum), default=BusStatusEnum.ACTIVE)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    route = relationship("Route", back_populates="buses")
    locations = relationship("BusLocation", back_populates="bus")
    permissions = relationship("UserPermission", back_populates="bus")

# Route Model
class Route(Base):
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    start_point = Column(String)
    end_point = Column(String)
    description = Column(Text, nullable=True)
    estimated_duration = Column(Integer)  # in minutes
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    buses = relationship("Bus", back_populates="route")
    stops = relationship("RouteStop", back_populates="route")
    permissions = relationship("UserPermission", back_populates="route")

# Route Stop Model
class RouteStop(Base):
    __tablename__ = "route_stops"
    
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"))
    stop_name = Column(String)
    stop_order = Column(Integer)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    scheduled_arrival = Column(String, nullable=True)  # HH:MM format
    
    # Relationships
    route = relationship("Route", back_populates="stops")

# Bus Location Model
class BusLocation(Base):
    __tablename__ = "bus_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    speed = Column(Float, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    bus = relationship("Bus", back_populates="locations")

# User Permission Model
class UserPermission(Base):
    __tablename__ = "user_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    permission_type = Column(String)  # "track_bus", "track_route", "admin_access"
    granted_by = Column(Integer, ForeignKey("users.id"))
    granted_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="permissions", foreign_keys=[user_id])
    bus = relationship("Bus", back_populates="permissions")
    route = relationship("Route", back_populates="permissions")
    granted_by_user = relationship("User", foreign_keys=[granted_by])

# User Activity Log Model
class UserActivityLog(Base):
    __tablename__ = "user_activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="activity_logs")

# Create all tables
Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()