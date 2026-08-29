"""
ArchAI Studio v3 - API v1 Master Router
"""

from fastapi import APIRouter
from apps.api.app.api.v1.routes.auth import router as auth_router
from apps.api.app.api.v1.routes.projects import router as projects_router
from apps.api.app.api.v1.routes.designs import router as designs_router
from apps.api.app.api.v1.routes.versioning import router as versioning_router
from apps.api.app.api.v1.routes.reports import router as reports_router
from apps.api.app.api.v1.routes.ai import router as ai_router
from apps.api.app.api.v1.routes.sites import router as sites_router
from apps.api.app.api.v1.routes.requirements import router as requirements_router
from apps.api.app.api.v1.routes.optimizer import router as optimizer_router
from apps.api.app.api.v1.routes.geometry import router as geometry_router
from apps.api.app.api.v1.routes.boq import router as boq_router
from apps.api.app.api.v1.routes.compliance import router as compliance_router
from apps.api.app.api.v1.routes.bim import router as bim_router
from apps.api.app.api.v1.routes.jobs import router as jobs_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(designs_router)
api_v1_router.include_router(versioning_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(sites_router)
api_v1_router.include_router(requirements_router)
api_v1_router.include_router(optimizer_router)
api_v1_router.include_router(geometry_router)
api_v1_router.include_router(boq_router)
api_v1_router.include_router(compliance_router)
api_v1_router.include_router(bim_router)
api_v1_router.include_router(jobs_router)
