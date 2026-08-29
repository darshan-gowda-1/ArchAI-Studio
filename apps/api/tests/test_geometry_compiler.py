"""
ArchAI Studio v3 - Parametric Geometry Compiler Tests
"""

import pytest
from packages.geometry.python.compiler import (
    compile_building,
    GeometryCompiler,
    ParametricWall,
    ParametricWindow,
    ParametricDoor
)


@pytest.fixture
def sample_building_dict():
    return {
        "site": {
            "boundary": {
                "vertices": [{"x": 0, "y": 0}, {"x": 30, "y": 0}, {"x": 30, "y": 40}, {"x": 0, "y": 40}],
                "width": 30.0,
                "length": 40.0,
                "total_area_sqft": 1200.0
            },
            "setbacks": {"front": 6.0, "rear": 5.0, "side_left": 4.0, "side_right": 4.0}
        },
        "spaces": [
            {
                "id": "spc_liv",
                "name": "Living Room",
                "type": "living_room",
                "polygon_2d": [{"x": 4, "y": 6}, {"x": 26, "y": 6}, {"x": 26, "y": 22}, {"x": 4, "y": 22}],
                "area_sqft": 352.0
            }
        ],
        "walls": [
            {
                "id": "w1",
                "start_point": {"x": 4, "y": 6},
                "end_point": {"x": 26, "y": 6},
                "thickness_inches": 9.0,
                "height_ft": 10.0,
                "material": "concrete",
                "is_exterior": True
            }
        ],
        "doors": [
            {
                "id": "door_1",
                "wall_id": "w1",
                "offset_along_wall_ft": 3.0,
                "width_ft": 3.25,
                "height_ft": 7.0
            }
        ],
        "windows": [
            {
                "id": "win_1",
                "wall_id": "w1",
                "offset_along_wall_ft": 10.0,
                "width_ft": 5.0,
                "height_ft": 4.5,
                "sill_height_ft": 3.0
            }
        ],
        "slabs": [
            {
                "id": "slab_0",
                "boundary": [{"x": 4, "y": 6}, {"x": 26, "y": 6}, {"x": 26, "y": 35}, {"x": 4, "y": 35}]
            }
        ],
        "columns": [
            {
                "id": "col_1",
                "position": {"x": 4, "y": 6},
                "width_inches": 9.0,
                "depth_inches": 15.0
            }
        ]
    }


def test_parametric_wall_and_window():
    wall = ParametricWall(
        id="wall_param_1",
        start=(0, 0),
        end=(5000, 0),
        thickness=230,
        height=3000,
        material="concrete"
    )
    assert wall.length == 5000.0
    assert wall.direction == (1.0, 0.0)
    assert wall.thickness == 230
    assert wall.height == 3000
    assert wall.material == "concrete"

    win = ParametricWindow(
        id="win_param_1",
        wall_id=wall.id,
        offset_along_wall=1500,
        width=1500,
        height=1200,
        sill_height=900
    )
    assert win.width == 1500
    assert win.height == 1200
    assert win.sill_height == 900


def test_compile_building_pipeline(sample_building_dict):
    res = compile_building(sample_building_dict)

    # Verify sequential pipeline stages
    assert "pipeline_stages" in res
    assert res["pipeline_stages"] == [
        "site", "footprint", "rooms", "walls", "doors_windows", "floors", "roof", "structural_elements", "architectural_elements"
    ]

    # Verify footprint generated from site and setbacks
    assert "footprint" in res
    assert res["footprint"]["buildable_area_sqft"] > 0

    # Verify walls and parameters
    assert len(res["walls"]) == 1
    w0 = res["walls"][0]
    assert w0["thickness"] == 9.0 * 25.4
    assert w0["height"] == 10.0 * 304.8

    # Verify doors and windows
    assert len(res["doors"]) == 1
    assert len(res["windows"]) == 1
    assert res["windows"][0]["sill_height"] == 3.0 * 304.8

    # Verify mesh summary
    assert res["mesh_summary"]["total_walls"] == 1
    assert res["mesh_summary"]["total_openings"] == 2
