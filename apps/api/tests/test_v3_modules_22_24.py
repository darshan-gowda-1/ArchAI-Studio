"""
ArchAI Studio v3 - Comprehensive Test Suite for Modules 22 to 24
Tests:
1. Module 22: ObjectStorageService (S3/MinIO compatible storage, asset buffers, presigned URLs, metadata)
2. Module 23: AIService (parse_requirements, analyze_site_image, analyze_floorplan, extract_building_constraints, explain_design, generate_design_summary)
3. Module 24: Versioning (compare, restore, duplicate, branch) and REST API routes
"""

import pytest
from fastapi.testclient import TestClient
from apps.api.app.main import app
from infrastructure.storage.object_storage import ObjectStorageService
from integrations.openai.ai_service import AIService
from packages.versioning.python.engine import VersioningEngine
from packages.building_model import create_default_building_model

client = TestClient(app)


# 1. Module 22: Object Storage Service Tests
def test_object_storage_service():
    storage = ObjectStorageService()

    # Upload mock GLB binary buffer
    mock_glb_data = b"GLTF_BINARY_HEADER_ARCHAI_V3_TEST_DATA"
    meta = storage.upload_file_buffer(
        file_buffer=mock_glb_data,
        file_type="glb",
        filename="benchmark_model.glb",
        content_type="model/gltf-binary"
    )

    assert meta["file_type"] == "glb"
    assert meta["size_bytes"] == len(mock_glb_data)
    assert meta["storage_key"] == "glbs/benchmark_model.glb"
    assert "public_url" in meta

    # Presigned Download URL
    download_url = storage.generate_presigned_download_url(meta["storage_key"])
    assert "benchmark_model.glb" in download_url

    # Presigned Upload URL
    upload_info = storage.generate_presigned_upload_url("renders/render_4k.png", "image/png")
    assert "upload_url" in upload_info
    assert upload_info["method"] == "PUT"


# 2. Module 23: AIService Tests
def test_ai_service_all_six_methods():
    service = AIService()
    default_model = create_default_building_model().dict()

    # 1. parse_requirements
    req_res = service.parse_requirements("3BHK luxury eco-villa with swimming pool and EV charging in Mumbai")
    assert req_res["status"] == "success"
    assert "validated_requirements" in req_res

    # 2. analyze_site_image
    site_res = service.analyze_site_image("https://storage.archai.studio/site_docs/plot_survey.jpg")
    assert site_res["status"] == "success"
    assert "detected_features" in site_res
    assert len(site_res["recommendations"]) >= 2

    # 3. analyze_floorplan
    plan_res = service.analyze_floorplan(default_model)
    assert plan_res["status"] == "success"
    assert "circulation_efficiency_score" in plan_res
    assert len(plan_res["strengths"]) > 0

    # 4. extract_building_constraints
    bylaws_sample = "Maximum Ground Coverage 60%, FAR 2.0, Front setback 6.0m"
    bylaws_res = service.extract_building_constraints(bylaws_sample)
    assert bylaws_res["status"] == "success"
    assert "extracted_constraints" in bylaws_res

    # 5. explain_design
    exp_res = service.explain_design(default_model)
    assert exp_res["status"] == "success"
    assert "architectural_rationale" in exp_res

    # 6. generate_design_summary
    sum_res = service.generate_design_summary(default_model)
    assert sum_res["status"] == "success"
    assert "executive_summary" in sum_res


# 3. Module 24: Versioning Engine Tests (compare, restore, duplicate, branch)
def test_versioning_engine_operations():
    engine = VersioningEngine()
    model = create_default_building_model().dict()

    # Create Tree & Initial Revision
    design_id = "des_test_ver_01"
    tree = engine.get_or_create_tree(design_id, project_id="proj_01", name="Eco Villa Baseline", initial_model=model)
    assert len(tree.revisions) == 1
    assert tree.revisions[0].revision_number == 1

    # Add Revision 2 (Edited)
    edited_model = create_default_building_model().dict()
    edited_model["spaces"].append({
        "id": "spc_new_gym",
        "name": "Wellness Gym",
        "type": "other",
        "area_sqft": 180.0
    })
    rev2 = engine.create_revision(
        design_id=design_id,
        author="Senior Architect",
        commit_message="Added wellness gym on first floor",
        model=edited_model
    )
    assert rev2["revision_number"] == 2
    assert len(tree.revisions) == 2

    # Restore Revision 1
    restored = engine.restore_revision(design_id, tree.revisions[0].revision_id, author="Principal")
    assert restored["revision_number"] == 3
    assert "Restored from Revision #1" in restored["commit_message"]

    # Duplicate Design
    clone = engine.duplicate_design(design_id, "Eco Villa Clone")
    assert clone["design_id"] != design_id
    assert clone["name"] == "Eco Villa Clone"

    # Branch Design
    branch = engine.branch_design(design_id, branch_name="Courtyard Alternative")
    assert "branch" in branch["design_id"]

    # Compare Models
    diff = VersioningEngine.compare_models(model, edited_model)
    assert diff["status"] == "success"
    assert "Wellness Gym" in diff["delta_summary"]["added_spaces"]
    assert diff["delta_summary"]["carpet_area_delta_sqft"] == 180.0


# 4. REST API Tests for AI & Versioning Routes
def test_ai_and_versioning_api_endpoints():
    default_model = create_default_building_model().dict()

    # AI API: /api/v1/ai/parse-requirements
    ai_resp = client.post("/api/v1/ai/parse-requirements", json={"prompt": "Build a 4-bedroom bungalow"})
    assert ai_resp.status_code == 200

    # AI API: /api/v1/ai/explain-design
    exp_resp = client.post("/api/v1/ai/explain-design", json={"building_model": default_model})
    assert exp_resp.status_code == 200

    # Versioning API: /api/v1/designs/{id}/revisions
    design_id = "des_api_v_test"
    rev_resp = client.post(f"/api/v1/designs/{design_id}/revisions", json={
        "commit_message": "Upgraded master suite balcony",
        "building_model": default_model
    })
    assert rev_resp.status_code == 201

    list_revs = client.get(f"/api/v1/designs/{design_id}/revisions")
    assert list_revs.status_code == 200
    assert list_revs.json()["version_tree"]["revisions_count"] >= 2

    # Versioning API: /api/v1/designs/{id}/duplicate
    dup_resp = client.post(f"/api/v1/designs/{design_id}/duplicate", json={"new_name": "Cloned Project Variant"})
    assert dup_resp.status_code == 201

    # Versioning API: /api/v1/designs/{id}/branch
    branch_resp = client.post(f"/api/v1/designs/{design_id}/branch", json={"branch_name": "Alternative Facade Scheme"})
    assert branch_resp.status_code == 201

    # Versioning API: /api/v1/designs/compare
    comp_resp = client.post("/api/v1/designs/compare", json={
        "design_model_a": default_model,
        "design_model_b": default_model
    })
    assert comp_resp.status_code == 200
    assert comp_resp.json()["delta_summary"]["carpet_area_delta_sqft"] == 0.0
