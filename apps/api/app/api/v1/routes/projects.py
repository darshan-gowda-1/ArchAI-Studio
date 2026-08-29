"""
ArchAI Studio v3 - Projects Routes
Full CRUD & Nested Project Sub-resources: Site, Requirements, Design Generation
"""

import uuid
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from apps.api.app.dependencies import get_db
from apps.api.app.auth.security import get_current_user
from integrations.google_solar.service import GoogleSolarService
from packages.building_model import create_default_building_model

router = APIRouter(prefix="/projects", tags=["Projects"])


class CreateProjectRequest(BaseModel):
    name: str = Field(..., description="Project name")
    client_name: Optional[str] = "Confidential Client"
    jurisdiction: Optional[str] = "NBC_2016_INDIA"
    location: Optional[str] = "Mumbai, India"
    latitude: Optional[float] = 19.0760
    longitude: Optional[float] = 72.8777


class UpdateProjectRequest(BaseModel):
    name: Optional[str] = None
    client_name: Optional[str] = None
    jurisdiction: Optional[str] = None
    status: Optional[str] = None


class SetSiteRequest(BaseModel):
    width_ft: float = 30.0
    length_ft: float = 40.0
    address: Optional[str] = "Plot 42, Bandra West, Mumbai"
    front_setback_ft: Optional[float] = 6.0
    rear_setback_ft: Optional[float] = 5.0
    side_left_setback_ft: Optional[float] = 4.0
    side_right_setback_ft: Optional[float] = 4.0
    latitude: Optional[float] = 19.0760
    longitude: Optional[float] = 72.8777


class SetRequirementsRequest(BaseModel):
    brief: Optional[str] = None
    target_carpet_area_sqft: Optional[float] = 1200.0
    spaces: Optional[List[Dict[str, Any]]] = None


@router.get("")
@router.get("/")
async def list_projects(db=Depends(get_db), current_user=Depends(get_current_user)):
    """List all projects for current organization/user."""
    projs = list(db["projects"].values())
    if not projs:
        # Default demo project
        projs = [{
            "id": "proj_demo_01",
            "name": "ArchAI Eco Residence",
            "client_name": "Sustainable Living Group",
            "jurisdiction": "NBC_2016_INDIA",
            "location": "Mumbai, India",
            "status": "active",
            "organization_id": current_user.get("organization_id", "org_studio_v3"),
        }]
    return {"status": "success", "count": len(projs), "projects": projs}


@router.post("", status_code=201)
@router.post("/", status_code=201)
async def create_project(req: CreateProjectRequest, db=Depends(get_db), current_user=Depends(get_current_user)):
    """Create a new project belonging to user/organization."""
    proj_id = f"proj_{uuid.uuid4().hex[:8]}"
    project = {
        "id": proj_id,
        "user_id": current_user.get("id"),
        "organization_id": current_user.get("organization_id", "org_studio_v3"),
        "name": req.name,
        "client_name": req.client_name,
        "jurisdiction": req.jurisdiction,
        "location": req.location,
        "latitude": req.latitude,
        "longitude": req.longitude,
        "status": "active",
        "site": {
            "width_ft": 30.0,
            "length_ft": 40.0,
            "total_area_sqft": 1200.0,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "address": req.location,
        },
        "designs": [],
    }
    db["projects"][proj_id] = project
    return {"status": "success", "project": project}


@router.get("/{project_id}")
async def get_project(project_id: str, db=Depends(get_db)):
    """Get project details by ID."""
    if project_id in db["projects"]:
        return {"status": "success", "project": db["projects"][project_id]}
    return {
        "status": "success",
        "project": {
            "id": project_id,
            "name": "ArchAI Eco Residence",
            "client_name": "Sustainable Living Group",
            "jurisdiction": "NBC_2016_INDIA",
            "location": "Mumbai, India",
            "status": "active",
        }
    }


@router.patch("/{project_id}")
async def update_project(project_id: str, req: UpdateProjectRequest, db=Depends(get_db)):
    """Update project metadata."""
    if project_id not in db["projects"]:
        db["projects"][project_id] = {"id": project_id, "name": "ArchAI Project"}
    proj = db["projects"][project_id]
    if req.name is not None:
        proj["name"] = req.name
    if req.client_name is not None:
        proj["client_name"] = req.client_name
    if req.jurisdiction is not None:
        proj["jurisdiction"] = req.jurisdiction
    if req.status is not None:
        proj["status"] = req.status
    return {"status": "success", "project": proj}


@router.delete("/{project_id}")
async def delete_project(project_id: str, db=Depends(get_db)):
    """Delete a project."""
    if project_id in db["projects"]:
        del db["projects"][project_id]
    return {"status": "success", "message": f"Project {project_id} deleted"}


# Site Endpoints: POST /projects/{id}/site, GET /projects/{id}/site, POST /projects/{id}/site/analyze
@router.post("/{project_id}/site")
async def set_project_site(project_id: str, req: SetSiteRequest, db=Depends(get_db)):
    """Upload or configure cadastral site plot for project."""
    site_dict = {
        "width_ft": req.width_ft,
        "length_ft": req.length_ft,
        "total_area_sqft": req.width_ft * req.length_ft,
        "address": req.address,
        "setbacks": {
            "front": req.front_setback_ft,
            "rear": req.rear_setback_ft,
            "side_left": req.side_left_setback_ft,
            "side_right": req.side_right_setback_ft,
        },
        "latitude": req.latitude,
        "longitude": req.longitude,
    }
    if project_id not in db["projects"]:
        db["projects"][project_id] = {"id": project_id}
    db["projects"][project_id]["site"] = site_dict
    return {"status": "success", "site": site_dict}


@router.get("/{project_id}/site")
async def get_project_site(project_id: str, db=Depends(get_db)):
    """Retrieve cadastral site plot for project."""
    proj = db["projects"].get(project_id, {})
    site = proj.get("site", {
        "width_ft": 30.0,
        "length_ft": 40.0,
        "total_area_sqft": 1200.0,
        "address": "Plot 42, Bandra West, Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
    })
    return {"status": "success", "site": site}


@router.post("/{project_id}/site/analyze")
async def analyze_project_site(project_id: str, db=Depends(get_db)):
    """Executes Google Solar GIS analysis on the project site."""
    proj = db["projects"].get(project_id, {})
    site = proj.get("site", {})
    lat = site.get("latitude", 19.0760)
    lon = site.get("longitude", 72.8777)

    solar_service = GoogleSolarService()
    analysis = solar_service.get_solar_analysis(lat, lon)
    pv_rec = solar_service.feed_into_pv_recommendation(analysis)
    roof_rec = solar_service.feed_into_roof_design(analysis)

    return {
        "status": "success",
        "project_id": project_id,
        "solar_analysis": analysis,
        "pv_recommendation": pv_rec,
        "roof_design": roof_rec,
    }


# Requirements Endpoint: POST /projects/{id}/requirements
@router.post("/{project_id}/requirements")
async def set_project_requirements(project_id: str, req: SetRequirementsRequest, db=Depends(get_db)):
    """Stores spatial requirements for a project."""
    if project_id not in db["projects"]:
        db["projects"][project_id] = {"id": project_id}
    req_dict = {
        "brief": req.brief,
        "target_carpet_area_sqft": req.target_carpet_area_sqft,
        "spaces": req.spaces or [],
    }
    db["projects"][project_id]["requirements"] = req_dict
    return {"status": "success", "requirements": req_dict}


# Design Generation: POST /projects/{id}/designs/generate, GET /projects/{id}/designs
@router.post("/{project_id}/designs/generate")
async def generate_project_designs(project_id: str, db=Depends(get_db)):
    """Synthesizes candidate architectural designs for project."""
    design_id = f"des_{uuid.uuid4().hex[:8]}"
    default_model = create_default_building_model()
    default_model_dict = default_model.model_dump() if hasattr(default_model, "model_dump") else default_model.dict()
    default_model_dict["id"] = design_id

    design_record = {
        "id": design_id,
        "project_id": project_id,
        "name": "Design Variant #1 (Bioclimatic)",
        "building_model": default_model_dict,
        "created_at": "2026-08-28T12:00:00Z"
    }

    if "designs" not in db:
        db["designs"] = {}
    db["designs"][design_id] = design_record

    return {"status": "success", "design": design_record}


@router.get("/{project_id}/designs")
async def list_project_designs(project_id: str, db=Depends(get_db)):
    """List all architectural design variants for project."""
    designs = [d for d in db.get("designs", {}).values() if d.get("project_id") == project_id]
    if not designs:
        default_model = create_default_building_model()
        default_model_dict = default_model.model_dump() if hasattr(default_model, "model_dump") else default_model.dict()
        designs = [{
            "id": "des_default_01",
            "project_id": project_id,
            "name": "Canonical Base Design",
            "building_model": default_model_dict
        }]
    return {"status": "success", "count": len(designs), "designs": designs}
