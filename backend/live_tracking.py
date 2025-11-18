import asyncio
import json
import random
import math
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from database import SessionLocal, Bus, BusLocation, RouteStop, Route
import logging
from geopy.distance import geodesic
from geopy import Point

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LiveBusSimulator:
    def __init__(self):
        self.active_buses: Dict[int, Dict] = {}
        self.bus_routes: Dict[int, List] = {}
        self.running = False
        self.update_interval = 2  # Update every 2 seconds for real-time feel
        self.speed_variations = {}
        self.traffic_conditions = {}
        self.weather_impact = 1.0
    
    def calculate_new_position(self, current_lat: float, current_lng: float, 
                              target_lat: float, target_lng: float, 
                              speed_kmh: float, time_delta: float) -> Tuple[float, float]:
        """Calculate new GPS position based on current position, target, and speed"""
        if current_lat == target_lat and current_lng == target_lng:
            return current_lat, current_lng
            
        # Calculate distance to target
        current_point = Point(current_lat, current_lng)
        target_point = Point(target_lat, target_lng)
        distance_km = geodesic(current_point, target_point).kilometers
        
        # Calculate how far we can travel in the time delta
        travel_distance = (speed_kmh * time_delta) / 3600  # Convert to km
        
        if travel_distance >= distance_km:
            # We can reach the target
            return target_lat, target_lng
        else:
            # Move towards target by travel_distance
            bearing = self.calculate_bearing(current_lat, current_lng, target_lat, target_lng)
            new_point = geodesic(kilometers=travel_distance).destination(current_point, bearing)
            return new_point.latitude, new_point.longitude
    
    def calculate_bearing(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate bearing between two points"""
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        lng_diff = math.radians(lng2 - lng1)
        
        y = math.sin(lng_diff) * math.cos(lat2_rad)
        x = (math.cos(lat1_rad) * math.sin(lat2_rad) - 
             math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(lng_diff))
        
        bearing = math.atan2(y, x)
        return math.degrees(bearing)

    async def initialize_bus_routes(self):
        """Initialize bus routes and starting positions with realistic data"""
        db = SessionLocal()
        try:
            buses = db.query(Bus).filter(Bus.is_active == True).all()
            
            for bus in buses:
                if bus.route_id:
                    # Get route information
                    route = db.query(Route).filter(Route.id == bus.route_id).first()
                    stops = db.query(RouteStop).filter(
                        RouteStop.route_id == bus.route_id
                    ).order_by(RouteStop.stop_order).all()
                    
                    if stops:
                        self.bus_routes[bus.id] = [
                            {"lat": stop.latitude, "lng": stop.longitude, "name": stop.stop_name}
                            for stop in stops
                        ]
                        
                        # Initialize bus at first stop
                        self.active_buses[bus.id] = {
                            "bus_number": bus.bus_number,
                            "driver_name": bus.driver_name,
                            "current_lat": stops[0].latitude,
                            "current_lng": stops[0].longitude,
                            "target_stop_index": 1,
                            "speed": random.uniform(20, 40),  # km/h
                            "status": "moving",
                            "passengers": random.randint(5, bus.capacity - 10),
                            "last_update": datetime.utcnow(),
                            "route_progress": 0.0
                        }
            
            logger.info(f"Initialized {len(self.active_buses)} active buses for simulation")
            
        except Exception as e:
            logger.error(f"Error initializing bus routes: {e}")
        finally:
            db.close()
    
    def calculate_distance(self, lat1, lng1, lat2, lng2):
        """Calculate distance between two points in kilometers"""
        R = 6371  # Earth's radius in kilometers
        
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def move_towards_target(self, current_lat, current_lng, target_lat, target_lng, speed_kmh, time_delta_minutes):
        """Move bus towards target location based on speed"""
        distance = self.calculate_distance(current_lat, current_lng, target_lat, target_lng)
        
        if distance < 0.001:  # Very close, consider arrived
            return target_lat, target_lng, True
        
        # Calculate movement distance based on speed
        movement_distance = (speed_kmh / 60) * time_delta_minutes  # km
        
        if movement_distance >= distance:
            return target_lat, target_lng, True
        
        # Calculate new position
        ratio = movement_distance / distance
        new_lat = current_lat + (target_lat - current_lat) * ratio
        new_lng = current_lng + (target_lng - current_lng) * ratio
        
        return new_lat, new_lng, False
    
    async def update_bus_positions(self):
        """Update all bus positions"""
        db = SessionLocal()
        try:
            for bus_id, bus_data in self.active_buses.items():
                if bus_id not in self.bus_routes or not self.bus_routes[bus_id]:
                    continue
                
                route_stops = self.bus_routes[bus_id]
                target_stop_index = bus_data["target_stop_index"]
                
                if target_stop_index >= len(route_stops):
                    # Reset to beginning of route
                    target_stop_index = 0
                    bus_data["target_stop_index"] = 0
                
                target_stop = route_stops[target_stop_index]
                
                # Add some randomness to speed
                base_speed = bus_data["speed"]
                current_speed = base_speed + random.uniform(-5, 5)
                current_speed = max(10, min(50, current_speed))  # Keep between 10-50 km/h
                
                # Move towards target
                new_lat, new_lng, arrived = self.move_towards_target(
                    bus_data["current_lat"],
                    bus_data["current_lng"],
                    target_stop["lat"],
                    target_stop["lng"],
                    current_speed,
                    1  # 1 minute intervals
                )
                
                # Update bus position
                bus_data["current_lat"] = new_lat
                bus_data["current_lng"] = new_lng
                bus_data["speed"] = current_speed
                bus_data["last_update"] = datetime.utcnow()
                
                # Calculate route progress
                total_stops = len(route_stops)
                progress = (target_stop_index / total_stops) * 100
                bus_data["route_progress"] = progress
                
                if arrived:
                    # Arrived at stop
                    bus_data["status"] = "at_stop"
                    bus_data["target_stop_index"] = (target_stop_index + 1) % len(route_stops)
                    
                    # Simulate passenger changes
                    if random.random() < 0.7:  # 70% chance of passenger change
                        change = random.randint(-5, 8)
                        bus_data["passengers"] = max(0, min(
                            bus_data["passengers"] + change,
                            db.query(Bus).filter(Bus.id == bus_id).first().capacity
                        ))
                    
                    # Stay at stop for a random time (simulated by reduced speed next update)
                    await asyncio.sleep(random.uniform(0.5, 2))
                    bus_data["status"] = "moving"
                
                # Save to database
                location = BusLocation(
                    bus_id=bus_id,
                    latitude=new_lat,
                    longitude=new_lng,
                    speed=current_speed,
                    timestamp=datetime.utcnow()
                )
                db.add(location)
            
            db.commit()
            logger.info(f"Updated positions for {len(self.active_buses)} buses")
            
        except Exception as e:
            logger.error(f"Error updating bus positions: {e}")
            db.rollback()
        finally:
            db.close()
    
    async def start_simulation(self):
        """Start the live bus simulation"""
        self.running = True
        await self.initialize_bus_routes()
        
        logger.info("Starting live bus simulation...")
        
        while self.running:
            try:
                await self.update_bus_positions()
                await asyncio.sleep(30)  # Update every 30 seconds
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")
                await asyncio.sleep(10)
    
    def stop_simulation(self):
        """Stop the simulation"""
        self.running = False
        logger.info("Stopping live bus simulation...")
    
    def get_bus_status(self, bus_id: int):
        """Get current status of a specific bus"""
        if bus_id in self.active_buses:
            bus_data = self.active_buses[bus_id]
            route_stops = self.bus_routes.get(bus_id, [])
            next_stop = None
            
            if route_stops and bus_data["target_stop_index"] < len(route_stops):
                next_stop = route_stops[bus_data["target_stop_index"]]
            
            return {
                **bus_data,
                "next_stop": next_stop,
                "total_stops": len(route_stops)
            }
        return None
    
    def get_all_buses_status(self):
        """Get status of all active buses"""
        return {
            bus_id: self.get_bus_status(bus_id) 
            for bus_id in self.active_buses.keys()
        }

# Global simulator instance
bus_simulator = LiveBusSimulator()