from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Studio Hub Elite API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== ENUMS ==============
class UserRole(str, Enum):
    MUSIC = "music"
    GAMING = "gaming"
    INSTRUMENT = "instrument"

class ContributionType(str, Enum):
    VOCALS = "vocals"
    BEAT = "beat"
    MIX = "mix"
    MASTER = "master"
    INSTRUMENT = "instrument"
    WRITING = "writing"
    PRODUCTION = "production"

class GameType(str, Enum):
    FPS = "fps"
    FIGHTING = "fighting"
    RACING = "racing"
    SPORTS = "sports"
    STRATEGY = "strategy"
    BATTLE_ROYALE = "battle_royale"

class LeaderboardPeriod(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    SEASONAL = "seasonal"
    ALL_TIME = "all_time"

class LeaderboardCategory(str, Enum):
    ATTENDANCE_MONTHLY = "attendance_monthly"
    MUSIC_IMPACT = "music_impact"
    GAMING_RANKED = "gaming_ranked"
    HYBRID_MASTER = "hybrid_master"

# ============== MODELS ==============

# Auth Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    roles: List[UserRole] = []
    level: int = 1
    xp: int = 0
    streak_days: int = 0
    last_active: Optional[datetime] = None
    onboarding_completed: bool = False
    goals: List[str] = []
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Profile Update
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    roles: Optional[List[UserRole]] = None
    goals: Optional[List[str]] = None

class OnboardingData(BaseModel):
    name: str
    roles: List[UserRole]
    goals: List[str]

# Studio Sessions
class StudioSession(BaseModel):
    session_id: str = Field(default_factory=lambda: f"session_{uuid.uuid4().hex[:12]}")
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    max_participants: int = 10
    session_type: str  # music, gaming, hybrid
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudioSessionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    max_participants: int = 10
    session_type: str

# Attendance
class Attendance(BaseModel):
    attendance_id: str = Field(default_factory=lambda: f"att_{uuid.uuid4().hex[:12]}")
    user_id: str
    session_id: Optional[str] = None
    check_in: datetime
    check_out: Optional[datetime] = None
    duration_minutes: int = 0
    xp_earned: int = 0

class AttendanceCheckIn(BaseModel):
    session_id: Optional[str] = None

# Tracks
class Track(BaseModel):
    track_id: str = Field(default_factory=lambda: f"track_{uuid.uuid4().hex[:12]}")
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    duration_seconds: int = 0
    cover_image: Optional[str] = None
    audio_url: Optional[str] = None
    created_by: str
    contributors: List[str] = []
    listens: int = 0
    likes: int = 0
    shares: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TrackCreate(BaseModel):
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    duration_seconds: int = 0
    cover_image: Optional[str] = None

class TrackContribution(BaseModel):
    contribution_id: str = Field(default_factory=lambda: f"contrib_{uuid.uuid4().hex[:12]}")
    track_id: str
    user_id: str
    contribution_type: ContributionType
    notes: Optional[str] = None
    xp_earned: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContributionCreate(BaseModel):
    contribution_type: ContributionType
    notes: Optional[str] = None

# Gaming
class GameMatch(BaseModel):
    match_id: str = Field(default_factory=lambda: f"match_{uuid.uuid4().hex[:12]}")
    title: str
    game_type: GameType
    game_name: str
    participants: List[str] = []
    winner_id: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed
    created_by: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MatchCreate(BaseModel):
    title: str
    game_type: GameType
    game_name: str
    participants: List[str] = []

class GameScore(BaseModel):
    score_id: str = Field(default_factory=lambda: f"score_{uuid.uuid4().hex[:12]}")
    match_id: str
    user_id: str
    score: int
    kills: int = 0
    deaths: int = 0
    assists: int = 0
    rank_position: int = 0
    xp_earned: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ScoreSubmit(BaseModel):
    user_id: str
    score: int
    kills: int = 0
    deaths: int = 0
    assists: int = 0
    rank_position: int = 0

# Badges
class Badge(BaseModel):
    badge_id: str
    name: str
    description: str
    icon: str
    category: str  # attendance, music, gaming, hybrid
    requirement_type: str
    requirement_value: int
    xp_reward: int = 0
    rarity: str = "common"  # common, rare, epic, legendary

class UserBadge(BaseModel):
    user_badge_id: str = Field(default_factory=lambda: f"ub_{uuid.uuid4().hex[:12]}")
    user_id: str
    badge_id: str
    earned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Gamification Events
class GamificationEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: f"event_{uuid.uuid4().hex[:12]}")
    user_id: str
    event_type: str
    xp_amount: int
    description: str
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Leaderboard
class LeaderboardEntry(BaseModel):
    user_id: str
    name: str
    picture: Optional[str] = None
    score: int
    rank: int
    level: int

class LeaderboardSnapshot(BaseModel):
    snapshot_id: str = Field(default_factory=lambda: f"snap_{uuid.uuid4().hex[:12]}")
    category: LeaderboardCategory
    period: LeaderboardPeriod
    entries: List[Dict[str, Any]] = []
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Seasons
class Season(BaseModel):
    season_id: str = Field(default_factory=lambda: f"season_{uuid.uuid4().hex[:12]}")
    name: str
    start_date: datetime
    end_date: datetime
    is_active: bool = False
    rewards: List[Dict[str, Any]] = []

# Audit Logs
class AuditLog(BaseModel):
    log_id: str = Field(default_factory=lambda: f"log_{uuid.uuid4().hex[:12]}")
    user_id: str
    action: str
    resource_type: str
    resource_id: str
    details: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Community Activity
class ActivityFeedItem(BaseModel):
    activity_id: str = Field(default_factory=lambda: f"activity_{uuid.uuid4().hex[:12]}")
    user_id: str
    user_name: str
    activity_type: str
    description: str
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============== AUTH HELPERS ==============

async def get_current_user(request: Request) -> User:
    """Get current authenticated user from session token"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user_doc)

async def get_optional_user(request: Request) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# ============== AUTH ENDPOINTS ==============

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id from Emergent Auth for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth to get user data
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
    
    if auth_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    
    auth_data = auth_response.json()
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": name,
                "picture": picture,
                "last_active": datetime.now(timezone.utc)
            }}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = User(
            user_id=user_id,
            email=email,
            name=name,
            picture=picture
        )
        await db.users.insert_one(new_user.dict())
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session = UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at
    )
    
    # Delete old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session.dict())
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    # Get updated user
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {"user": user_doc, "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return user.dict()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout current user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ============== USER ENDPOINTS ==============

@api_router.get("/users/profile")
async def get_profile(user: User = Depends(get_current_user)):
    """Get current user's profile with stats"""
    # Get attendance count
    attendance_count = await db.attendance.count_documents({"user_id": user.user_id})
    
    # Get track count
    track_count = await db.tracks.count_documents({"created_by": user.user_id})
    
    # Get contribution count
    contribution_count = await db.track_contributions.count_documents({"user_id": user.user_id})
    
    # Get match count
    match_count = await db.game_scores.count_documents({"user_id": user.user_id})
    
    # Get badges
    badges = await db.user_badges.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    badge_ids = [b["badge_id"] for b in badges]
    badge_details = await db.badges.find({"badge_id": {"$in": badge_ids}}, {"_id": 0}).to_list(100)
    
    return {
        **user.dict(),
        "stats": {
            "attendance_count": attendance_count,
            "track_count": track_count,
            "contribution_count": contribution_count,
            "match_count": match_count,
            "badge_count": len(badges)
        },
        "badges": badge_details
    }

@api_router.put("/users/profile")
async def update_profile(update: ProfileUpdate, user: User = Depends(get_current_user)):
    """Update user profile"""
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": update_data}
        )
    
    updated_user = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return updated_user

@api_router.post("/users/onboarding")
async def complete_onboarding(data: OnboardingData, user: User = Depends(get_current_user)):
    """Complete user onboarding"""
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "name": data.name,
            "roles": [r.value for r in data.roles],
            "goals": data.goals,
            "onboarding_completed": True
        }}
    )
    
    # Award onboarding badge
    await award_badge(user.user_id, "first_steps")
    
    # Log gamification event
    await log_gamification_event(user.user_id, "onboarding_complete", 100, "Completed onboarding")
    
    updated_user = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return updated_user

# ============== STUDIO SESSIONS ==============

@api_router.get("/sessions")
async def get_sessions(
    upcoming: bool = True,
    limit: int = 10,
    user: User = Depends(get_current_user)
):
    """Get studio sessions"""
    query = {}
    if upcoming:
        query["start_time"] = {"$gte": datetime.now(timezone.utc)}
    
    sessions = await db.studio_sessions.find(
        query,
        {"_id": 0}
    ).sort("start_time", 1).limit(limit).to_list(limit)
    
    return sessions

@api_router.post("/sessions")
async def create_session(
    session: StudioSessionCreate,
    user: User = Depends(get_current_user)
):
    """Create a new studio session"""
    new_session = StudioSession(
        **session.dict(),
        created_by=user.user_id
    )
    await db.studio_sessions.insert_one(new_session.dict())
    return new_session.dict()

# ============== ATTENDANCE ==============

@api_router.post("/attendance/check-in")
async def check_in(data: AttendanceCheckIn, user: User = Depends(get_current_user)):
    """Check in to studio"""
    # Check if already checked in
    active_attendance = await db.attendance.find_one({
        "user_id": user.user_id,
        "check_out": None
    })
    
    if active_attendance:
        raise HTTPException(status_code=400, detail="Already checked in")
    
    attendance = Attendance(
        user_id=user.user_id,
        session_id=data.session_id,
        check_in=datetime.now(timezone.utc)
    )
    
    await db.attendance.insert_one(attendance.dict())
    
    # Update streak
    await update_streak(user.user_id)
    
    # Log activity
    await log_activity(user.user_id, user.name, "check_in", f"{user.name} checked in to the studio")
    
    return attendance.dict()

@api_router.post("/attendance/check-out")
async def check_out(user: User = Depends(get_current_user)):
    """Check out from studio"""
    active_attendance = await db.attendance.find_one({
        "user_id": user.user_id,
        "check_out": None
    }, {"_id": 0})
    
    if not active_attendance:
        raise HTTPException(status_code=400, detail="Not checked in")
    
    check_out_time = datetime.now(timezone.utc)
    check_in_time = active_attendance["check_in"]
    if isinstance(check_in_time, str):
        check_in_time = datetime.fromisoformat(check_in_time)
    if check_in_time.tzinfo is None:
        check_in_time = check_in_time.replace(tzinfo=timezone.utc)
    
    duration = int((check_out_time - check_in_time).total_seconds() / 60)
    
    # Calculate XP (1 XP per minute, max 120)
    xp_earned = min(duration, 120)
    
    await db.attendance.update_one(
        {"attendance_id": active_attendance["attendance_id"]},
        {"$set": {
            "check_out": check_out_time,
            "duration_minutes": duration,
            "xp_earned": xp_earned
        }}
    )
    
    # Update user XP
    await add_xp(user.user_id, xp_earned, "attendance", f"Studio session ({duration} mins)")
    
    # Log activity
    await log_activity(user.user_id, user.name, "check_out", f"{user.name} checked out after {duration} minutes")
    
    return {
        "attendance_id": active_attendance["attendance_id"],
        "duration_minutes": duration,
        "xp_earned": xp_earned
    }

@api_router.get("/attendance/history")
async def get_attendance_history(
    limit: int = 50,
    user: User = Depends(get_current_user)
):
    """Get user's attendance history"""
    history = await db.attendance.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("check_in", -1).limit(limit).to_list(limit)
    
    return history

@api_router.get("/attendance/heatmap")
async def get_attendance_heatmap(user: User = Depends(get_current_user)):
    """Get attendance heatmap data for the last 90 days"""
    ninety_days_ago = datetime.now(timezone.utc) - timedelta(days=90)
    
    attendance = await db.attendance.find({
        "user_id": user.user_id,
        "check_in": {"$gte": ninety_days_ago}
    }, {"_id": 0}).to_list(1000)
    
    # Group by date
    heatmap = {}
    for record in attendance:
        check_in = record["check_in"]
        if isinstance(check_in, str):
            check_in = datetime.fromisoformat(check_in)
        date_key = check_in.strftime("%Y-%m-%d")
        
        if date_key not in heatmap:
            heatmap[date_key] = {"count": 0, "duration": 0}
        heatmap[date_key]["count"] += 1
        heatmap[date_key]["duration"] += record.get("duration_minutes", 0)
    
    return heatmap

@api_router.get("/attendance/status")
async def get_attendance_status(user: User = Depends(get_current_user)):
    """Get current check-in status"""
    active = await db.attendance.find_one({
        "user_id": user.user_id,
        "check_out": None
    }, {"_id": 0})
    
    return {
        "is_checked_in": active is not None,
        "attendance": active
    }

# ============== TRACKS ==============

@api_router.get("/tracks")
async def get_tracks(
    limit: int = 20,
    offset: int = 0,
    user: User = Depends(get_current_user)
):
    """Get all tracks"""
    tracks = await db.tracks.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
    
    # Enrich with contributor details
    for track in tracks:
        contributors = await db.track_contributions.find(
            {"track_id": track["track_id"]},
            {"_id": 0}
        ).to_list(100)
        
        contributor_ids = list(set([c["user_id"] for c in contributors]))
        contributor_users = await db.users.find(
            {"user_id": {"$in": contributor_ids}},
            {"_id": 0, "user_id": 1, "name": 1, "picture": 1}
        ).to_list(100)
        
        track["contributor_details"] = contributor_users
        track["contribution_breakdown"] = contributors
    
    return tracks

@api_router.post("/tracks")
async def create_track(
    track_data: TrackCreate,
    user: User = Depends(get_current_user)
):
    """Create a new track"""
    track = Track(
        **track_data.dict(),
        created_by=user.user_id,
        contributors=[user.user_id]
    )
    
    await db.tracks.insert_one(track.dict())
    
    # Award XP for creating track
    await add_xp(user.user_id, 50, "music", "Created a new track")
    
    # Log activity
    await log_activity(user.user_id, user.name, "track_created", f"{user.name} created track: {track.title}")
    
    return track.dict()

@api_router.get("/tracks/{track_id}")
async def get_track(track_id: str, user: User = Depends(get_current_user)):
    """Get track details"""
    track = await db.tracks.find_one({"track_id": track_id}, {"_id": 0})
    
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Get contributions
    contributions = await db.track_contributions.find(
        {"track_id": track_id},
        {"_id": 0}
    ).to_list(100)
    
    # Get contributor details
    contributor_ids = list(set([c["user_id"] for c in contributions]))
    contributors = await db.users.find(
        {"user_id": {"$in": contributor_ids}},
        {"_id": 0, "user_id": 1, "name": 1, "picture": 1}
    ).to_list(100)
    
    return {
        **track,
        "contributions": contributions,
        "contributor_details": contributors
    }

@api_router.post("/tracks/{track_id}/contributions")
async def add_contribution(
    track_id: str,
    data: ContributionCreate,
    user: User = Depends(get_current_user)
):
    """Add a contribution to a track"""
    track = await db.tracks.find_one({"track_id": track_id})
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    contribution = TrackContribution(
        track_id=track_id,
        user_id=user.user_id,
        contribution_type=data.contribution_type,
        notes=data.notes,
        xp_earned=30
    )
    
    await db.track_contributions.insert_one(contribution.dict())
    
    # Add user to track contributors
    await db.tracks.update_one(
        {"track_id": track_id},
        {"$addToSet": {"contributors": user.user_id}}
    )
    
    # Award XP
    await add_xp(user.user_id, 30, "music", f"Contributed {data.contribution_type.value} to track")
    
    # Log activity
    await log_activity(
        user.user_id, user.name, "contribution",
        f"{user.name} contributed {data.contribution_type.value} to a track"
    )
    
    return contribution.dict()

@api_router.post("/tracks/{track_id}/listen")
async def record_listen(track_id: str, user: User = Depends(get_current_user)):
    """Record a track listen"""
    await db.tracks.update_one(
        {"track_id": track_id},
        {"$inc": {"listens": 1}}
    )
    return {"success": True}

@api_router.post("/tracks/{track_id}/like")
async def like_track(track_id: str, user: User = Depends(get_current_user)):
    """Like a track"""
    await db.tracks.update_one(
        {"track_id": track_id},
        {"$inc": {"likes": 1}}
    )
    return {"success": True}

# ============== GAMING ==============

@api_router.get("/matches")
async def get_matches(
    status: Optional[str] = None,
    limit: int = 20,
    user: User = Depends(get_current_user)
):
    """Get game matches"""
    query = {}
    if status:
        query["status"] = status
    
    matches = await db.game_matches.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Enrich with participant details
    for match in matches:
        participants = await db.users.find(
            {"user_id": {"$in": match.get("participants", [])}},
            {"_id": 0, "user_id": 1, "name": 1, "picture": 1}
        ).to_list(100)
        match["participant_details"] = participants
        
        # Get scores
        scores = await db.game_scores.find(
            {"match_id": match["match_id"]},
            {"_id": 0}
        ).to_list(100)
        match["scores"] = scores
    
    return matches

@api_router.post("/matches")
async def create_match(
    data: MatchCreate,
    user: User = Depends(get_current_user)
):
    """Create a new match"""
    match = GameMatch(
        **data.dict(),
        created_by=user.user_id
    )
    
    # Add creator to participants if not included
    if user.user_id not in match.participants:
        match.participants.append(user.user_id)
    
    await db.game_matches.insert_one(match.dict())
    
    # Log activity
    await log_activity(
        user.user_id, user.name, "match_created",
        f"{user.name} created a {data.game_type.value} match: {data.title}"
    )
    
    return match.dict()

@api_router.get("/matches/{match_id}")
async def get_match(match_id: str, user: User = Depends(get_current_user)):
    """Get match details"""
    match = await db.game_matches.find_one({"match_id": match_id}, {"_id": 0})
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Get participant details
    participants = await db.users.find(
        {"user_id": {"$in": match.get("participants", [])}},
        {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "level": 1}
    ).to_list(100)
    
    # Get scores
    scores = await db.game_scores.find(
        {"match_id": match_id},
        {"_id": 0}
    ).sort("score", -1).to_list(100)
    
    return {
        **match,
        "participant_details": participants,
        "scores": scores
    }

@api_router.post("/matches/{match_id}/start")
async def start_match(match_id: str, user: User = Depends(get_current_user)):
    """Start a match"""
    match = await db.game_matches.find_one({"match_id": match_id})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if match["created_by"] != user.user_id and not user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.game_matches.update_one(
        {"match_id": match_id},
        {"$set": {
            "status": "in_progress",
            "started_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"success": True}

@api_router.post("/matches/{match_id}/scores")
async def submit_score(
    match_id: str,
    data: ScoreSubmit,
    user: User = Depends(get_current_user)
):
    """Submit a score for a match"""
    match = await db.game_matches.find_one({"match_id": match_id})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Anti-abuse: Basic validation
    if data.score < 0 or data.score > 999999:
        raise HTTPException(status_code=400, detail="Invalid score")
    
    # Calculate XP based on performance
    xp_earned = min(data.score // 100, 50) + (data.kills * 5)
    if data.rank_position == 1:
        xp_earned += 100
    elif data.rank_position <= 3:
        xp_earned += 50
    
    score = GameScore(
        match_id=match_id,
        user_id=data.user_id,
        score=data.score,
        kills=data.kills,
        deaths=data.deaths,
        assists=data.assists,
        rank_position=data.rank_position,
        xp_earned=xp_earned
    )
    
    await db.game_scores.insert_one(score.dict())
    
    # Award XP to the player
    await add_xp(data.user_id, xp_earned, "gaming", f"Match score: {data.score}")
    
    return score.dict()

@api_router.post("/matches/{match_id}/complete")
async def complete_match(match_id: str, user: User = Depends(get_current_user)):
    """Complete a match and determine winner"""
    match = await db.game_matches.find_one({"match_id": match_id})
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Get highest scorer
    top_score = await db.game_scores.find_one(
        {"match_id": match_id},
        {"_id": 0},
        sort=[("score", -1)]
    )
    
    winner_id = top_score["user_id"] if top_score else None
    
    await db.game_matches.update_one(
        {"match_id": match_id},
        {"$set": {
            "status": "completed",
            "ended_at": datetime.now(timezone.utc),
            "winner_id": winner_id
        }}
    )
    
    # Award winner bonus
    if winner_id:
        await add_xp(winner_id, 50, "gaming", "Match victory!")
        
        # Get winner name
        winner = await db.users.find_one({"user_id": winner_id}, {"_id": 0})
        if winner:
            await log_activity(
                winner_id, winner["name"], "match_won",
                f"{winner['name']} won the match!"
            )
    
    return {"success": True, "winner_id": winner_id}

# ============== LEADERBOARDS ==============

@api_router.get("/leaderboards")
async def get_leaderboards(user: User = Depends(get_current_user)):
    """Get all leaderboard categories"""
    categories = [
        {
            "id": "attendance_monthly",
            "name": "Attendance Champions",
            "description": "Top members by monthly studio attendance",
            "icon": "calendar",
            "formula": "Total check-ins + (duration_hours * 2)"
        },
        {
            "id": "music_impact",
            "name": "Music Impact",
            "description": "Members with highest music contributions",
            "icon": "music",
            "formula": "(tracks * 50) + (contributions * 30) + (listens/100)"
        },
        {
            "id": "gaming_ranked",
            "name": "Gaming Elite",
            "description": "Top gamers by score and wins",
            "icon": "gamepad",
            "formula": "(wins * 100) + (total_score/1000) + (kd_ratio * 50)"
        },
        {
            "id": "hybrid_master",
            "name": "Hybrid Masters",
            "description": "Members excelling across all activities",
            "icon": "star",
            "formula": "(attendance_score * 0.3) + (music_score * 0.35) + (gaming_score * 0.35)"
        }
    ]
    
    return categories

@api_router.get("/leaderboards/{category}")
async def get_leaderboard(
    category: str,
    period: LeaderboardPeriod = LeaderboardPeriod.MONTHLY,
    limit: int = 50,
    user: User = Depends(get_current_user)
):
    """Get leaderboard entries for a category"""
    # Calculate date range
    now = datetime.now(timezone.utc)
    if period == LeaderboardPeriod.WEEKLY:
        start_date = now - timedelta(days=7)
    elif period == LeaderboardPeriod.MONTHLY:
        start_date = now - timedelta(days=30)
    elif period == LeaderboardPeriod.SEASONAL:
        start_date = now - timedelta(days=90)
    else:
        start_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
    
    entries = []
    
    if category == "attendance_monthly":
        # Aggregate attendance
        pipeline = [
            {"$match": {"check_in": {"$gte": start_date}}},
            {"$group": {
                "_id": "$user_id",
                "total_sessions": {"$sum": 1},
                "total_duration": {"$sum": "$duration_minutes"}
            }},
            {"$addFields": {
                "score": {"$add": ["$total_sessions", {"$multiply": [{"$divide": ["$total_duration", 60]}, 2]}]}
            }},
            {"$sort": {"score": -1}},
            {"$limit": limit}
        ]
        results = await db.attendance.aggregate(pipeline).to_list(limit)
        
    elif category == "music_impact":
        # Aggregate music activity
        pipeline = [
            {"$group": {
                "_id": "$created_by",
                "tracks_created": {"$sum": 1},
                "total_listens": {"$sum": "$listens"},
                "total_likes": {"$sum": "$likes"}
            }},
            {"$addFields": {
                "score": {"$add": [
                    {"$multiply": ["$tracks_created", 50]},
                    {"$divide": ["$total_listens", 10]},
                    {"$multiply": ["$total_likes", 5]}
                ]}
            }},
            {"$sort": {"score": -1}},
            {"$limit": limit}
        ]
        results = await db.tracks.aggregate(pipeline).to_list(limit)
        
        # Also count contributions
        contrib_pipeline = [
            {"$group": {
                "_id": "$user_id",
                "contributions": {"$sum": 1}
            }}
        ]
        contribs = await db.track_contributions.aggregate(contrib_pipeline).to_list(1000)
        contrib_map = {c["_id"]: c["contributions"] for c in contribs}
        
        for r in results:
            r["contributions"] = contrib_map.get(r["_id"], 0)
            r["score"] += r["contributions"] * 30
            
    elif category == "gaming_ranked":
        # Aggregate gaming stats
        pipeline = [
            {"$group": {
                "_id": "$user_id",
                "total_score": {"$sum": "$score"},
                "total_kills": {"$sum": "$kills"},
                "total_deaths": {"$sum": "$deaths"},
                "wins": {"$sum": {"$cond": [{"$eq": ["$rank_position", 1]}, 1, 0]}},
                "matches": {"$sum": 1}
            }},
            {"$addFields": {
                "kd_ratio": {"$cond": [
                    {"$gt": ["$total_deaths", 0]},
                    {"$divide": ["$total_kills", "$total_deaths"]},
                    "$total_kills"
                ]},
                "score": {"$add": [
                    {"$multiply": ["$wins", 100]},
                    {"$divide": ["$total_score", 1000]},
                    {"$multiply": ["$total_kills", 2]}
                ]}
            }},
            {"$sort": {"score": -1}},
            {"$limit": limit}
        ]
        results = await db.game_scores.aggregate(pipeline).to_list(limit)
        
    elif category == "hybrid_master":
        # Get all users and calculate hybrid scores
        users = await db.users.find({}, {"_id": 0}).to_list(1000)
        results = []
        
        for u in users:
            user_id = u["user_id"]
            
            # Attendance score
            att_count = await db.attendance.count_documents({"user_id": user_id})
            att_score = att_count * 10
            
            # Music score
            track_count = await db.tracks.count_documents({"created_by": user_id})
            contrib_count = await db.track_contributions.count_documents({"user_id": user_id})
            music_score = track_count * 50 + contrib_count * 30
            
            # Gaming score
            gaming_stats = await db.game_scores.find({"user_id": user_id}).to_list(1000)
            gaming_score = sum(s.get("score", 0) for s in gaming_stats) / 100
            
            total_score = (att_score * 0.3) + (music_score * 0.35) + (gaming_score * 0.35)
            
            if total_score > 0:
                results.append({
                    "_id": user_id,
                    "score": total_score,
                    "att_score": att_score,
                    "music_score": music_score,
                    "gaming_score": gaming_score
                })
        
        results.sort(key=lambda x: x["score"], reverse=True)
        results = results[:limit]
    else:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Enrich with user details and assign ranks
    entries = []
    for i, r in enumerate(results):
        user_doc = await db.users.find_one({"user_id": r["_id"]}, {"_id": 0})
        if user_doc:
            entries.append({
                "rank": i + 1,
                "user_id": r["_id"],
                "name": user_doc.get("name", "Unknown"),
                "picture": user_doc.get("picture"),
                "level": user_doc.get("level", 1),
                "score": round(r.get("score", 0), 2),
                "details": {k: v for k, v in r.items() if k not in ["_id", "score"]}
            })
    
    return {
        "category": category,
        "period": period.value,
        "entries": entries,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

# ============== GAMIFICATION ==============

@api_router.get("/gamification/stats")
async def get_gamification_stats(user: User = Depends(get_current_user)):
    """Get user's gamification stats"""
    # Get recent XP events
    events = await db.gamification_events.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Calculate level progress
    xp_for_next_level = user.level * 1000
    progress = (user.xp % 1000) / 10  # Percentage to next level
    
    return {
        "level": user.level,
        "xp": user.xp,
        "xp_for_next_level": xp_for_next_level,
        "progress_percent": progress,
        "streak_days": user.streak_days,
        "recent_events": events
    }

@api_router.get("/badges")
async def get_all_badges(user: User = Depends(get_current_user)):
    """Get all available badges"""
    badges = await db.badges.find({}, {"_id": 0}).to_list(100)
    
    # Get user's earned badges
    user_badges = await db.user_badges.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(100)
    earned_ids = {b["badge_id"] for b in user_badges}
    
    for badge in badges:
        badge["earned"] = badge["badge_id"] in earned_ids
    
    return badges

@api_router.get("/user/badges")
async def get_user_badges(user: User = Depends(get_current_user)):
    """Get user's earned badges"""
    user_badges = await db.user_badges.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(100)
    
    badge_ids = [b["badge_id"] for b in user_badges]
    badges = await db.badges.find(
        {"badge_id": {"$in": badge_ids}},
        {"_id": 0}
    ).to_list(100)
    
    # Merge earned_at dates
    earned_map = {b["badge_id"]: b["earned_at"] for b in user_badges}
    for badge in badges:
        badge["earned_at"] = earned_map.get(badge["badge_id"])
    
    return badges

# ============== ACTIVITY FEED ==============

@api_router.get("/activity/feed")
async def get_activity_feed(limit: int = 30, user: User = Depends(get_current_user)):
    """Get community activity feed"""
    activities = await db.activity_feed.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return activities

# ============== ADMIN ENDPOINTS ==============

@api_router.get("/admin/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    user: User = Depends(get_current_user)
):
    """Get audit logs (admin only)"""
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    logs = await db.audit_logs.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return logs

@api_router.get("/admin/users")
async def get_all_users(user: User = Depends(get_current_user)):
    """Get all users (admin only)"""
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users

@api_router.post("/admin/flag-event")
async def flag_event(
    event_id: str,
    reason: str,
    user: User = Depends(get_current_user)
):
    """Flag a gamification event for review"""
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.gamification_events.update_one(
        {"event_id": event_id},
        {"$set": {"flagged": True, "flag_reason": reason, "flagged_by": user.user_id}}
    )
    
    # Log audit
    await log_audit(user.user_id, "flag_event", "gamification_event", event_id, {"reason": reason})
    
    return {"success": True}

# ============== HELPER FUNCTIONS ==============

async def add_xp(user_id: str, amount: int, category: str, description: str):
    """Add XP to user and handle level ups"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        return
    
    new_xp = user.get("xp", 0) + amount
    current_level = user.get("level", 1)
    
    # Check for level up (1000 XP per level)
    new_level = current_level
    while new_xp >= new_level * 1000:
        new_xp -= new_level * 1000
        new_level += 1
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"xp": new_xp, "level": new_level}}
    )
    
    # Log gamification event
    await log_gamification_event(user_id, category, amount, description)
    
    # Check for level up badge
    if new_level > current_level:
        await check_level_badges(user_id, new_level)

async def log_gamification_event(user_id: str, event_type: str, xp_amount: int, description: str):
    """Log a gamification event"""
    event = GamificationEvent(
        user_id=user_id,
        event_type=event_type,
        xp_amount=xp_amount,
        description=description
    )
    await db.gamification_events.insert_one(event.dict())

async def log_activity(user_id: str, user_name: str, activity_type: str, description: str, metadata: dict = None):
    """Log an activity to the feed"""
    activity = ActivityFeedItem(
        user_id=user_id,
        user_name=user_name,
        activity_type=activity_type,
        description=description,
        metadata=metadata or {}
    )
    await db.activity_feed.insert_one(activity.dict())

async def log_audit(user_id: str, action: str, resource_type: str, resource_id: str, details: dict = None):
    """Log an admin audit action"""
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {}
    )
    await db.audit_logs.insert_one(log.dict())

async def update_streak(user_id: str):
    """Update user's attendance streak"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        return
    
    last_active = user.get("last_active")
    now = datetime.now(timezone.utc)
    
    if last_active:
        if isinstance(last_active, str):
            last_active = datetime.fromisoformat(last_active)
        if last_active.tzinfo is None:
            last_active = last_active.replace(tzinfo=timezone.utc)
        
        days_diff = (now.date() - last_active.date()).days
        
        if days_diff == 1:
            # Continue streak
            new_streak = user.get("streak_days", 0) + 1
        elif days_diff == 0:
            # Same day, keep streak
            new_streak = user.get("streak_days", 0)
        else:
            # Streak broken
            new_streak = 1
    else:
        new_streak = 1
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "streak_days": new_streak,
            "last_active": now
        }}
    )
    
    # Check for streak badges
    await check_streak_badges(user_id, new_streak)

async def award_badge(user_id: str, badge_id: str):
    """Award a badge to user if not already earned"""
    existing = await db.user_badges.find_one({
        "user_id": user_id,
        "badge_id": badge_id
    })
    
    if existing:
        return False
    
    badge = await db.badges.find_one({"badge_id": badge_id}, {"_id": 0})
    if not badge:
        return False
    
    user_badge = UserBadge(user_id=user_id, badge_id=badge_id)
    await db.user_badges.insert_one(user_badge.dict())
    
    # Award XP for badge
    if badge.get("xp_reward", 0) > 0:
        await add_xp(user_id, badge["xp_reward"], "badge", f"Earned badge: {badge['name']}")
    
    return True

async def check_streak_badges(user_id: str, streak_days: int):
    """Check and award streak badges"""
    streak_badges = {
        7: "week_warrior",
        30: "monthly_legend",
        100: "century_club"
    }
    
    for threshold, badge_id in streak_badges.items():
        if streak_days >= threshold:
            await award_badge(user_id, badge_id)

async def check_level_badges(user_id: str, level: int):
    """Check and award level badges"""
    level_badges = {
        5: "rising_star",
        10: "veteran",
        25: "elite_member",
        50: "legend"
    }
    
    for threshold, badge_id in level_badges.items():
        if level >= threshold:
            await award_badge(user_id, badge_id)

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_data():
    """Seed initial data (badges, seasons, etc.)"""
    # Seed badges
    badges = [
        {
            "badge_id": "first_steps",
            "name": "First Steps",
            "description": "Completed onboarding",
            "icon": "rocket",
            "category": "general",
            "requirement_type": "onboarding",
            "requirement_value": 1,
            "xp_reward": 100,
            "rarity": "common"
        },
        {
            "badge_id": "week_warrior",
            "name": "Week Warrior",
            "description": "7-day attendance streak",
            "icon": "flame",
            "category": "attendance",
            "requirement_type": "streak",
            "requirement_value": 7,
            "xp_reward": 200,
            "rarity": "rare"
        },
        {
            "badge_id": "monthly_legend",
            "name": "Monthly Legend",
            "description": "30-day attendance streak",
            "icon": "trophy",
            "category": "attendance",
            "requirement_type": "streak",
            "requirement_value": 30,
            "xp_reward": 500,
            "rarity": "epic"
        },
        {
            "badge_id": "century_club",
            "name": "Century Club",
            "description": "100-day attendance streak",
            "icon": "crown",
            "category": "attendance",
            "requirement_type": "streak",
            "requirement_value": 100,
            "xp_reward": 1000,
            "rarity": "legendary"
        },
        {
            "badge_id": "rising_star",
            "name": "Rising Star",
            "description": "Reached level 5",
            "icon": "star",
            "category": "level",
            "requirement_type": "level",
            "requirement_value": 5,
            "xp_reward": 100,
            "rarity": "common"
        },
        {
            "badge_id": "veteran",
            "name": "Veteran",
            "description": "Reached level 10",
            "icon": "medal",
            "category": "level",
            "requirement_type": "level",
            "requirement_value": 10,
            "xp_reward": 250,
            "rarity": "rare"
        },
        {
            "badge_id": "elite_member",
            "name": "Elite Member",
            "description": "Reached level 25",
            "icon": "gem",
            "category": "level",
            "requirement_type": "level",
            "requirement_value": 25,
            "xp_reward": 500,
            "rarity": "epic"
        },
        {
            "badge_id": "legend",
            "name": "Legend",
            "description": "Reached level 50",
            "icon": "crown",
            "category": "level",
            "requirement_type": "level",
            "requirement_value": 50,
            "xp_reward": 1000,
            "rarity": "legendary"
        },
        {
            "badge_id": "track_creator",
            "name": "Track Creator",
            "description": "Created your first track",
            "icon": "music",
            "category": "music",
            "requirement_type": "tracks",
            "requirement_value": 1,
            "xp_reward": 150,
            "rarity": "common"
        },
        {
            "badge_id": "producer",
            "name": "Producer",
            "description": "Created 10 tracks",
            "icon": "headphones",
            "category": "music",
            "requirement_type": "tracks",
            "requirement_value": 10,
            "xp_reward": 500,
            "rarity": "rare"
        },
        {
            "badge_id": "gamer",
            "name": "Gamer",
            "description": "Won your first match",
            "icon": "gamepad",
            "category": "gaming",
            "requirement_type": "wins",
            "requirement_value": 1,
            "xp_reward": 150,
            "rarity": "common"
        },
        {
            "badge_id": "champion",
            "name": "Champion",
            "description": "Won 25 matches",
            "icon": "trophy",
            "category": "gaming",
            "requirement_type": "wins",
            "requirement_value": 25,
            "xp_reward": 500,
            "rarity": "epic"
        },
        {
            "badge_id": "hybrid_hero",
            "name": "Hybrid Hero",
            "description": "Active in music, gaming, and attendance",
            "icon": "star",
            "category": "hybrid",
            "requirement_type": "hybrid",
            "requirement_value": 1,
            "xp_reward": 300,
            "rarity": "rare"
        }
    ]
    
    for badge in badges:
        await db.badges.update_one(
            {"badge_id": badge["badge_id"]},
            {"$set": badge},
            upsert=True
        )
    
    # Seed current season
    now = datetime.now(timezone.utc)
    season = {
        "season_id": "season_2025_summer",
        "name": "Summer 2025",
        "start_date": datetime(2025, 6, 1, tzinfo=timezone.utc),
        "end_date": datetime(2025, 8, 31, tzinfo=timezone.utc),
        "is_active": True,
        "rewards": [
            {"rank": 1, "title": "Gold", "reward": "Exclusive Gold Badge + 5000 XP"},
            {"rank": 2, "title": "Silver", "reward": "Silver Badge + 3000 XP"},
            {"rank": 3, "title": "Bronze", "reward": "Bronze Badge + 1500 XP"},
            {"rank": 10, "title": "Top 10", "reward": "Elite Badge + 500 XP"}
        ]
    }
    
    await db.seasons.update_one(
        {"season_id": season["season_id"]},
        {"$set": season},
        upsert=True
    )
    
    return {"message": "Seed data created successfully", "badges_count": len(badges)}

# ============== ROOT ENDPOINT ==============

@api_router.get("/")
async def root():
    return {"message": "Studio Hub Elite API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
