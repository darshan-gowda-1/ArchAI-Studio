"""
ArchAI Studio v3 - Requirements AI Unit Tests
"""

import pytest
from integrations.openai.parser import RequirementsParser, ValidatedRequirements
from integrations.openai.redesign import ConversationalRedesignEngine


def test_requirements_parser():
    parser = RequirementsParser()
    brief = "I need a 3 bedroom house for a family of five, around 2200 sq ft, with a home office, parking for two cars and good natural ventilation."
    
    req = parser.parse_natural_language(brief)
    assert isinstance(req, ValidatedRequirements)
    assert req.bedrooms == 3
    assert req.occupants == 5
    assert req.target_area_sqft == 2200.0
    assert req.parking_spaces == 2
    assert "home_office" in req.special_requirements
    assert "natural_ventilation" in req.special_requirements


def test_conversational_redesign():
    engine = ConversationalRedesignEngine()
    building = {
        "id": "bldg_test",
        "spaces": [
            {"id": "spc_kit", "type": "kitchen", "area_sqft": 100.0},
            {"id": "spc_foy", "type": "foyer", "area_sqft": 50.0}
        ],
        "metrics": {"carpet_area_sqft": 150.0},
        "metadata": {}
    }

    updated = engine.apply_directive(building, "Make the kitchen larger but don't increase the budget.")
    kit_space = next(s for s in updated["spaces"] if s["type"] == "kitchen")
    assert kit_space["area_sqft"] > 100.0
    assert updated["metadata"]["lastDirectiveApplied"] == "Make the kitchen larger but don't increase the budget."
