"""
ArchAI Studio v3 - Dedicated ConstraintEngine Unit Tests
"""

import pytest
from packages.compliance.python.constraint_engine import ConstraintEngine


@pytest.fixture
def valid_building():
    return {
        "site": {
            "boundary": {
                "vertices": [{"x": 0, "y": 0}, {"x": 30, "y": 0}, {"x": 30, "y": 40}, {"x": 0, "y": 40}],
                "width": 30.0,
                "length": 40.0,
                "total_area_sqft": 1200.0
            },
            "setbacks": {"front": 6.0, "rear": 5.0, "side_left": 4.0, "side_right": 4.0},
            "far_fsi": 2.0,
            "maximum_height_ft": 36.0
        },
        "levels": [{"id": "l0", "floor_to_floor_height_ft": 10.0}],
        "spaces": [
            {
                "id": "spc_bed_1",
                "name": "Master Bedroom",
                "type": "master_bedroom",
                "polygon_2d": [{"x": 4, "y": 6}, {"x": 16, "y": 6}, {"x": 16, "y": 20}, {"x": 4, "y": 20}],
                "area_sqft": 168.0
            }
        ],
        "walls": [],
        "doors": [{"id": "door_main", "width_ft": 3.5, "offset_along_wall_ft": 2.0}],
        "windows": [{"id": "win_1", "width_ft": 5.0, "height_ft": 4.5}],
        "metrics": {"total_built_up_area_sqft": 1300.0, "parking_slots": 2}
    }


def test_constraint_engine_valid_model(valid_building):
    engine = ConstraintEngine(valid_building)
    res = engine.validate_all()
    assert res["valid"] is True
    assert res["error_count"] == 0


def test_constraint_engine_setback_violation(valid_building):
    # Encroach into left setback (x=2.0 < side_left=4.0)
    valid_building["spaces"][0]["polygon_2d"][0] = {"x": 2.0, "y": 6.0}
    engine = ConstraintEngine(valid_building)
    res = engine.validate_all()

    assert res["valid"] is False
    assert res["error_count"] >= 1
    violations = [v for v in res["violations"] if v["rule"] == "minimum_left_setback"]
    assert len(violations) > 0
    assert violations[0]["space"] == "Master Bedroom"


def test_constraint_engine_room_size_violation(valid_building):
    # Make master bedroom 80 sq ft (minimum is 120 sq ft)
    valid_building["spaces"][0]["area_sqft"] = 80.0
    engine = ConstraintEngine(valid_building)
    violations = engine.check_room_sizes()

    assert len(violations) == 1
    assert violations[0]["rule"] == "minimum_master_bedroom_area"
    assert violations[0]["actual"] == 80.0
    assert violations[0]["required"] == 120.0
