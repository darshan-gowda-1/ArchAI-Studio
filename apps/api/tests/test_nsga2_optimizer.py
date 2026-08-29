"""
ArchAI Studio v3 - NSGA-II Multi-Objective Optimizer Tests
"""

import pytest
from packages.optimizer.python.fitness import evaluate_9_objectives
from packages.optimizer.python.nsga2 import NSGA2Optimizer, fast_non_dominated_sort, Individual


@pytest.fixture
def sample_building():
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
        "spaces": [
            {
                "id": "spc_liv",
                "name": "Living",
                "type": "living_room",
                "polygon_2d": [{"x": 4, "y": 6}, {"x": 26, "y": 6}, {"x": 26, "y": 22}, {"x": 4, "y": 22}],
                "area_sqft": 352.0,
                "target_area_sqft": 350.0
            }
        ],
        "walls": [
            {
                "id": "w1",
                "start_point": {"x": 4, "y": 6},
                "end_point": {"x": 26, "y": 6},
                "thickness_inches": 9.0
            }
        ],
        "windows": [{"id": "w1", "width_ft": 6.0, "height_ft": 4.5}],
        "doors": [{"id": "d1", "width_ft": 3.5, "offset_along_wall_ft": 2.0}],
        "levels": [{"id": "l0", "floor_to_floor_height_ft": 10.0}],
        "columns": [{"id": "c1", "position": {"x": 4, "y": 6}}],
        "metrics": {"total_built_up_area_sqft": 400.0, "parking_slots": 2}
    }


def test_evaluate_9_objectives(sample_building):
    objs = evaluate_9_objectives(sample_building)

    assert "cost" in objs
    assert "area" in objs
    assert "daylight_score" in objs
    assert "ventilation_score" in objs
    assert "circulation_ratio" in objs
    assert "solar_heat_gain" in objs
    assert "structural_efficiency" in objs
    assert "material_waste" in objs
    assert "user_preference" in objs

    assert objs["cost"] > 0
    assert objs["area"] == 352.0
    assert 0.0 <= objs["daylight_score"] <= 1.0
    assert 0.0 <= objs["ventilation_score"] <= 1.0


def test_nsga2_optimizer_run(sample_building):
    optimizer = NSGA2Optimizer(base_model=sample_building, population_size=6, generations=2)
    result = optimizer.run()

    assert result["status"] == "success"
    assert result["pareto_solutions_count"] >= 1
    sol0 = result["solutions"][0]
    assert "cost" in sol0
    assert "area" in sol0
    assert "daylight_score" in sol0
    assert "ventilation_score" in sol0
    assert "compliance" in sol0
