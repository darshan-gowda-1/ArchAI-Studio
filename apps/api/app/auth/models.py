"""
ArchAI Studio v3 - Authentication & Multi-Tenancy Schemas
"""

from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class UserRole(str, Enum):
    OWNER = "owner"
    ARCHITECT = "architect"
    ENGINEER = "engineer"
    VIEWER = "viewer"
    ADMIN = "admin"


class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6)
    full_name: str
    role: UserRole = UserRole.ARCHITECT
    organization_name: Optional[str] = "Independent Architectural Studio"


class UserLoginRequest(BaseModel):
    email: str
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str
    organization_id: str
    organization_name: str


class OrganizationCreateRequest(BaseModel):
    name: str
    tier: str = "enterprise"
    jurisdiction_default: str = "NBC_2016_INDIA"
