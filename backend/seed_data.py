from sqlalchemy.orm import Session
from database import SessionLocal, Bus, Route, RouteStop, BusLocation
from datetime import datetime

def create_sample_data():
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Route).first():
            print("Sample data already exists")
            return
        
        # Create sample routes
        route1 = Route(
            name="Main Campus to Hostel",
            start_point="Main Campus Gate",
            end_point="Boys Hostel",
            estimated_duration=45
        )
        
        route2 = Route(
            name="Girls Hostel to Library",
            start_point="Girls Hostel",
            end_point="Central Library",
            estimated_duration=20
        )
        
        db.add_all([route1, route2])
        db.commit()
        
        # Create route stops for route 1
        stops_route1 = [
            RouteStop(route_id=route1.id, stop_name="Main Campus Gate", latitude=17.4435, longitude=78.3772, stop_order=1, estimated_arrival_time="08:00"),
            RouteStop(route_id=route1.id, stop_name="Engineering Block", latitude=17.4440, longitude=78.3780, stop_order=2, estimated_arrival_time="08:05"),
            RouteStop(route_id=route1.id, stop_name="Library", latitude=17.4445, longitude=78.3785, stop_order=3, estimated_arrival_time="08:15"),
            RouteStop(route_id=route1.id, stop_name="Canteen", latitude=17.4450, longitude=78.3790, stop_order=4, estimated_arrival_time="08:25"),
            RouteStop(route_id=route1.id, stop_name="Boys Hostel", latitude=17.4460, longitude=78.3800, stop_order=5, estimated_arrival_time="08:45")
        ]
        
        # Create route stops for route 2
        stops_route2 = [
            RouteStop(route_id=route2.id, stop_name="Girls Hostel", latitude=17.4430, longitude=78.3765, stop_order=1, estimated_arrival_time="09:00"),
            RouteStop(route_id=route2.id, stop_name="Admin Block", latitude=17.4438, longitude=78.3775, stop_order=2, estimated_arrival_time="09:10"),
            RouteStop(route_id=route2.id, stop_name="Central Library", latitude=17.4445, longitude=78.3785, stop_order=3, estimated_arrival_time="09:20")
        ]
        
        db.add_all(stops_route1 + stops_route2)
        db.commit()
        
        # Create sample buses
        buses = [
            Bus(bus_number="KA-01-A-1234", driver_name="Rajesh Kumar", capacity=50, route_id=route1.id, is_active=True),
            Bus(bus_number="KA-01-B-5678", driver_name="Suresh Babu", capacity=45, route_id=route2.id, is_active=True),
            Bus(bus_number="KA-01-C-9012", driver_name="Mahesh Reddy", capacity=55, route_id=route1.id, is_active=True),
            Bus(bus_number="KA-01-D-3456", driver_name="Ramesh Singh", capacity=40, route_id=route2.id, is_active=False)
        ]
        
        db.add_all(buses)
        db.commit()
        
        # Create sample location data
        locations = [
            BusLocation(bus_id=1, latitude=17.4440, longitude=78.3780, timestamp=datetime.utcnow(), speed=25.5),
            BusLocation(bus_id=2, latitude=17.4435, longitude=78.3770, timestamp=datetime.utcnow(), speed=30.0),
            BusLocation(bus_id=3, latitude=17.4450, longitude=78.3790, timestamp=datetime.utcnow(), speed=20.0)
        ]
        
        db.add_all(locations)
        db.commit()
        
        print("Sample data created successfully!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()