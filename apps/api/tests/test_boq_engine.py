"""
ArchAI Studio v3 - BOQ & Cost Engine Unit Tests
"""

import pytest
from packages.boq.python.qto import calculate_building_boq


@pytest.fixture
def test_model():
    return {
        "site": {
            "boundary": {
                "vertices": [{"x": 0, "y": 0}, {"x": 30, "y": 0}, {"x": 30, "y": 40}, {"x": 0, "y": 40}],
                "width": 30.0,
                "length": 40.0,
                "total_area_sqft": 1200.0
            }
        },
        "spaces": [
            {
                "id": "spc_1",
                "name": "Living Room",
                "area_sqft": 400.0,
                "level_index": 0
            }
        ],
        "walls": [
            {
                "id": "w1",
                "start_point": {"x": 4, "y": 6},
                "end_point": {"x": 26, "y": 6}
            }
        ],
        "doors": [{"id": "d1"}],
        "windows": [{"id": "w1", "width_ft": 5.0, "height_ft": 4.5}],
        "slabs": [{"id": "s1"}],
        "columns": [{"id": "c1"}]
    }


def test_calculate_building_boq_16_categories(test_model):
    boq = calculate_building_boq(test_model)

    assert "total_cost" in boq
    assert "currency" in boq
    assert boq["currency"] == "INR"
    assert boq["total_cost"] > 0

    items = boq["items"]
    assert len(items) == 16

    categories = [it["category"] for it in items]
    assert "earthwork" in categories
    assert "foundation" in categories
    assert "concrete" in categories
    assert "reinforcement" in categories
    assert "brick_block" in categories
    assert "plaster" in categories
    assert "flooring" in categories
    assert "doors" in categories
    assert "windows" in categories
    assert "roof" in categories
    assert "painting" in categories
    assert "electrical" in categories
    assert "plumbing" in categories
    assert "HVAC" in categories
    assert "landscape" in categories
    assert "furniture" in categories


def test_custom_rate_override(test_model):
    custom_rate = {"rcc_structural_m3": 10000.0}
    boq = calculate_building_boq(test_model, custom_rates=custom_rate)

    concrete_item = next(it for it in boq["items"] if it["category"] == "concrete")
    assert concrete_item["rate"] == 10000.0
