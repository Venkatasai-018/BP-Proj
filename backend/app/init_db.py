"""Initialize default accounts in the database."""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.services.crud import (
    create_admin, get_admin_by_username,
    create_student, get_student_by_email,
    create_driver, get_driver_by_email
)


def seed_database():
    """Seed the database with initial data."""
    db: Session = SessionLocal()
    
    try:
        # Create default admin accounts if they don't exist
        if not get_admin_by_username(db, "admin"):
            create_admin(db, username="admin", password="admin123", name="Administrator")
            print("✅ Created admin user: admin / admin123")
        
        if not get_admin_by_username(db, "tceeduride"):
            create_admin(db, username="tceeduride", password="tce@2025", name="TCE Admin")
            print("✅ Created admin user: tceeduride / tce@2025")
        
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
            print("✅ Created student user: student@tce.edu / student123")
        
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
            print("✅ Created driver user: driver@tce.edu / driver123")
            
    finally:
        db.close()


if __name__ == "__main__":
    print("🔧 Initializing database...")
    init_db()
    print("✅ Database tables created!")
    
    print("\n🌱 Seeding database...")
    seed_database()
    print("\n✨ Database setup complete!")
