"""Scheduling module endpoints."""
from fastapi import APIRouter, status, Depends, HTTPException
from pydantic import BaseModel
from datetime import time
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import crud

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
async def list_schedules(db: Session = Depends(get_db)) -> list[ScheduleResponse]:
    """List all bus schedules."""
    schedules = crud.get_schedules(db)
    return [
        ScheduleResponse(
            id=s.id,
            bus_number=s.bus.bus_number if s.bus else f"BUS-{s.bus_id}",
            route_name=s.route.route_name if s.route else f"Route-{s.route_id}",
            departure_time=s.departure_time,
            days_of_week=s.days_of_week.split(",") if s.days_of_week else [],
            status="active"
        )
        for s in schedules
    ]


@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(schedule_id: int, db: Session = Depends(get_db)) -> ScheduleResponse:
    """Get a specific schedule."""
    schedule = crud.get_schedule_by_id(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    return ScheduleResponse(
        id=schedule.id,
        bus_number=schedule.bus.bus_number if schedule.bus else f"BUS-{schedule.bus_id}",
        route_name=schedule.route.route_name if schedule.route else f"Route-{schedule.route_id}",
        departure_time=schedule.departure_time,
        days_of_week=schedule.days_of_week.split(",") if schedule.days_of_week else [],
        status="active"
@router.post("/", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(schedule: ScheduleCreate, db: Session = Depends(get_db)) -> ScheduleResponse:
    """Create a new bus schedule."""
    # Verify bus and route exist
    bus = crud.get_bus(db, schedule.bus_id)
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    route = crud.get_route(db, schedule.route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Create schedule
    days_str = ",".join(schedule.days_of_week)
    new_schedule = crud.create_schedule(
        db=db,
        bus_id=schedule.bus_id,
@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(schedule_id: int, schedule: ScheduleCreate, db: Session = Depends(get_db)) -> ScheduleResponse:
    """Update a schedule."""
    # Check if schedule exists
    existing = crud.get_schedule_by_id(db, schedule_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    # Verify bus and route exist
    bus = crud.get_bus(db, schedule.bus_id)
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    route = crud.get_route(db, schedule.route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Update schedule
    days_str = ",".join(schedule.days_of_week)
    updated_schedule = crud.update_schedule(
        db=db,
        schedule_id=schedule_id,
        bus_id=schedule.bus_id,
        route_id=schedule.route_id,
        departure_time=schedule.departure_time,
        days_of_week=days_str
    )
    
    if not updated_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    return ScheduleResponse(
        id=updated_schedule.id,
        bus_number=bus.bus_number,
        route_name=route.route_name,
        departure_time=updated_schedule.departure_time,
        days_of_week=schedule.days_of_week,
        status="active"
    )


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(schedule_id: int, db: Session = Depends(get_db)) -> None:
    """Delete a schedule."""
    success = crud.delete_schedule(db, schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return ScheduleResponse(
        id=new_schedule.id,
        bus_number=bus.bus_number,
        route_name=route.route_name,
        departure_time=new_schedule.departure_time,
        days_of_week=schedule.days_of_week,
        status="active"
    )   departure_time=schedule.departure_time,
        days_of_week=schedule.days_of_week,
        status="active"
    )


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(schedule_id: int) -> None:
    """Delete a schedule."""
    # TODO: Delete from database
    pass
