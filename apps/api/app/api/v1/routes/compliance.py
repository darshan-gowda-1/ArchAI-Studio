"""
ArchAI Studio v3 - Compliance & Statutory Validation Routes
"""

from fastapi import APIRouter
from apps.api.app.schemas.api_schemas import ComplianceCheckRequest
from packages.compliance.python.checker import check_building_compliance
from packages.compliance.python.constraint_engine import ConstraintEngine

router = APIRouter(prefix="/compliance", tags=["Compliance"])


@router.post("/check")
@router.post("/verify")
async def check_compliance(req: ComplianceCheckRequest):
    """
    Automated preliminary compliance analysis decoupled from optimization.
    Evaluates NBC India and statutory bylaws with disclaimer.
    """
    report = check_building_compliance(req.building_model, req.jurisdiction)
    return {
        "status": "success",
        "compliance_report": report,
        "score_percent": report.get("score_percent", 100.0)
    }


@router.post("/constraints/validate")
async def validate_constraints(req: ComplianceCheckRequest):
    """
    Dedicated ConstraintEngine validator evaluating all 11 constraint rules.
    """
    engine = ConstraintEngine(req.building_model)
    res = engine.validate_all()
    return res
