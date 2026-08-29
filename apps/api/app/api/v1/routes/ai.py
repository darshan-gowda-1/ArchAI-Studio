"""
ArchAI Studio v3 - AI Architecture Routes
Exposes centralized AIService methods to frontend.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from integrations.openai.ai_service import AIService
from packages.building_model import create_default_building_model

router = APIRouter(prefix="/ai", tags=["Architectural AI Copilot"])


class ParseBriefRequest(BaseModel):
    prompt: str = Field(..., description="Natural language project brief")


class SiteImageAnalysisRequest(BaseModel):
    image_url: str
    location_hint: Optional[str] = "Mumbai, India"


class FloorplanAnalysisRequest(BaseModel):
    floorplan_data: Dict[str, Any]


class ConstraintExtractionRequest(BaseModel):
    bylaws_text: str


class DesignExplainRequest(BaseModel):
    building_model: Optional[Dict[str, Any]] = None


@router.post("/parse-requirements")
async def parse_requirements(req: ParseBriefRequest):
    service = AIService()
    return service.parse_requirements(req.prompt)


@router.post("/analyze-site")
async def analyze_site(req: SiteImageAnalysisRequest):
    service = AIService()
    return service.analyze_site_image(req.image_url, req.location_hint)


@router.post("/analyze-floorplan")
async def analyze_floorplan(req: FloorplanAnalysisRequest):
    service = AIService()
    return service.analyze_floorplan(req.floorplan_data)


@router.post("/extract-constraints")
async def extract_constraints(req: ConstraintExtractionRequest):
    service = AIService()
    return service.extract_building_constraints(req.bylaws_text)


@router.post("/explain-design")
async def explain_design(req: DesignExplainRequest):
    service = AIService()
    model = req.building_model or create_default_building_model().dict()
    return service.explain_design(model)


@router.post("/generate-summary")
async def generate_summary(req: DesignExplainRequest):
    service = AIService()
    model = req.building_model or create_default_building_model().dict()
    return service.generate_design_summary(model)
