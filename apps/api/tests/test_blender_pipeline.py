"""
ArchAI Studio v3 - Blender Visualization Pipeline Tests
"""

import pytest
import os
from integrations.blender.pipeline import BlenderVisualizationPipeline


@pytest.fixture
def sample_model():
    return {
        "id": "bldg_blender_test",
        "site": {
            "boundary": {
                "vertices": [{"x": 0, "y": 0}, {"x": 30, "y": 0}, {"x": 30, "y": 40}, {"x": 0, "y": 40}],
                "width": 30.0,
                "length": 40.0,
                "total_area_sqft": 1200.0
            }
        },
        "spaces": [{"id": "s1", "polygon_2d": [{"x": 4, "y": 6}, {"x": 26, "y": 6}, {"x": 26, "y": 20}, {"x": 4, "y": 20}]}],
        "walls": [{"id": "w1", "start_point": {"x": 4, "y": 6}, "end_point": {"x": 26, "y": 6}, "thickness_inches": 9.0, "height_ft": 10.0}],
        "doors": [],
        "windows": [],
        "slabs": [{"id": "sl1", "boundary": [{"x": 4, "y": 6}, {"x": 26, "y": 6}, {"x": 26, "y": 20}, {"x": 4, "y": 20}]}],
        "columns": []
    }


def test_blender_pipeline_execution(sample_model):
    pipeline = BlenderVisualizationPipeline()
    res = pipeline.process_building(sample_model)

    assert res["status"] == "success"
    assert "pipeline_stages" in res
    assert "Three.js Integration" in res["pipeline_stages"]

    assets = res["assets"]
    assert "building_glb" in assets
    assert "building_low_glb" in assets
    assert "building_high_glb" in assets
    assert "render_png" in assets
    assert "render_jpg" in assets

    # Verify files created on filesystem
    assert os.path.exists(assets["building_glb"])
    assert os.path.exists(assets["building_low_glb"])
    assert os.path.exists(assets["building_high_glb"])
    assert os.path.exists(assets["render_png"])
    assert os.path.exists(assets["render_jpg"])
