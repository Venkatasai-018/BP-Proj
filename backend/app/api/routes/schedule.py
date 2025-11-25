"""Scheduling module endpoints."""
from fastapi import APIRouter, status
from pydantic import BaseModel
from datetime import time

router = APIRouter(prefix="/schedules", tags=["schedule"])


class ScheduleCreate(BaseModel):
    """Schema for creating a schedule."""
    bus_id: int
    route_id: int
    departure_time: str
    days_of_week: list[str]


class ScheduleResponse(BaseModel):
    """Schema for schedule response."""
    id: int
    bus_number: str
    route_name: str
    departure_time: str
    days_of_week: list[str]
    status: str


@router.get("/", response_model=list[ScheduleResponse])
async def list_schedules() -> list[ScheduleResponse]:
    """List all bus schedules."""
    # TODO: Replace with database query
    return [
        ScheduleResponse(
            id=1,
            bus_number="BUS-001",
            route_name="Route A - Main Campus",
            departure_time="07:00 AM",
            days_of_week=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            status="active"
        ),
        ScheduleResponse(
            id=2,
            bus_number="BUS-002",
            route_name="Route B - Hostel",
            departure_time="08:00 AM",
            days_of_week=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            status="active"
        )
    ]


@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(schedule_id: int) -> ScheduleResponse:
    """Get a specific schedule."""
    # TODO: Fetch from database
    return ScheduleResponse(
        id=schedule_id,
        bus_number="BUS-001",
        route_name="Route A - Main Campus",
        departure_time="07:00 AM",
        days_of_week=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        status="active"
    )


@router.post("/", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(schedule: ScheduleCreate) -> ScheduleResponse:
    """Create a new bus schedule."""
    # TODO: Save to database
    return ScheduleResponse(
        id=3,
        bus_number=f"BUS-{schedule.bus_id:03d}",
        route_name=f"Route-{schedule.route_id}",
        departure_time=schedule.departure_time,
        days_of_week=schedule.days_of_week,
        status="active"
    )


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(schedule_id: int) -> None:
    """Delete a schedule."""
    # TODO: Delete from database
    pass
