"""
ArchAI Studio v3 - API Request & Response Schemas
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class CreateProjectRequest(BaseModel):
    name: str = Field(..., example="Coastal Eco Villa")
    client_name: Optional[str] = Field(default="Private Client")
    jurisdiction: str = Field(default="NBC_2016_INDIA")
    location: str = Field(default="Mumbai, India")


class ParseRequirementsRequest(BaseModel):
    prompt: str = Field(..., example="I need a 3 bedroom house for a family of five, around 2200 sq ft, with a home office, parking for two cars and good natural ventilation.")


class OptimizeLayoutRequest(BaseModel):
    building_model: Dict[str, Any]
    population_size: int = Field(default=16, ge=4, le=500)
    generations: int = Field(default=10, ge=1, le=50)


OptimizationRunRequest = OptimizeLayoutRequest


class RedesignRequest(BaseModel):
    building_model: Dict[str, Any]
    directive: str = Field(..., example="Make the kitchen larger but don't increase the budget.")


class CompileGeometryRequest(BaseModel):
    building_model: Dict[str, Any]


GeometryCompileRequest = CompileGeometryRequest


class ComplianceCheckRequest(BaseModel):
    building_model: Dict[str, Any]
    jurisdiction: str = Field(default="NBC_2016_INDIA")


class BOQCalculateRequest(BaseModel):
    building_model: Dict[str, Any]


BOQRequest = BOQCalculateRequest


class BIMExportRequest(BaseModel):
    building_model: Dict[str, Any]
    format: str = Field(default="ifc4", description="ifc4, dxf, gltf, obj, speckle")
