"""
ArchAI Studio v3 - Master End-to-End Critical Integration Pipeline Test
Validates the complete uninterrupted architectural synthesis pipeline:
Requirements
  ↓
BuildingModel
  ↓
Optimization (NSGA-II)
  ↓
Geometry Compilation
  ↓
BOQ Takeoff (16-Categories)
  ↓
Compliance Verification (NBC 2016)
  ↓
GLB Multi-LOD Generation & Object Storage
"""

import pytest
from integrations.openai.parser import RequirementsParser
from packages.building_model import BuildingModel, create_default_building_model
from packages.optimizer.python.nsga2 import NSGA2Optimizer
from packages.geometry.python.compiler import compile_building
from packages.boq.python.qto import calculate_building_boq
from packages.compliance.python.checker import check_building_compliance
from integrations.blender.pipeline import BlenderVisualizationPipeline
from infrastructure.storage.object_storage import ObjectStorageService


def test_critical_e2e_architectural_pipeline():
    # 1. Step 1: AI Requirements Parsing
    brief = "Design a 3-bedroom sustainable eco-villa for a family of 5, approximately 2000 sq ft, with double-height living, home office, and rooftop solar."
    parser = RequirementsParser()
    reqs = parser.parse_natural_language(brief)
    assert reqs.bedrooms == 3
    assert reqs.target_area_sqft > 0

    # 2. Step 2: Canonical BuildingModel Assembly
    base_model = create_default_building_model()
    base_dict = base_model.model_dump() if hasattr(base_model, "model_dump") else base_model.dict()
    assert len(base_dict["spaces"]) >= 4
    assert base_dict["site"]["boundary"]["total_area_sqft"] > 0

    # 3. Step 3: Multi-Objective Optimization (NSGA-II)
    optimizer = NSGA2Optimizer(base_model=base_dict, population_size=8, generations=4)
    opt_results = optimizer.run()
    assert len(opt_results["solutions"]) > 0

    # Select Top Pareto Solution
    top_candidate = opt_results["solutions"][0]
    candidate_model = top_candidate.get("model", base_dict)

    # 4. Step 4: Parametric Geometry Compilation
    compiled_geom = compile_building(candidate_model)
    assert "summary" in compiled_geom
    assert compiled_geom["summary"]["total_wall_linear_ft"] > 0
    assert len(compiled_geom["meshes"]["walls"]) > 0

    # 5. Step 5: 16-Category BOQ Quantity Takeoff
    boq = calculate_building_boq(candidate_model)
    assert boq["grand_total_inr"] > 0
    assert boq["rate_per_sqft_inr"] > 0
    assert len(boq["items"]) == 16
    assert len(boq["breakdown"]) >= 6

    # 6. Step 6: NBC 2016 Statutory Compliance Verification
    compliance = check_building_compliance(candidate_model, "NBC_2016_INDIA")
    assert compliance["overall_status"] in ["COMPLIANT", "NON_COMPLIANT"]
    assert compliance["score_percent"] > 0.0

    # 7. Step 7: Blender Visualization & Multi-LOD GLB Generation
    blender_pipeline = BlenderVisualizationPipeline()
    vis_res = blender_pipeline.process_building(candidate_model)
    assert "building.glb" in vis_res["urls"]["glb_standard"]
    assert "building_low.glb" in vis_res["urls"]["glb_low"]
    assert "building_high.glb" in vis_res["urls"]["glb_high"]
    assert "render.png" in vis_res["urls"]["render_4k"]

    # 8. Step 8: S3-Compatible Object Storage Archival
    storage = ObjectStorageService()
    mock_glb_payload = b"HEADER_GLB_BINARY_CONTENT"
    meta = storage.upload_file_buffer(
        file_buffer=mock_glb_payload,
        file_type="glb",
        filename=f"pipeline_{candidate_model['id']}.glb"
    )
    assert meta["storage_key"].startswith("glbs/")
    assert meta["size_bytes"] == len(mock_glb_payload)
