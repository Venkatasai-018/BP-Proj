"""Feedback dashboard endpoints."""
from fastapi import APIRouter, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db

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
async def list_feedback(db: Session = Depends(get_db)) -> list[FeedbackResponse]:
    """List all feedback entries."""
    from app.services import crud
    feedbacks = crud.get_feedbacks(db)
    return [
        FeedbackResponse(
            id=f.id,
            user_id=f.user_id,
            user_type=f.user_type,
            rating=f.rating,
            category=f.category,
            message=f.message,
            created_at=f.created_at.isoformat(),
            status=f.status
        )
        for f in feedbacks
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
async def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)) -> FeedbackResponse:
    """Submit new feedback."""
    from app.services import crud
    new_feedback = crud.create_feedback(
        db=db,
        user_id=feedback.user_id,
        user_type=feedback.user_type,
        rating=feedback.rating,
        category=feedback.category,
        message=feedback.message
    )
    return FeedbackResponse(
        id=new_feedback.id,
        user_id=new_feedback.user_id,
        user_type=new_feedback.user_type,
        rating=new_feedback.rating,
        category=new_feedback.category,
        message=new_feedback.message,
        created_at=new_feedback.created_at.isoformat(),
        status=new_feedback.status
    )
