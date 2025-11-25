"""Route management endpoints."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

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
async def list_routes() -> list[RouteResponse]:
    """List all configured routes."""
    # TODO: Replace with database query
    return [
        RouteResponse(
            id=1,
            route_name="Route A - Main Campus",
            description="From City Center to Main Campus",
            stops=[
                RouteStop(stop_name="City Center", latitude=11.0168, longitude=76.9558, order=1),
                RouteStop(stop_name="College Gate", latitude=11.0200, longitude=76.9600, order=2)
            ],
            status="active"
        )
    ]


@router.get("/{route_id}", response_model=RouteResponse)
async def get_route(route_id: int) -> RouteResponse:
    """Get details of a specific route."""
    # TODO: Fetch from database
    if route_id == 1:
        return RouteResponse(
            id=1,
            route_name="Route A - Main Campus",
            description="From City Center to Main Campus",
            stops=[
                RouteStop(stop_name="City Center", latitude=11.0168, longitude=76.9558, order=1),
                RouteStop(stop_name="College Gate", latitude=11.0200, longitude=76.9600, order=2)
            ],
            status="active"
        )
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")


@router.post("/", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
async def create_route(route: RouteCreate) -> RouteResponse:
    """Create a new transportation route."""
    # TODO: Save to database
    return RouteResponse(
        id=2,
        route_name=route.route_name,
        description=route.description,
        stops=route.stops,
        status="active"
    )


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_route(route_id: int) -> None:
    """Delete a route."""
    # TODO: Delete from database
    pass
