"""Entry point for the TCE EduRide FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import init_db
from app.api.routes import admin, bus, driver, feedback, route, schedule, student

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="1.0.0",
    description="Bus Tracking System API for TCE EduRide"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()
    print("✅ Database initialized successfully!")

# Include API routers
app.include_router(admin.router, prefix=settings.api_v1_prefix)
app.include_router(bus.router, prefix=settings.api_v1_prefix)
app.include_router(route.router, prefix=settings.api_v1_prefix)
app.include_router(schedule.router, prefix=settings.api_v1_prefix)
app.include_router(student.router, prefix=settings.api_v1_prefix)
app.include_router(driver.router, prefix=settings.api_v1_prefix)
app.include_router(feedback.router, prefix=settings.api_v1_prefix)


@app.get("/", tags=["health"])
async def read_root() -> dict[str, str]:
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": "1.0.0"
    }


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name
    }
