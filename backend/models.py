from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BusBase(BaseModel):
    bus_number: str
    driver_name: str
    capacity: int
    route_id: Optional[int] = None
    is_active: bool = True

class BusCreate(BusBase):
    pass

class BusUpdate(BaseModel):
    bus_number: Optional[str] = None
    driver_name: Optional[str] = None
    capacity: Optional[int] = None
    route_id: Optional[int] = None
    is_active: Optional[bool] = None

class Bus(BusBase):
    id: int
    
    class Config:
        from_attributes = True

class RouteBase(BaseModel):
    name: str
    start_point: str
    end_point: str
    estimated_duration: int

class RouteCreate(RouteBase):
    pass

class Route(RouteBase):
    id: int
    
    class Config:
        from_attributes = True

class RouteStopBase(BaseModel):
    stop_name: str
    latitude: float
    longitude: float
    stop_order: int
    estimated_arrival_time: str

class RouteStopCreate(RouteStopBase):
    route_id: int

class RouteStop(RouteStopBase):
    id: int
    route_id: int
    
    class Config:
        from_attributes = True

class BusLocationBase(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = 0.0

class BusLocationCreate(BusLocationBase):
    bus_id: int

class BusLocationUpdate(BusLocationBase):
    pass

class BusLocation(BusLocationBase):
    id: int
    bus_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

class BusWithLocation(Bus):
    current_location: Optional[BusLocation] = None

class RouteWithStops(Route):
    stops: List[RouteStop] = []

class BusTrackingResponse(BaseModel):
    bus: Bus
    route: Optional[Route] = None
    current_location: Optional[BusLocation] = None
    next_stop: Optional[RouteStop] = None