"""
ArchAI Studio v3 - API Endpoints Integration Tests
"""

import pytest
from fastapi.testclient import TestClient
from apps.api.app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "ArchAI Studio v3 API"
    assert data["status"] == "HEALTHY"


def test_projects_flow():
    create_resp = client.post("/api/v1/projects", json={
        "name": "Bandra Coastal Villa",
        "client_name": "Eco Group",
        "jurisdiction": "NBC_2016_INDIA",
        "location": "Mumbai, India"
    })
    assert create_resp.status_code in [200, 201]
    proj_data = create_resp.json()["project"]
    proj_id = proj_data["id"]

    get_resp = client.get(f"/api/v1/projects/{proj_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["project"]["name"] == "Bandra Coastal Villa"


def test_site_analyze_endpoint():
    resp = client.post("/api/v1/sites/analyze", json={
        "length": 40.0,
        "width": 30.0,
        "front_setback": 6.0,
        "rear_setback": 5.0,
        "side_left": 4.0,
        "side_right": 4.0
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["plot_area_sqft"] == 1200.0
    assert data["buildable_footprint_sqft"] == 638.0


def test_requirements_parse_endpoint():
    resp = client.post("/api/v1/requirements/parse", json={
        "prompt": "I need a 3 bedroom house for a family of five, around 2200 sq ft, with a home office, parking for two cars and good natural ventilation."
    })
    assert resp.status_code == 200
    data = resp.json()
    reqs = data["validated_requirements"]
    assert reqs["bedrooms"] == 3
    assert reqs["target_area_sqft"] == 2200.0


def test_optimizer_and_boq_and_compliance():
    sample_building = {
        "id": "bldg_test_api",
        "spaces": [{"id": "s1", "type": "living_room", "area_sqft": 250.0}],
        "walls": [{"id": "w1", "start_point": {"x": 0, "y": 0}, "end_point": {"x": 20, "y": 0}, "thickness_inches": 9.0, "height_ft": 10.0, "is_exterior": True}],
        "windows": [],
        "doors": [],
        "slabs": [],
        "columns": [],
        "site": {"setbacks": {"front": 6.0, "rear": 5.0, "side_left": 4.0, "side_right": 4.0}},
        "constraints": {"jurisdiction_code": "NBC_2016_INDIA"}
    }

    # Optimizer
    opt_resp = client.post("/api/v1/optimizer/run", json={"building_model": sample_building})
    assert opt_resp.status_code == 200
    assert len(opt_resp.json()["candidates"]) > 0

    # BOQ
    boq_resp = client.post("/api/v1/boq/calculate", json={"building_model": sample_building})
    assert boq_resp.status_code == 200
    assert boq_resp.json()["cost_estimate"]["grand_total_inr"] > 0

    # Compliance
    comp_resp = client.post("/api/v1/compliance/verify", json={"building_model": sample_building})
    assert comp_resp.status_code == 200
    assert comp_resp.json()["compliance_report"]["jurisdiction"] == "NBC_2016_INDIA"
