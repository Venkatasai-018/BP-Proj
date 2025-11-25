"""Initialize default admin accounts in the database."""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, init_db
from app.services.crud import create_admin, get_admin_by_username


def seed_database():
    """Seed the database with initial data."""
    db: Session = SessionLocal()
    
    try:
        # Create default admin accounts if they don't exist
        if not get_admin_by_username(db, "admin"):
            create_admin(db, username="admin", password="admin123", name="Administrator")
            print("✅ Created admin user: admin")
        
        if not get_admin_by_username(db, "tceeduride"):
            create_admin(db, username="tceeduride", password="tce@2025", name="TCE Admin")
            print("✅ Created admin user: tceeduride")
            
    finally:
        db.close()


if __name__ == "__main__":
    print("🔧 Initializing database...")
    init_db()
    print("✅ Database tables created!")
    
    print("\n🌱 Seeding database...")
    seed_database()
    print("\n✨ Database setup complete!")
