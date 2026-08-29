"""
ArchAI Studio v3 - Requirements AI & Natural Language Redesign Routes
"""

from fastapi import APIRouter
from apps.api.app.schemas.api_schemas import ParseRequirementsRequest, RedesignRequest
from integrations.openai.parser import RequirementsParser
from integrations.openai.redesign import ConversationalRedesignEngine

router = APIRouter(prefix="/requirements", tags=["Requirements AI"])


@router.post("/parse")
async def parse_requirements(req: ParseRequirementsRequest):
    """
    Parses unstructured text into strictly validated Pydantic parameters.
    """
    parser = RequirementsParser()
    validated = parser.parse_natural_language(req.prompt)
    val_dict = validated.model_dump() if hasattr(validated, "model_dump") else validated.dict()
    return {
        "status": "success",
        "validated_requirements": val_dict
    }


@router.post("/redesign")
async def conversational_redesign(req: RedesignRequest):
    """
    Applies natural language conversational modification directive to a canonical model.
    """
    engine = ConversationalRedesignEngine()
    updated_model = engine.apply_directive(req.building_model, req.directive)
    return {
        "status": "success",
        "building_model": updated_model
    }
