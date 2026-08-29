"""
ArchAI Studio v3 - Comprehensive Test Suite for Modules 17 to 21
Tests:
1. Module 17: GoogleSolarService (analysis, pv rec, roof rec, solar objective)
2. Module 18: MeshyAssetService (9 asset categories, asset generation & library)
3. Module 19: Open BIM Layer (IFC4 export, APS translation, Speckle sync)
4. Module 20: Comprehensive REST API Route Hierarchy
5. Module 21: Auth & Multi-Tenancy (User, Organization, Project, Role RBAC)
"""

import pytest
from fastapi.testclient import TestClient
from apps.api.app.main import app
from integrations.google_solar.service import GoogleSolarService
from integrations.meshy.service import MeshyAssetService, SUPPORTED_ASSET_CATEGORIES
from apps.api.app.auth.security import hash_password, verify_password, create_access_token, decode_access_token

client = TestClient(app)


# 1. Module 17: Google Solar Tests
def test_google_solar_service_flow():
    service = GoogleSolarService()
    analysis = service.get_solar_analysis(19.0760, 72.8777)
    assert analysis["status"] == "success"
    assert "roof_segments" in analysis
    assert len(analysis["roof_segments"]) >= 3
    assert "sun_exposure" in analysis

    # Downstream feeds
    solar_score = service.feed_into_solar_objective(analysis)
    assert 0.0 <= solar_score <= 1.0

    daylight = service.feed_into_daylight_analysis(analysis)
    assert "average_daylight_factor_pct" in daylight

    roof_rec = service.feed_into_roof_design(analysis)
    assert "recommended_roof_tilt_degrees" in roof_rec

    pv_rec = service.feed_into_pv_recommendation(analysis)
    assert "recommended_panel_count" in pv_rec
    assert "annual_bill_savings_inr" in pv_rec


# 2. Module 18: Meshy 3D Asset Service Tests
def test_meshy_asset_generation_and_categories():
    service = MeshyAssetService()

    # Verify 9 required categories
    expected_categories = [
        "sofa", "bed", "table", "chair", "kitchen", "plant", "lamp", "cabinet", "sanitary_fixtures"
    ]
    for cat in expected_categories:
        assert cat in SUPPORTED_ASSET_CATEGORIES

    # Test asset generation
    asset = service.generate_asset("Modern Italian Leather Sofa", category="sofa")
    assert asset["category"] == "sofa"
    assert "glb_url" in asset
    assert "dimensions_ft" in asset

    # Test library retrieval
    catalog = service.list_category_assets("sofa")
    assert len(catalog) >= 1


# 3. Module 21: Authentication & RBAC Tests
def test_auth_registration_and_login_flow():
    # 1. Register
    reg_payload = {
        "email": "lead_designer@archai.studio",
        "password": "DesignMaster2026!",
        "full_name": "Lead Designer",
        "role": "architect",
        "organization_name": "Atelier Urbanism",
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    auth_data = reg_resp.json()
    assert "access_token" in auth_data
    token = auth_data["access_token"]

    # 2. Decode Token
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["email"] == "lead_designer@archai.studio"
    assert payload["role"] == "architect"

    # 3. Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "lead_designer@archai.studio",
        "password": "DesignMaster2026!"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


# 4. Module 20: Comprehensive API Hierarchy Tests
def test_project_and_subresource_api_routes():
    # 1. Create Project
    p_resp = client.post("/api/v1/projects", json={
        "name": "Mumbai Bioclimatic Tower",
        "client_name": "Green Heights",
        "jurisdiction": "NBC_2016_INDIA",
        "location": "Mumbai, India",
        "latitude": 19.0760,
        "longitude": 72.8777,
    })
    assert p_resp.status_code == 201
    proj_id = p_resp.json()["project"]["id"]

    # 2. Get Project
    get_p = client.get(f"/api/v1/projects/{proj_id}")
    assert get_p.status_code == 200

    # 3. Site Setup & Solar Analysis
    site_resp = client.post(f"/api/v1/projects/{proj_id}/site", json={
        "width_ft": 40.0,
        "length_ft": 60.0,
        "address": "Bandra Kurla Complex",
    })
    assert site_resp.status_code == 200

    site_anal_resp = client.post(f"/api/v1/projects/{proj_id}/site/analyze")
    assert site_anal_resp.status_code == 200
    assert "solar_analysis" in site_anal_resp.json()

    # 4. Project Requirements
    req_resp = client.post(f"/api/v1/projects/{proj_id}/requirements", json={
        "brief": "3-bedroom residential villa",
        "target_carpet_area_sqft": 1400.0,
    })
    assert req_resp.status_code == 200

    # 5. Project Design Generation
    gen_resp = client.post(f"/api/v1/projects/{proj_id}/designs/generate")
    assert gen_resp.status_code == 200
    design_id = gen_resp.json()["design"]["id"]

    # 6. Design Geometry & BOQ & Compliance
    geom_resp = client.get(f"/api/v1/designs/{design_id}/geometry")
    assert geom_resp.status_code == 200

    boq_resp = client.get(f"/api/v1/designs/{design_id}/boq")
    assert boq_resp.status_code == 200

    comp_resp = client.get(f"/api/v1/designs/{design_id}/compliance")
    assert comp_resp.status_code == 200

    # 7. Design BIM Exports
    ifc_resp = client.post(f"/api/v1/designs/{design_id}/export/ifc")
    assert ifc_resp.status_code == 200
    assert "download_url" in ifc_resp.json()

    glb_resp = client.post(f"/api/v1/designs/{design_id}/export/glb")
    assert glb_resp.status_code == 200

    aps_resp = client.post(f"/api/v1/designs/{design_id}/aps")
    assert aps_resp.status_code == 200

    speckle_resp = client.post(f"/api/v1/designs/{design_id}/speckle")
    assert speckle_resp.status_code == 200


def test_optimization_runs_api():
    # 1. Create Optimization Run
    opt_resp = client.post("/api/v1/optimization/runs", json={
        "population_size": 8,
        "generations": 4,
    })
    assert opt_resp.status_code == 201
    run_id = opt_resp.json()["run_id"]

    # 2. Get Optimization Run
    get_run = client.get(f"/api/v1/optimization/runs/{run_id}")
    assert get_run.status_code == 200

    # 3. Get Optimization Solutions
    sols_resp = client.get(f"/api/v1/optimization/runs/{run_id}/solutions")
    assert sols_resp.status_code == 200
    assert "solutions" in sols_resp.json()
