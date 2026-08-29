"""
ArchAI Studio v3 - Design Versioning & Revision Routes
Endpoints:
- GET  /designs/{id}/revisions
- POST /designs/{id}/revisions
- POST /designs/{id}/revisions/{rev_id}/restore
- POST /designs/{id}/duplicate
- POST /designs/{id}/branch
- POST /designs/compare
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from packages.versioning.python.engine import VersioningEngine
from apps.api.app.auth.security import get_current_user
from packages.building_model import create_default_building_model

router = APIRouter(tags=["Design Versioning & Lineage"])

# Shared singleton VersioningEngine
versioning_engine = VersioningEngine()


class CreateRevisionRequest(BaseModel):
    commit_message: str = Field(..., description="Description of design edits made in this revision")
    author: Optional[str] = None
    building_model: Dict[str, Any]


class RestoreRevisionRequest(BaseModel):
    author: Optional[str] = "Principal Architect"


class DuplicateDesignRequest(BaseModel):
    new_name: Optional[str] = None


class BranchDesignRequest(BaseModel):
    revision_id: Optional[str] = None
    branch_name: Optional[str] = "Variant B - Courtyard Scheme"


class CompareDesignsRequest(BaseModel):
    design_model_a: Optional[Dict[str, Any]] = None
    design_model_b: Optional[Dict[str, Any]] = None


@router.get("/designs/{design_id}/revisions")
async def list_design_revisions(design_id: str):
    """Lists complete revision history for a design."""
    tree = versioning_engine.get_or_create_tree(design_id)
    return {"status": "success", "design_id": design_id, "version_tree": tree.to_dict()}


@router.post("/designs/{design_id}/revisions", status_code=201)
async def create_design_revision(
    design_id: str,
    req: CreateRevisionRequest,
    current_user=Depends(get_current_user)
):
    """Creates a new immutable revision snapshot upon design modification."""
    author_name = req.author or current_user.get("full_name", "Lead Architect")
    rev = versioning_engine.create_revision(
        design_id=design_id,
        author=author_name,
        commit_message=req.commit_message,
        model=req.building_model
    )
    return {"status": "success", "revision": rev}


@router.post("/designs/{design_id}/revisions/{revision_id}/restore")
async def restore_design_revision(
    design_id: str,
    revision_id: str,
    req: Optional[RestoreRevisionRequest] = None,
    current_user=Depends(get_current_user)
):
    """Restores a previous revision by appending a new rollback revision."""
    author = req.author if req else current_user.get("full_name", "Lead Architect")
    try:
        new_rev = versioning_engine.restore_revision(design_id, revision_id, author)
        return {"status": "success", "restored_revision": new_rev}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/designs/{design_id}/duplicate", status_code=201)
async def duplicate_design(design_id: str, req: Optional[DuplicateDesignRequest] = None):
    """Clones a design with new independent branch lineage."""
    name = req.new_name if req else None
    clone = versioning_engine.duplicate_design(design_id, name)
    return {"status": "success", "cloned_design": clone}


@router.post("/designs/{design_id}/branch", status_code=201)
async def branch_design(design_id: str, req: Optional[BranchDesignRequest] = None):
    """Forks a revision into a new child design variant."""
    rev_id = req.revision_id if req else None
    b_name = req.branch_name if req else None
    branch = versioning_engine.branch_design(design_id, rev_id, b_name)
    return {"status": "success", "branch_design": branch}


@router.post("/designs/compare")
async def compare_designs(req: CompareDesignsRequest):
    """Calculates architectural differential (area, spaces, BOQ delta) between two designs."""
    model_a = req.design_model_a or create_default_building_model().dict()
    model_b = req.design_model_b or create_default_building_model().dict()
    diff = VersioningEngine.compare_models(model_a, model_b)
    return diff
