# Real-time Bus Tracking Application

A comprehensive real-time bus tracking system with authentication, admin controls, and live GPS tracking for colleges and universities.

## 🌟 Features

- **Real-time GPS Tracking** - Live bus location updates with WebSocket connections
- **User Authentication** - Secure login/signup system with JWT tokens
- **Role-based Authorization** - Student, Staff, Driver, Admin, and Super Admin roles
- **Admin Dashboard** - Complete user and bus management interface
- **Permission-based Access** - Fine-grained control over who can track which buses/routes
- **Live Bus Simulation** - Realistic GPS movement simulation for demonstration
- **Responsive Frontend** - Mobile-friendly web interface
- **RESTful API** - Complete API with automatic documentation

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (for containerized deployment)
- Git
- Web browser

### Option 1: Single Docker Container (Recommended for EC2)

This deployment uses a single Docker container with all services included.

**For Local Development:**
```bash
# Clone repository
git clone https://github.com/Venkatasai-018/BP-Proj.git
cd BP-Proj

# Build and run (Linux/Mac)
chmod +x docker-build.sh
./docker-build.sh

# Or on Windows
.\docker-build.ps1
```

**For EC2 Deployment:**
```bash
# On your EC2 instance (Ubuntu/Amazon Linux)
wget https://raw.githubusercontent.com/Venkatasai-018/BP-Proj/main/deploy-ec2.sh
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

### Option 2: Manual Quick Start

```bash
# Clone and run with single container
docker build -t bus-tracking-app .
docker run -d --name bus-tracking-container -p 80:80 -p 8000:8000 bus-tracking-app
```

Or use the provided PowerShell script:
```powershell
.\docker-build.ps1
```

**Access the Application:**
- 📱 **Live Tracking**: http://localhost/
- 🔗 **API Docs**: http://localhost:8000/docs  
- 👨‍💼 **Admin Panel**: http://localhost/admin
- 🔐 **Admin Login**: `admin` / `secret`

## 🌐 EC2 Deployment Guide

### Prerequisites for EC2
- AWS EC2 instance (Ubuntu 20.04+ or Amazon Linux 2)
- Security Group allowing ports 80, 8000, and 22
- SSH access to your EC2 instance

### Automated EC2 Deployment

1. **Connect to your EC2 instance:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Run the automated deployment script:**
```bash
curl -fsSL https://raw.githubusercontent.com/Venkatasai-018/BP-Proj/main/deploy-ec2.sh -o deploy-ec2.sh
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

3. **Access your application:**
- Replace `your-ec2-ip` with your actual EC2 public IP
- Live Tracking: `http://your-ec2-ip/`
- Admin Panel: `http://your-ec2-ip/admin`
- API Documentation: `http://your-ec2-ip:8000/docs`

### Manual EC2 Setup

If you prefer manual setup:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Clone repository
git clone https://github.com/Venkatasai-018/BP-Proj.git
cd BP-Proj

# Build and run
docker build -t bus-tracking .
docker run -d --name bus-tracking --restart unless-stopped \
  -p 80:80 -p 8000:8000 \
  -v bus_data:/var/lib/postgresql \
  bus-tracking
```

### EC2 Security Configuration

**Required Security Group Rules:**
```
Type: HTTP, Port: 80, Source: 0.0.0.0/0
Type: Custom TCP, Port: 8000, Source: 0.0.0.0/0
Type: SSH, Port: 22, Source: Your IP
```

**Production Security (Recommended):**
- Set up SSL/TLS with Let's Encrypt
- Use Application Load Balancer
- Restrict API access to specific IPs
- Configure CloudWatch monitoring

## 💻 Manual Setup (Without Docker)

### Prerequisites
- Python 3.11 or higher
- pip (Python package manager)

### Installation

1. **Setup Dependencies**
   ```powershell
   .\setup-manual.ps1
   ```

2. **Start the Backend**
   ```powershell
   .\start-backend.ps1
   ```

3. **Open Frontend**
   - Open `frontend/live-tracker.html` in your web browser
   - Or serve it with a simple HTTP server

### Manual Commands

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Initialize database and create admin user
python -c "
from database import engine, Base
Base.metadata.create_all(bind=engine)

from sqlalchemy.orm import sessionmaker
from database import User
from auth import auth_manager

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

admin_user = User(
    username='admin',
    email='admin@college.edu', 
    full_name='System Administrator',
    hashed_password=auth_manager.get_password_hash('admin123'),
    role='super_admin',
    is_active=True
)
db.add(admin_user)
db.commit()
db.close()
print('Admin user created: admin/admin123')
"

# Start the server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🔐 Default Credentials

**Super Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: `super_admin`

*⚠️ Change default credentials in production!*

## 📊 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Admin Management
- `GET /admin/users` - List all users
- `PUT /admin/users/{id}` - Update user
- `DELETE /admin/users/{id}` - Delete user
- `GET /admin/dashboard` - Admin dashboard data

### Bus Management
- `GET /buses` - Get buses (permission filtered)
- `POST /admin/buses` - Create bus (admin)
- `PUT /admin/buses/{id}` - Update bus (admin)
- `DELETE /admin/buses/{id}` - Delete bus (admin)

### Route Management
- `GET /routes` - Get routes (permission filtered)
- `POST /admin/routes` - Create route (admin)
- `PUT /admin/routes/{id}` - Update route (admin)

### Live Tracking
- `GET /live/buses` - Real-time bus data
- `GET /live/bus/{id}` - Specific bus data
- `GET /live/statistics` - System statistics
- `WebSocket /ws` - Live tracking connection

### Permission Management
- `POST /admin/permissions` - Grant user permissions
- `GET /admin/permissions` - List permissions
- `DELETE /admin/permissions/{id}` - Revoke permission

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │────│   FastAPI        │────│   SQLite        │
│   (HTML/JS)     │    │   Backend        │    │   Database      │
│                 │    │                  │    │                 │
│ - Live Tracker  │    │ - Authentication │    │ - Users         │
│ - Admin Panel   │    │ - Bus Management │    │ - Buses         │
│ - User Login    │    │ - Live Tracking  │    │ - Routes        │
└─────────────────┘    │ - WebSocket API  │    │ - Permissions   │
                       └──────────────────┘    │ - Activity Logs │
                                              └─────────────────┘
```

## 🔧 Configuration

### Environment Variables
```bash
DATABASE_URL=sqlite:///./bus_tracking.db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### User Roles
- **student** - Can track permitted buses
- **staff** - Can track permitted buses  
- **driver** - Can track assigned buses
- **admin** - Can manage users and buses
- **super_admin** - Full system access

## 📱 Frontend Features

### Live Tracker (`live-tracker.html`)
- Real-time bus locations on interactive map
- Bus status indicators (moving, stopped, delayed)
- Route visualization
- Passenger count display
- Live statistics dashboard

### Authentication
- User login/logout
- Permission-based content filtering
- Session management

### Admin Interface
- User management (create, update, delete)
- Bus fleet management
- Route configuration
- Permission assignment
- Activity monitoring

## 🔄 Live Tracking System

The application includes a sophisticated simulation system that provides:

- **Realistic GPS Movement** - Buses follow predefined routes with realistic speed variations
- **Passenger Simulation** - Dynamic passenger count changes at stops
- **Status Updates** - Real-time status (moving, at_stop, delayed)
- **WebSocket Broadcasting** - Live updates to all connected clients
- **Permission Filtering** - Users only see buses they have permission to track

## 🛠️ Development

### Adding New Features

1. **Backend Changes**
   - Add endpoints in `main.py`
   - Update models in `models.py` and `database.py`
   - Modify authentication in `auth.py`

2. **Frontend Changes**
   - Update HTML in `frontend/` directory
   - Modify JavaScript for new API calls
   - Add new UI components

### Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `user_permissions` - Permission assignments  
- `user_activity_logs` - Activity tracking
- `buses` - Bus fleet information
- `routes` - Route definitions
- `route_stops` - Stop information
- `bus_locations` - GPS tracking data

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Reinitialize database
python -c "from database import engine, Base; Base.metadata.drop_all(engine); Base.metadata.create_all(engine)"
```

**Permission Denied**
- Ensure user has appropriate role
- Check permission assignments in admin panel

**WebSocket Connection Failed**  
- Verify port 8000 is accessible
- Check firewall settings

**Docker Build Failed**
- Ensure Docker Desktop is running
- Check available disk space
- Try: `docker system prune -f`

## 📞 Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review the application logs
3. Verify user permissions and roles
4. Check database connectivity

## 📄 License

This project is created for educational purposes and college bus tracking systems.

---

**🚀 Ready to track your buses in real-time!**