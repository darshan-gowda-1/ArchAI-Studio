"""
ArchAI Studio v3 - Authentication & Multi-Tenancy Routes
"""

import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, status
from apps.api.app.auth.models import (
    UserRegisterRequest,
    UserLoginRequest,
    AuthTokenResponse,
    OrganizationCreateRequest,
    UserRole,
)
from apps.api.app.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

# In-memory auth store (synced with PostgreSQL in production)
USERS_DB: Dict[str, Dict[str, Any]] = {
    "architect@archai.studio": {
        "id": "usr_default_architect",
        "email": "architect@archai.studio",
        "hashed_password": hash_password("Architect2026!"),
        "full_name": "Principal Architect",
        "role": UserRole.ARCHITECT.value,
        "organization_id": "org_studio_v3",
        "organization_name": "ArchAI Design Atelier",
    }
}

ORGANIZATIONS_DB: Dict[str, Dict[str, Any]] = {
    "org_studio_v3": {
        "id": "org_studio_v3",
        "name": "ArchAI Design Atelier",
        "tier": "enterprise",
        "owner_id": "usr_default_architect",
    }
}


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(req: UserRegisterRequest):
    if req.email in USERS_DB:
        raise HTTPException(status_code=400, detail="User with this email already registered")

    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    org_id = f"org_{uuid.uuid4().hex[:8]}"

    org_name = req.organization_name or "ArchAI Studio Workspace"
    ORGANIZATIONS_DB[org_id] = {
        "id": org_id,
        "name": org_name,
        "tier": "professional",
        "owner_id": user_id,
    }

    user_record = {
        "id": user_id,
        "email": req.email,
        "hashed_password": hash_password(req.password),
        "full_name": req.full_name,
        "role": req.role.value,
        "organization_id": org_id,
        "organization_name": org_name,
    }
    USERS_DB[req.email] = user_record

    token = create_access_token({
        "sub": user_id,
        "id": user_id,
        "email": req.email,
        "role": req.role.value,
        "organization_id": org_id,
        "organization_name": org_name,
        "full_name": req.full_name,
    })

    return AuthTokenResponse(
        access_token=token,
        user_id=user_id,
        email=req.email,
        role=req.role.value,
        organization_id=org_id,
        organization_name=org_name,
    )


@router.post("/login", response_model=AuthTokenResponse)
async def login_user(req: UserLoginRequest):
    user_record = USERS_DB.get(req.email)
    if not user_record or not verify_password(req.password, user_record["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": user_record["id"],
        "id": user_record["id"],
        "email": user_record["email"],
        "role": user_record["role"],
        "organization_id": user_record["organization_id"],
        "organization_name": user_record["organization_name"],
        "full_name": user_record["full_name"],
    })

    return AuthTokenResponse(
        access_token=token,
        user_id=user_record["id"],
        email=user_record["email"],
        role=user_record["role"],
        organization_id=user_record["organization_id"],
        organization_name=user_record["organization_name"],
    )


@router.get("/me")
async def get_current_user_profile(user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "status": "authenticated",
        "user": user
    }
