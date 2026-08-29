"""
ArchAI Studio v3 - Sites & PostGIS Spatial Routes
"""

from typing import Dict, Any, List
from fastapi import APIRouter
from pydantic import BaseModel, Field
from packages.geometry.python.topology import clip_polygon_by_setbacks, compute_polygon_area
from integrations.google_solar.client import GoogleSolarClient

router = APIRouter(prefix="/sites", tags=["Sites"])


class AnalyzeSiteRequest(BaseModel):
    length: float = Field(default=40.0, gt=0)
    width: float = Field(default=30.0, gt=0)
    front_setback: float = Field(default=6.0, ge=0)
    rear_setback: float = Field(default=5.0, ge=0)
    side_left: float = Field(default=4.0, ge=0)
    side_right: float = Field(default=4.0, ge=0)
    latitude: float = Field(default=19.0760)
    longitude: float = Field(default=72.8777)
    orientation: str = Field(default="South")


@router.post("/analyze")
async def analyze_site(req: AnalyzeSiteRequest):
    boundary = [
        {"x": 0.0, "y": 0.0},
        {"x": req.width, "y": 0.0},
        {"x": req.width, "y": req.length},
        {"x": 0.0, "y": req.length}
    ]

    total_area = req.width * req.length
    buildable_polygon = clip_polygon_by_setbacks(
        boundary,
        front_setback=req.front_setback,
        rear_setback=req.rear_setback,
        side_left=req.side_left,
        side_right=req.side_right
    )

    buildable_area = compute_polygon_area(buildable_polygon)

    # Google Solar Insights
    solar_client = GoogleSolarClient()
    solar_insights = solar_client.get_building_insights(req.latitude, req.longitude)

    return {
        "status": "success",
        "plot_area_sqft": total_area,
        "buildable_footprint_sqft": buildable_area,
        "buildable_polygon": buildable_polygon,
        "ground_coverage_max_pct": 60.0,
        "max_permissible_far": 2.0,
        "max_permissible_height_ft": 36.0,
        "solar_insights": solar_insights,
    }
