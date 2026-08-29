"""
ArchAI Studio v3 - Geometry Compilation Routes
"""

from fastapi import APIRouter
from apps.api.app.schemas.api_schemas import GeometryCompileRequest
from packages.geometry.python.compiler import compile_building, GeometryCompiler

router = APIRouter(prefix="/geometry", tags=["Geometry Compiler"])


@router.post("/compile")
async def compile_geometry_endpoint(req: GeometryCompileRequest):
    """
    Parametric geometry compilation:
    site -> footprint -> rooms -> walls -> doors/windows -> floors -> roof -> structural elements -> architectural elements
    """
    compiled_data = compile_building(req.building_model)
    return {
        "status": "success",
        "geometry": compiled_data
    }
