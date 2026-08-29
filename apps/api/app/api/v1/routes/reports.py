"""
ArchAI Studio v3 - Architectural Reports & Export Routes
Endpoints:
- POST /reports/dossier (Compiles 14-section comprehensive dossier)
- POST /reports/export/pdf
- POST /reports/export/excel
- POST /reports/export/ifc
- POST /reports/export/glb
- POST /reports/export/json
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from packages.reports.python.generator import ReportGenerator
from packages.building_model import create_default_building_model

router = APIRouter(prefix="/reports", tags=["Architectural Reports & Exports"])


class ReportRequest(BaseModel):
    building_model: Optional[Dict[str, Any]] = None


@router.post("/dossier")
async def generate_full_dossier(req: Optional[ReportRequest] = None):
    """Compiles the 14-section architectural report dossier."""
    model = (req.building_model if req and req.building_model else None) or create_default_building_model().dict()
    gen = ReportGenerator(model)
    return gen.compile_full_dossier()


@router.post("/export/pdf")
async def export_pdf_report(req: Optional[ReportRequest] = None):
    """Exports A4 architectural dossier PDF."""
    model = (req.building_model if req and req.building_model else None) or create_default_building_model().dict()
    gen = ReportGenerator(model)
    return gen.export_pdf()


@router.post("/export/excel")
async def export_excel_report(req: Optional[ReportRequest] = None):
    """Exports multi-tab BOQ and room schedules Excel workbook."""
    model = (req.building_model if req and req.building_model else None) or create_default_building_model().dict()
    gen = ReportGenerator(model)
    return gen.export_excel()


@router.post("/export/ifc")
async def export_ifc_report(req: Optional[ReportRequest] = None):
    """Exports IFC4 standard file."""
    model = (req.building_model if req and req.building_model else None) or create_default_building_model().dict()
    gen = ReportGenerator(model)
    return gen.export_ifc()


@router.post("/export/glb")
async def export_glb_report(req: Optional[ReportRequest] = None):
    """Exports multi-LOD GLB model."""
    model = (req.building_model if req and req.building_model else None) or create_default_building_model().dict()
    gen = ReportGenerator(model)
    return gen.export_glb()


@router.post("/export/json")
async def export_json_report(req: Optional[ReportRequest] = None):
    """Exports full Canonical BuildingModel JSON."""
    model = (req.building_model if req and req.building_model else None) or create_default_building_model().dict()
    gen = ReportGenerator(model)
    return gen.export_json()
