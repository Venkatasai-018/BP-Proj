# TCE EduRide Backend 🚌

FastAPI backend service for the **TCE EduRide** bus tracking platform. Provides REST APIs for admin management, student tracking, driver operations, bus/route/schedule management, and feedback collection.

## ✨ Features

- **Admin Dashboard** - Manage buses, routes, schedules, and view analytics
- **Student Portal** - Track buses in real-time, view schedules
- **Driver Interface** - Update location, view assigned routes
- **Bus Management** - CRUD operations for bus fleet
- **Route Management** - Define stops and paths
- **Scheduling Module** - Timetable management
- **Feedback System** - Collect and analyze user feedback
- **JWT Authentication** - Secure API endpoints
- **CORS Support** - Ready for mobile/web frontend integration

## 🚀 Quick Start

### 1. Setup Environment

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```powershell
copy .env.example .env
```

### 3. Run the Server

```powershell
python -m uvicorn app.main:app --reload
```

Server will start at: **http://127.0.0.1:8000**

### 4. Access API Documentation

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/         # API endpoint modules
│   │       ├── admin.py    # Admin operations
│   │       ├── bus.py      # Bus CRUD
│   │       ├── driver.py   # Driver operations
│   │       ├── feedback.py # Feedback system
│   │       ├── route.py    # Route management
│   │       ├── schedule.py # Scheduling
│   │       └── student.py  # Student portal
│   ├── core/
│   │   ├── config.py      # App configuration
│   │   └── security.py    # Auth utilities
│   ├── models/            # Database models (TODO)
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   └── main.py           # Application entry
├── tests/                 # Test suite
├── requirements.txt       # Python dependencies
└── README.md

```

## 🧪 Run Tests

```powershell
pytest
```

## 📋 API Endpoints

### Health
- `GET /` - Basic health check
- `GET /health` - Detailed health status

### Admin (`/api/v1/admin`)
- `POST /admin/login` - Admin authentication
- `GET /admin/dashboard` - Dashboard statistics

### Buses (`/api/v1/buses`)
- `GET /buses` - List all buses
- `GET /buses/{id}` - Get bus details
- `POST /buses` - Create new bus
- `PUT /buses/{id}` - Update bus
- `DELETE /buses/{id}` - Delete bus

### Routes (`/api/v1/routes`)
- `GET /routes` - List all routes
- `GET /routes/{id}` - Get route details
- `POST /routes` - Create route
- `DELETE /routes/{id}` - Delete route

### Schedules (`/api/v1/schedules`)
- `GET /schedules` - List schedules
- `GET /schedules/{id}` - Get schedule
- `POST /schedules` - Create schedule
- `DELETE /schedules/{id}` - Delete schedule

### Students (`/api/v1/students`)
- `POST /students/login` - Student login
- `GET /students/dashboard` - Student dashboard
- `GET /students/track-bus` - Track assigned bus

### Drivers (`/api/v1/drivers`)
- `POST /drivers/login` - Driver login
- `GET /drivers/dashboard` - Driver dashboard
- `POST /drivers/location` - Update GPS location

### Feedback (`/api/v1/feedback`)
- `GET /feedback` - List all feedback
- `GET /feedback/summary` - Analytics dashboard
- `POST /feedback` - Submit feedback

## 🔧 Tech Stack

- **Framework**: FastAPI 0.115.5
- **Server**: Uvicorn 0.32.1
- **Validation**: Pydantic 2.10.3
- **Database**: SQLAlchemy 2.0.36 (ready for PostgreSQL/MySQL)
- **Auth**: JWT (python-jose + passlib)
- **Testing**: Pytest 8.3.4

## 🗄️ Database Setup (Coming Soon)

Database models and migrations will be added using SQLAlchemy + Alembic. Currently using mock data.

## 🔐 Authentication

The API uses JWT tokens for authentication. Login endpoints return access tokens that must be included in subsequent requests:

```
Authorization: Bearer <access_token>
```

## 🌐 CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:3000` (Web)
- `http://localhost:8081` (Expo)
- Update `CORS_ORIGINS` in `.env` for production

## 📝 Next Steps

- [ ] Implement database models and migrations
- [ ] Add proper JWT authentication middleware
- [ ] Integrate real-time GPS tracking
- [ ] Add WebSocket support for live updates
- [ ] Implement rate limiting
- [ ] Add comprehensive logging
- [ ] Deploy to production

## 📄 License

MIT License - TCE EduRide Project
