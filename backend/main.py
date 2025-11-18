from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from typing import List, Optional
from datetime import datetime, timedelta
import models
from database import get_db, Bus, Route, RouteStop, BusLocation

app = FastAPI(title="College Bus Tracking System", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)