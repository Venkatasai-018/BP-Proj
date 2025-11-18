from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio
import json
import models
from database import get_db, SessionLocal, Bus, Route, RouteStop, BusLocation, User, UserPermission, UserActivityLog
from live_tracking import bus_simulator
from websocket_manager import connection_manager, handle_websocket_message
from auth import auth_manager, get_current_user, get_current_admin, get_current_user_optional
import logging
from jose import jwt, JWTError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="College Live Bus Tracking System with Authentication", version="3.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Endpoints
@app.post("/auth/signup", response_model=models.UserResponse)
async def signup(user_data: models.UserCreate, db: Session = Depends(get_db)):
    """User registration endpoint"""
    try:
        user = auth_manager.create_user(
            db=db,
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name,
            role=user_data.role.value
        )
        
        # Log activity
        log_user_activity(db, user.id, "USER_REGISTERED", f"User {user.username} registered")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/auth/login", response_model=models.Token)
async def login(login_data: models.UserLogin, request: Request, db: Session = Depends(get_db)):
    """User login endpoint"""
    user = auth_manager.authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = auth_manager.create_access_token(data={"sub": user.username})
    
    # Log activity
    log_user_activity(db, user.id, "USER_LOGIN", f"User logged in", request.client.host)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=models.UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# Helper function for logging user activities
def log_user_activity(db: Session, user_id: int, action: str, details: str = None, ip_address: str = None):
    """Log user activity"""
    try:
        activity = UserActivityLog(
            user_id=user_id,
            action=action,
            details=details,
            ip_address=ip_address,
            timestamp=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log activity: {e}")

# Admin User Management Endpoints
@app.get("/admin/users", response_model=List[models.UserResponse])
async def get_all_users(
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    log_user_activity(db, current_user.id, "ADMIN_VIEW_USERS", "Admin viewed user list")
    return users

@app.put("/admin/users/{user_id}", response_model=models.UserResponse)
async def update_user(
    user_id: int,
    user_update: models.UserUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.role is not None:
        user.role = user_update.role.value
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(user)
    
    log_user_activity(db, current_user.id, "ADMIN_UPDATE_USER", f"Updated user {user.username}")
    return user

@app.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    log_user_activity(db, current_user.id, "ADMIN_DELETE_USER", f"Deleted user {user.username}")
    return {"message": "User deleted successfully"}

# User Permission Management
@app.post("/admin/permissions", response_model=models.UserPermissionResponse)
async def grant_permission(
    permission_data: models.UserPermissionCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Grant permission to user (admin only)"""
    # Check if user exists
    user = db.query(User).filter(User.id == permission_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if bus/route exists if specified
    if permission_data.bus_id:
        bus = db.query(Bus).filter(Bus.id == permission_data.bus_id).first()
        if not bus:
            raise HTTPException(status_code=404, detail="Bus not found")
    
    if permission_data.route_id:
        route = db.query(Route).filter(Route.id == permission_data.route_id).first()
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
    
    # Create permission
    permission = UserPermission(
        user_id=permission_data.user_id,
        bus_id=permission_data.bus_id,
        route_id=permission_data.route_id,
        permission_type=permission_data.permission_type,
        granted_by=current_user.id,
        granted_at=datetime.utcnow()
    )
    
    db.add(permission)
    db.commit()
    db.refresh(permission)
    
    log_user_activity(db, current_user.id, "ADMIN_GRANT_PERMISSION", 
                     f"Granted {permission_data.permission_type} permission to user {user.username}")
    
    return permission

@app.get("/admin/permissions", response_model=List[models.UserPermissionResponse])
async def get_all_permissions(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all user permissions (admin only)"""
    permissions = db.query(UserPermission).filter(UserPermission.is_active == True).all()
    return permissions

@app.delete("/admin/permissions/{permission_id}")
async def revoke_permission(
    permission_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Revoke user permission (admin only)"""
    permission = db.query(UserPermission).filter(UserPermission.id == permission_id).first()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    permission.is_active = False
    db.commit()
    
    log_user_activity(db, current_user.id, "ADMIN_REVOKE_PERMISSION", 
                     f"Revoked permission ID {permission_id}")
    
    return {"message": "Permission revoked successfully"}

# Enhanced Bus Management Endpoints with Authorization
@app.post("/admin/buses", response_model=models.BusResponse)
async def create_bus(
    bus_data: models.BusCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new bus (admin only)"""
    # Check if bus number already exists
    existing_bus = db.query(Bus).filter(Bus.bus_number == bus_data.bus_number).first()
    if existing_bus:
        raise HTTPException(status_code=400, detail="Bus number already exists")
    
    # Check if route exists
    if bus_data.route_id:
        route = db.query(Route).filter(Route.id == bus_data.route_id).first()
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
    
    bus = Bus(
        bus_number=bus_data.bus_number,
        driver_name=bus_data.driver_name,
        driver_contact=bus_data.driver_contact,
        capacity=bus_data.capacity,
        route_id=bus_data.route_id,
        status=bus_data.status.value,
        created_at=datetime.utcnow()
    )
    
    db.add(bus)
    db.commit()
    db.refresh(bus)
    
    log_user_activity(db, current_user.id, "ADMIN_CREATE_BUS", f"Created bus {bus.bus_number}")
    
    return bus

@app.get("/buses", response_model=List[models.BusResponse])
async def get_buses(
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get buses (with permission filtering for non-admin users)"""
    query = db.query(Bus)
    
    # If user is not admin, filter based on permissions
    if current_user and current_user.role not in ["admin", "super_admin"]:
        # Get user's bus permissions
        permitted_bus_ids = db.query(UserPermission.bus_id).filter(
            UserPermission.user_id == current_user.id,
            UserPermission.permission_type == "track_bus",
            UserPermission.is_active == True,
            UserPermission.bus_id.isnot(None)
        ).all()
        
        permitted_bus_ids = [id[0] for id in permitted_bus_ids]
        
        if permitted_bus_ids:
            query = query.filter(Bus.id.in_(permitted_bus_ids))
        else:
            # User has no bus permissions, return empty list
            return []
    
    buses = query.offset(skip).limit(limit).all()
    return buses

@app.put("/admin/buses/{bus_id}", response_model=models.BusResponse)
async def update_bus(
    bus_id: int,
    bus_update: models.BusUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update bus (admin only)"""
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    # Update bus fields
    if bus_update.bus_number is not None:
        # Check for duplicate bus number
        existing = db.query(Bus).filter(
            Bus.bus_number == bus_update.bus_number, 
            Bus.id != bus_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Bus number already exists")
        bus.bus_number = bus_update.bus_number
    
    if bus_update.driver_name is not None:
        bus.driver_name = bus_update.driver_name
    if bus_update.driver_contact is not None:
        bus.driver_contact = bus_update.driver_contact
    if bus_update.capacity is not None:
        bus.capacity = bus_update.capacity
    if bus_update.route_id is not None:
        # Check if route exists
        route = db.query(Route).filter(Route.id == bus_update.route_id).first()
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        bus.route_id = bus_update.route_id
    if bus_update.status is not None:
        bus.status = bus_update.status.value
    if bus_update.is_active is not None:
        bus.is_active = bus_update.is_active
    
    db.commit()
    db.refresh(bus)
    
    log_user_activity(db, current_user.id, "ADMIN_UPDATE_BUS", f"Updated bus {bus.bus_number}")
    
    return bus

@app.delete("/admin/buses/{bus_id}")
async def delete_bus(
    bus_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete bus (admin only)"""
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    db.delete(bus)
    db.commit()
    
    log_user_activity(db, current_user.id, "ADMIN_DELETE_BUS", f"Deleted bus {bus.bus_number}")
    
    return {"message": "Bus deleted successfully"}

# Enhanced Route Management Endpoints
@app.post("/admin/routes", response_model=models.RouteResponse)
async def create_route(
    route_data: models.RouteCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new route (admin only)"""
    route = Route(
        name=route_data.name,
        start_point=route_data.start_point,
        end_point=route_data.end_point,
        description=route_data.description,
        estimated_duration=route_data.estimated_duration,
        is_active=route_data.is_active,
        created_at=datetime.utcnow()
    )
    
    db.add(route)
    db.commit()
    db.refresh(route)
    
    log_user_activity(db, current_user.id, "ADMIN_CREATE_ROUTE", f"Created route {route.name}")
    
    return route

@app.get("/routes", response_model=List[models.RouteResponse])
async def get_routes(
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get routes (with permission filtering for non-admin users)"""
    query = db.query(Route)
    
    # If user is not admin, filter based on permissions
    if current_user and current_user.role not in ["admin", "super_admin"]:
        # Get user's route permissions
        permitted_route_ids = db.query(UserPermission.route_id).filter(
            UserPermission.user_id == current_user.id,
            UserPermission.permission_type == "track_route",
            UserPermission.is_active == True,
            UserPermission.route_id.isnot(None)
        ).all()
        
        permitted_route_ids = [id[0] for id in permitted_route_ids]
        
        if permitted_route_ids:
            query = query.filter(Route.id.in_(permitted_route_ids))
        else:
            # User has no route permissions, return empty list
            return []
    
    routes = query.offset(skip).limit(limit).all()
    return routes

@app.put("/admin/routes/{route_id}", response_model=models.RouteResponse)
async def update_route(
    route_id: int,
    route_update: models.RouteUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update route (admin only)"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Update route fields
    if route_update.name is not None:
        route.name = route_update.name
    if route_update.start_point is not None:
        route.start_point = route_update.start_point
    if route_update.end_point is not None:
        route.end_point = route_update.end_point
    if route_update.description is not None:
        route.description = route_update.description
    if route_update.estimated_duration is not None:
        route.estimated_duration = route_update.estimated_duration
    if route_update.is_active is not None:
        route.is_active = route_update.is_active
    
    db.commit()
    db.refresh(route)
    
    log_user_activity(db, current_user.id, "ADMIN_UPDATE_ROUTE", f"Updated route {route.name}")
    
    return route

@app.delete("/admin/routes/{route_id}")
async def delete_route(
    route_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete route (admin only)"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Check if route has buses assigned
    buses_on_route = db.query(Bus).filter(Bus.route_id == route_id).count()
    if buses_on_route > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete route. {buses_on_route} buses are assigned to this route."
        )
    
    db.delete(route)
    db.commit()
    
    log_user_activity(db, current_user.id, "ADMIN_DELETE_ROUTE", f"Deleted route {route.name}")
    
    return {"message": "Route deleted successfully"}

# Admin Dashboard
@app.get("/admin/dashboard", response_model=models.AdminDashboard)
async def get_admin_dashboard(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard data"""
    # Count users
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Count buses
    total_buses = db.query(Bus).count()
    active_buses = db.query(Bus).filter(Bus.is_active == True).count()
    
    # Count routes
    total_routes = db.query(Route).count()
    active_routes = db.query(Route).filter(Route.is_active == True).count()
    
    # Get recent activities
    recent_activities = db.query(UserActivityLog).order_by(
        desc(UserActivityLog.timestamp)
    ).limit(10).all()
    
    activities_data = [
        {
            "id": activity.id,
            "user_id": activity.user_id,
            "action": activity.action,
            "details": activity.details,
            "timestamp": activity.timestamp.isoformat(),
            "user": db.query(User).filter(User.id == activity.user_id).first().username
        }
        for activity in recent_activities
    ]
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_buses": total_buses,
        "active_buses": active_buses,
        "total_routes": total_routes,
        "active_routes": active_routes,
        "recent_activities": activities_data
    }

# Background task to start bus simulation
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(bus_simulator.start_simulation())
    asyncio.create_task(connection_manager.send_live_updates())
    logger.info("Live bus tracking system with authentication started")

# WebSocket authentication
async def get_websocket_user(websocket: WebSocket, token: str = None) -> Optional[User]:
    """Authenticate WebSocket connection"""
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, auth_manager.secret_key, algorithms=[auth_manager.algorithm])
        username: str = payload.get("sub")
        if username is None:
            return None
    except JWTError:
        return None
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        return user
    finally:
        db.close()

# Enhanced WebSocket message handler
async def handle_websocket_message(websocket: WebSocket, message: dict, user: Optional[User] = None):
    """Handle incoming WebSocket messages with authentication"""
    message_type = message.get("type")
    
    if message_type == "authenticate":
        # Handle authentication
        token = message.get("token")
        user = await get_websocket_user(websocket, token)
        if user:
            await websocket.send_json({
                "type": "auth_success",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role
                }
            })
        else:
            await websocket.send_json({"type": "auth_error", "message": "Invalid token"})
    
    elif message_type == "subscribe_bus":
        bus_id = message.get("bus_id")
        if user:
            # Check if user has permission to track this bus
            db = SessionLocal()
            try:
                has_permission = (
                    user.role in ["admin", "super_admin"] or
                    db.query(UserPermission).filter(
                        UserPermission.user_id == user.id,
                        UserPermission.bus_id == bus_id,
                        UserPermission.permission_type == "track_bus",
                        UserPermission.is_active == True
                    ).first() is not None
                )
                
                if has_permission:
                    # Add subscription logic here
                    await websocket.send_json({
                        "type": "subscription_success",
                        "bus_id": bus_id
                    })
                else:
                    await websocket.send_json({
                        "type": "subscription_error",
                        "message": "No permission to track this bus"
                    })
            finally:
                db.close()
        else:
            # Allow anonymous users to track all buses (for demo)
            await websocket.send_json({
                "type": "subscription_success",
                "bus_id": bus_id
            })
    
    elif message_type == "get_live_data":
        # Send current bus data
        all_buses = bus_simulator.get_all_buses_status()
        
        # Filter based on user permissions if authenticated
        if user and user.role not in ["admin", "super_admin"]:
            db = SessionLocal()
            try:
                permitted_bus_ids = db.query(UserPermission.bus_id).filter(
                    UserPermission.user_id == user.id,
                    UserPermission.permission_type == "track_bus",
                    UserPermission.is_active == True,
                    UserPermission.bus_id.isnot(None)
                ).all()
                permitted_bus_ids = [id[0] for id in permitted_bus_ids]
                
                # Filter buses based on permissions
                filtered_buses = {
                    bus_id: data for bus_id, data in all_buses.items()
                    if int(bus_id) in permitted_bus_ids
                }
                all_buses = filtered_buses
            finally:
                db.close()
        
        await websocket.send_json({
            "type": "live_data",
            "timestamp": datetime.utcnow().isoformat(),
            "buses": all_buses
        })

# WebSocket endpoint for live tracking with authentication
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await connection_manager.connect(websocket)
    user = None
    
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to live bus tracking"
        })
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle authentication message first
            if message.get("type") == "authenticate":
                token = message.get("token")
                user = await get_websocket_user(websocket, token)
            
            await handle_websocket_message(websocket, message, user)
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)

# Static file serving
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Mount static files
app.mount("/static", StaticFiles(directory="../frontend"), name="static")

# Live tracker frontend
@app.get("/live")
async def live_tracker():
    return FileResponse("../frontend/live-tracker.html")

# Admin dashboard
@app.get("/admin")
async def admin_dashboard():
    return FileResponse("../frontend/admin.html")

# Default route - redirect to live tracker
@app.get("/")
async def root():
    return FileResponse("../frontend/live-tracker.html")

# Legacy frontend
@app.get("/classic")
async def classic_frontend():
    return FileResponse("../frontend/index.html")

# Bus endpoints
@app.get("/buses", response_model=List[models.BusWithLocation])
def get_buses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    buses = db.query(Bus).offset(skip).limit(limit).all()
    result = []
    for bus in buses:
        # Get latest location
        latest_location = db.query(BusLocation).filter(
            BusLocation.bus_id == bus.id
        ).order_by(desc(BusLocation.timestamp)).first()
        
        bus_dict = {
            "id": bus.id,
            "bus_number": bus.bus_number,
            "driver_name": bus.driver_name,
            "capacity": bus.capacity,
            "route_id": bus.route_id,
            "is_active": bus.is_active,
            "current_location": latest_location
        }
        result.append(bus_dict)
    return result

@app.get("/buses/{bus_id}", response_model=models.BusTrackingResponse)
def get_bus(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    route = None
    if bus.route_id:
        route = db.query(Route).filter(Route.id == bus.route_id).first()
    
    # Get latest location
    current_location = db.query(BusLocation).filter(
        BusLocation.bus_id == bus_id
    ).order_by(desc(BusLocation.timestamp)).first()
    
    # Get next stop (simplified logic)
    next_stop = None
    if route:
        next_stop = db.query(RouteStop).filter(
            RouteStop.route_id == route.id
        ).order_by(RouteStop.stop_order).first()
    
    return {
        "bus": bus,
        "route": route,
        "current_location": current_location,
        "next_stop": next_stop
    }

@app.post("/buses", response_model=models.Bus)
def create_bus(bus: models.BusCreate, db: Session = Depends(get_db)):
    db_bus = Bus(**bus.model_dump())
    db.add(db_bus)
    db.commit()
    db.refresh(db_bus)
    return db_bus

@app.put("/buses/{bus_id}", response_model=models.Bus)
def update_bus(bus_id: int, bus_update: models.BusUpdate, db: Session = Depends(get_db)):
    db_bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not db_bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    update_data = bus_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_bus, field, value)
    
    db.commit()
    db.refresh(db_bus)
    return db_bus

@app.delete("/buses/{bus_id}")
def delete_bus(bus_id: int, db: Session = Depends(get_db)):
    db_bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not db_bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    db.delete(db_bus)
    db.commit()
    return {"message": "Bus deleted successfully"}

# Route endpoints
@app.get("/routes", response_model=List[models.RouteWithStops])
def get_routes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    routes = db.query(Route).offset(skip).limit(limit).all()
    result = []
    for route in routes:
        stops = db.query(RouteStop).filter(
            RouteStop.route_id == route.id
        ).order_by(RouteStop.stop_order).all()
        
        route_dict = {
            "id": route.id,
            "name": route.name,
            "start_point": route.start_point,
            "end_point": route.end_point,
            "estimated_duration": route.estimated_duration,
            "stops": stops
        }
        result.append(route_dict)
    return result

@app.get("/routes/{route_id}", response_model=models.RouteWithStops)
def get_route(route_id: int, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    stops = db.query(RouteStop).filter(
        RouteStop.route_id == route_id
    ).order_by(RouteStop.stop_order).all()
    
    return {
        "id": route.id,
        "name": route.name,
        "start_point": route.start_point,
        "end_point": route.end_point,
        "estimated_duration": route.estimated_duration,
        "stops": stops
    }

@app.post("/routes", response_model=models.Route)
def create_route(route: models.RouteCreate, db: Session = Depends(get_db)):
    db_route = Route(**route.model_dump())
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

@app.post("/routes/{route_id}/stops", response_model=models.RouteStop)
def add_route_stop(route_id: int, stop: models.RouteStopCreate, db: Session = Depends(get_db)):
    # Verify route exists
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    stop_data = stop.model_dump()
    stop_data["route_id"] = route_id
    db_stop = RouteStop(**stop_data)
    db.add(db_stop)
    db.commit()
    db.refresh(db_stop)
    return db_stop

# Location tracking endpoints
@app.post("/buses/{bus_id}/location", response_model=models.BusLocation)
def update_bus_location(bus_id: int, location: models.BusLocationUpdate, db: Session = Depends(get_db)):
    # Verify bus exists
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    location_data = location.model_dump()
    location_data["bus_id"] = bus_id
    location_data["timestamp"] = datetime.utcnow()
    
    db_location = BusLocation(**location_data)
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@app.get("/buses/{bus_id}/location", response_model=models.BusLocation)
def get_bus_location(bus_id: int, db: Session = Depends(get_db)):
    # Verify bus exists
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    location = db.query(BusLocation).filter(
        BusLocation.bus_id == bus_id
    ).order_by(desc(BusLocation.timestamp)).first()
    
    if not location:
        raise HTTPException(status_code=404, detail="No location data found for this bus")
    
    return location

@app.get("/buses/{bus_id}/location/history")
def get_bus_location_history(bus_id: int, hours: int = 24, db: Session = Depends(get_db)):
    # Verify bus exists
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    since = datetime.utcnow() - timedelta(hours=hours)
    locations = db.query(BusLocation).filter(
        and_(BusLocation.bus_id == bus_id, BusLocation.timestamp >= since)
    ).order_by(BusLocation.timestamp).all()
    
    return locations

# Dashboard endpoints
@app.get("/dashboard/active-buses")
def get_active_buses_count(db: Session = Depends(get_db)):
    count = db.query(Bus).filter(Bus.is_active == True).count()
    return {"active_buses": count}

@app.get("/dashboard/routes-summary")
def get_routes_summary(db: Session = Depends(get_db)):
    routes_count = db.query(Route).count()
    total_stops = db.query(RouteStop).count()
    
    return {
        "total_routes": routes_count,
        "total_stops": total_stops
    }

@app.get("/dashboard/recent-updates")
def get_recent_location_updates(limit: int = 10, db: Session = Depends(get_db)):
    recent_locations = db.query(BusLocation).join(Bus).order_by(
        desc(BusLocation.timestamp)
    ).limit(limit).all()
    
    result = []
    for location in recent_locations:
        result.append({
            "bus_number": location.bus.bus_number,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "timestamp": location.timestamp,
            "speed": location.speed
        })
    
    return result

# Live Tracking Endpoints
@app.get("/live/buses")
def get_live_buses():
    """Get real-time status of all buses"""
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "buses": bus_simulator.get_all_buses_status()
    }

@app.get("/live/bus/{bus_id}")
def get_live_bus(bus_id: int):
    """Get real-time status of a specific bus"""
    bus_status = bus_simulator.get_bus_status(bus_id)
    if not bus_status:
        raise HTTPException(status_code=404, detail="Bus not found or not active")
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "bus_id": bus_id,
        "data": bus_status
    }

@app.get("/live/route/{route_id}/buses")
def get_live_buses_on_route(route_id: int, db: Session = Depends(get_db)):
    """Get all buses currently on a specific route"""
    buses = db.query(Bus).filter(
        and_(Bus.route_id == route_id, Bus.is_active == True)
    ).all()
    
    live_buses = []
    for bus in buses:
        bus_status = bus_simulator.get_bus_status(bus.id)
        if bus_status:
            live_buses.append({
                "bus_id": bus.id,
                "bus_number": bus.bus_number,
                "driver_name": bus.driver_name,
                "live_data": bus_status
            })
    
    return {
        "route_id": route_id,
        "timestamp": datetime.utcnow().isoformat(),
        "buses": live_buses
    }

@app.get("/live/statistics")
def get_live_statistics(db: Session = Depends(get_db)):
    """Get real-time system statistics"""
    all_buses = bus_simulator.get_all_buses_status()
    
    total_passengers = sum(bus.get("passengers", 0) for bus in all_buses.values())
    moving_buses = sum(1 for bus in all_buses.values() if bus.get("status") == "moving")
    stopped_buses = sum(1 for bus in all_buses.values() if bus.get("status") == "at_stop")
    
    # Get average speed
    speeds = [bus.get("speed", 0) for bus in all_buses.values()]
    avg_speed = sum(speeds) / len(speeds) if speeds else 0
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "total_active_buses": len(all_buses),
        "moving_buses": moving_buses,
        "stopped_buses": stopped_buses,
        "total_passengers": total_passengers,
        "average_speed": round(avg_speed, 2),
        "system_status": "operational"
    }

@app.post("/live/bus/{bus_id}/simulate-delay")
def simulate_bus_delay(bus_id: int, delay_minutes: int = 5):
    """Simulate a bus delay (for testing purposes)"""
    bus_status = bus_simulator.get_bus_status(bus_id)
    if not bus_status:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    # Reduce speed to simulate delay
    if bus_id in bus_simulator.active_buses:
        original_speed = bus_simulator.active_buses[bus_id]["speed"]
        bus_simulator.active_buses[bus_id]["speed"] = max(5, original_speed * 0.3)
        bus_simulator.active_buses[bus_id]["status"] = "delayed"
    
    return {
        "message": f"Simulated {delay_minutes} minute delay for bus {bus_id}",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/live/alerts")
def get_live_alerts():
    """Get current system alerts and notifications"""
    alerts = []
    all_buses = bus_simulator.get_all_buses_status()
    
    for bus_id, bus_data in all_buses.items():
        # Check for various alert conditions
        if bus_data.get("speed", 0) < 5 and bus_data.get("status") == "moving":
            alerts.append({
                "type": "slow_speed",
                "bus_id": bus_id,
                "bus_number": bus_data.get("bus_number"),
                "message": f"Bus {bus_data.get('bus_number')} is moving very slowly",
                "severity": "warning",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        if bus_data.get("passengers", 0) > 45:  # Assuming max capacity around 50
            alerts.append({
                "type": "high_capacity",
                "bus_id": bus_id,
                "bus_number": bus_data.get("bus_number"),
                "message": f"Bus {bus_data.get('bus_number')} is near capacity",
                "severity": "info",
                "timestamp": datetime.utcnow().isoformat()
            })
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "alerts": alerts
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)