"""
ArchAI Studio v3 - Compliance & Preliminary Analysis Unit Tests
"""

import pytest
from packages.compliance.python.checker import check_building_compliance, ComplianceReport


@pytest.fixture
def test_building_model():
    return {
        "site": {
            "boundary": {
                "vertices": [{"x": 0, "y": 0}, {"x": 30, "y": 0}, {"x": 30, "y": 40}, {"x": 0, "y": 40}],
                "width": 30.0,
                "length": 40.0,
                "total_area_sqft": 1200.0
            },
            "setbacks": {"front": 6.0, "rear": 5.0, "side_left": 4.0, "side_right": 4.0},
            "far_fsi": 2.0
        },
        "levels": [{"id": "l0", "floor_to_floor_height_ft": 10.0}],
        "spaces": [
            {
                "id": "spc_1",
                "name": "Master Bedroom",
                "type": "master_bedroom",
                "polygon_2d": [{"x": 4, "y": 6}, {"x": 26, "y": 6}, {"x": 26, "y": 20}, {"x": 4, "y": 20}],
                "area_sqft": 308.0
            }
        ],
        "doors": [{"id": "door_main", "width_ft": 3.5}],
        "windows": [{"id": "w1", "width_ft": 6.0, "height_ft": 5.0}],
        "metrics": {"total_built_up_area_sqft": 400.0, "parking_slots": 2}
    }


def test_check_building_compliance_disclaimer(test_building_model):
    res = check_building_compliance(test_building_model)

    assert res["title"] == "Automated preliminary compliance analysis"
    assert "disclaimer" in res
    assert "NOT constitute a licensed legal architectural certification" in res["disclaimer"]
    assert res["overall_status"] in ["COMPLIANT", "NON_COMPLIANT"]
    assert res["total_rules_checked"] >= 8
