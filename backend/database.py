from sqlalchemy import create_engine, MetaData, Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(current_dir, 'bus_tracking.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Bus(Base):
    __tablename__ = "buses"
    
    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String(50), unique=True, index=True)
    driver_name = Column(String(100))
    capacity = Column(Integer)
    route_id = Column(Integer, ForeignKey("routes.id"))
    is_active = Column(Boolean, default=True)
    
    route = relationship("Route", back_populates="buses")
    locations = relationship("BusLocation", back_populates="bus")

class Route(Base):
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    start_point = Column(String(200))
    end_point = Column(String(200))
    estimated_duration = Column(Integer)  # in minutes
    
    buses = relationship("Bus", back_populates="route")
    stops = relationship("RouteStop", back_populates="route")

class RouteStop(Base):
    __tablename__ = "route_stops"
    
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"))
    stop_name = Column(String(200))
    latitude = Column(Float)
    longitude = Column(Float)
    stop_order = Column(Integer)
    estimated_arrival_time = Column(String(10))  # HH:MM format
    
    route = relationship("Route", back_populates="stops")

class BusLocation(Base):
    __tablename__ = "bus_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    speed = Column(Float, default=0.0)
    
    bus = relationship("Bus", back_populates="locations")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
Base.metadata.create_all(bind=engine)