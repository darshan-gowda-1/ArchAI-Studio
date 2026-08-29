"""
ArchAI Studio v3 - Parametric BOQ & QTO Routes
"""

from fastapi import APIRouter
from apps.api.app.schemas.api_schemas import BOQRequest
from packages.boq.python.qto import calculate_building_boq

router = APIRouter(prefix="/boq", tags=["Bill of Quantities"])


@router.post("/calculate")
async def calculate_boq(req: BOQRequest):
    """
    Building Model -> Quantity Takeoff -> BOQ -> Cost Engine
    Computes 16 geometric itemized categories and outputs total cost.
    """
    boq = calculate_building_boq(req.building_model)
    return {
        "status": "success",
        "boq": boq,
        "cost_estimate": boq
    }
