"""Feedback dashboard endpoints."""
from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackCreate(BaseModel):
    """Schema for submitting feedback."""
    user_id: int
    user_type: str  # student, driver, admin
    rating: int  # 1-5
    category: str  # service, bus_condition, driver_behavior, etc.
    message: str


class FeedbackResponse(BaseModel):
    """Schema for feedback response."""
    id: int
    user_id: int
    user_type: str
    rating: int
    category: str
    message: str
    created_at: str
    status: str


class FeedbackSummary(BaseModel):
    """Analytics summary for feedback dashboard."""
    total_feedback: int
    average_rating: float
    feedback_by_category: dict[str, int]
    recent_feedback: list[FeedbackResponse]


@router.get("/", response_model=list[FeedbackResponse])
async def list_feedback() -> list[FeedbackResponse]:
    """List all feedback entries."""
    # TODO: Replace with database query
    return [
        FeedbackResponse(
            id=1,
            user_id=1,
            user_type="student",
            rating=5,
            category="service",
            message="Excellent service and timely arrival",
            created_at="2025-11-25T10:30:00",
            status="reviewed"
        )
    ]


@router.get("/summary", response_model=FeedbackSummary)
async def get_feedback_summary() -> FeedbackSummary:
    """Return feedback analytics for the dashboard."""
    # TODO: Calculate from database
    return FeedbackSummary(
        total_feedback=150,
        average_rating=4.2,
        feedback_by_category={
            "service": 50,
            "bus_condition": 40,
            "driver_behavior": 35,
            "route": 25
        },
        recent_feedback=[
            FeedbackResponse(
                id=1,
                user_id=1,
                user_type="student",
                rating=5,
                category="service",
                message="Excellent service",
                created_at="2025-11-25T10:30:00",
                status="reviewed"
            )
        ]
    )


@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(feedback: FeedbackCreate) -> FeedbackResponse:
    """Submit new feedback."""
    # TODO: Save to database
    return FeedbackResponse(
        id=2,
        user_id=feedback.user_id,
        user_type=feedback.user_type,
        rating=feedback.rating,
        category=feedback.category,
        message=feedback.message,
        created_at="2025-11-25T11:00:00",
        status="pending"
    )
