from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    STAFF = "staff"
    DRIVER = "driver"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class BusStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    OUT_OF_SERVICE = "out_of_service"

# User Models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.STUDENT

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Bus Management Models
class BusCreate(BaseModel):
    bus_number: str
    driver_name: str
    driver_contact: Optional[str] = None
    capacity: int = 50
    route_id: Optional[int] = None
    status: BusStatus = BusStatus.ACTIVE

class BusUpdate(BaseModel):
    bus_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_contact: Optional[str] = None
    capacity: Optional[int] = None
    route_id: Optional[int] = None
    status: Optional[BusStatus] = None
    is_active: Optional[bool] = None

class BusResponse(BaseModel):
    id: int
    bus_number: str
    driver_name: str
    driver_contact: Optional[str]
    capacity: int
    route_id: Optional[int]
    status: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Route Management Models
class RouteCreate(BaseModel):
    name: str
    start_point: str
    end_point: str
    description: Optional[str] = None
    estimated_duration: int  # in minutes
    is_active: bool = True

class RouteUpdate(BaseModel):
    name: Optional[str] = None
    start_point: Optional[str] = None
    end_point: Optional[str] = None
    description: Optional[str] = None
    estimated_duration: Optional[int] = None
    is_active: Optional[bool] = None

class RouteResponse(BaseModel):
    id: int
    name: str
    start_point: str
    end_point: str
    description: Optional[str]
    estimated_duration: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Route Stop Models
class RouteStopCreate(BaseModel):
    route_id: int
    stop_name: str
    stop_order: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    scheduled_arrival: Optional[str] = None  # Time in HH:MM format

class RouteStopUpdate(BaseModel):
    stop_name: Optional[str] = None
    stop_order: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    scheduled_arrival: Optional[str] = None

class RouteStopResponse(BaseModel):
    id: int
    route_id: int
    stop_name: str
    stop_order: int
    latitude: Optional[float]
    longitude: Optional[float]
    scheduled_arrival: Optional[str]
    
    class Config:
        from_attributes = True

# User Permission Models
class UserPermissionCreate(BaseModel):
    user_id: int
    bus_id: Optional[int] = None
    route_id: Optional[int] = None
    permission_type: str  # "track_bus", "track_route", "admin_access"

class UserPermissionResponse(BaseModel):
    id: int
    user_id: int
    bus_id: Optional[int]
    route_id: Optional[int]
    permission_type: str
    granted_by: int
    granted_at: datetime
    
    class Config:
        from_attributes = True

# Admin Dashboard Models
class AdminDashboard(BaseModel):
    total_users: int
    active_users: int
    total_buses: int
    active_buses: int
    total_routes: int
    active_routes: int
    recent_activities: List[dict]

class UserActivityLog(BaseModel):
    user_id: int
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

# Location Models (keeping existing for compatibility)
class LocationCreate(BaseModel):
    bus_id: int
    latitude: float
    longitude: float
    speed: Optional[float] = None

class LocationResponse(BaseModel):
    id: int
    bus_id: int
    latitude: float
    longitude: float
    speed: Optional[float]
    timestamp: datetime
    
    class Config:
        from_attributes = True