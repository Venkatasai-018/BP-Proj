"""Route management endpoints."""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import crud

router = APIRouter(prefix="/routes", tags=["route"])


class RouteStop(BaseModel):
    """A stop along a route."""
    stop_name: str
    latitude: float
    longitude: float
    order: int


class RouteCreate(BaseModel):
    """Schema for creating a route."""
    route_name: str
    description: str
    stops: list[RouteStop]


class RouteResponse(BaseModel):
    """Schema for route response."""
    id: int
    route_name: str
    description: str
    stops: list[RouteStop]
    status: str


@router.get("/", response_model=list[RouteResponse])
async def list_routes(db: Session = Depends(get_db)) -> list[RouteResponse]:
    """List all configured routes."""
    routes = crud.get_routes(db)
    return [
        RouteResponse(
            id=route.id,
            route_name=route.route_name,
            description=route.description or "",
            stops=[
                RouteStop(
                    stop_name=stop.stop_name,
                    latitude=stop.latitude,
                    longitude=stop.longitude,
                    order=stop.order
                )
                for stop in route.stops
            ],
            status=route.status
        )
        for route in routes
    ]


@router.get("/{route_id}", response_model=RouteResponse)
async def get_route(route_id: int, db: Session = Depends(get_db)) -> RouteResponse:
    """Get details of a specific route."""
    route = crud.get_route(db, route_id)
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    
    return RouteResponse(
        id=route.id,
        route_name=route.route_name,
        description=route.description or "",
        stops=[
            RouteStop(
                stop_name=stop.stop_name,
                latitude=stop.latitude,
                longitude=stop.longitude,
                order=stop.order
            )
            for stop in route.stops
        ],
        status=route.status
    )


@router.post("/", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
async def create_route(route: RouteCreate, db: Session = Depends(get_db)) -> RouteResponse:
    """Create a new transportation route."""
    # Create the route
    db_route = crud.create_route(db, route.route_name, route.description)
    
    # Create all stops for the route
    for stop in route.stops:
        crud.create_route_stop(
            db,
            route_id=db_route.id,
            stop_name=stop.stop_name,
            latitude=stop.latitude,
            longitude=stop.longitude,
            order=stop.order
        )
    
    # Refresh to get the stops
    db.refresh(db_route)
    
    return RouteResponse(
        id=db_route.id,
        route_name=db_route.route_name,
        description=db_route.description or "",
        stops=[
            RouteStop(
                stop_name=stop.stop_name,
                latitude=stop.latitude,
                longitude=stop.longitude,
                order=stop.order
            )
            for stop in db_route.stops
        ],
        status=db_route.status
    )


@router.put("/{route_id}", response_model=RouteResponse)
async def update_route(route_id: int, route: RouteCreate, db: Session = Depends(get_db)) -> RouteResponse:
    """Update an existing route."""
    db_route = crud.get_route(db, route_id)
    if not db_route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    
    # Update route details
    db_route.route_name = route.route_name
    db_route.description = route.description
    
    # Delete existing stops
    for stop in db_route.stops:
        db.delete(stop)
    
    # Create new stops
    for stop in route.stops:
        crud.create_route_stop(
            db,
            route_id=db_route.id,
            stop_name=stop.stop_name,
            latitude=stop.latitude,
            longitude=stop.longitude,
            order=stop.order
        )
    
    db.commit()
    db.refresh(db_route)
    
    return RouteResponse(
        id=db_route.id,
        route_name=db_route.route_name,
        description=db_route.description or "",
        stops=[
            RouteStop(
                stop_name=stop.stop_name,
                latitude=stop.latitude,
                longitude=stop.longitude,
                order=stop.order
            )
            for stop in db_route.stops
        ],
        status=db_route.status
    )


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_route(route_id: int, db: Session = Depends(get_db)) -> None:
    """Delete a route."""
    route = crud.get_route(db, route_id)
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    
    db.delete(route)
    db.commit()
