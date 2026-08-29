"""
ArchAI Studio v3 - Background Jobs & Worker API Unit Tests
"""

import pytest
from fastapi.testclient import TestClient
from apps.api.app.main import app

client = TestClient(app)


def test_create_and_poll_job():
    req_payload = {
        "task_name": "geometry_generation",
        "payload": {
            "building_model": {
                "id": "bldg_async_01",
                "spaces": [{"id": "s1", "polygon_2d": [{"x": 0, "y": 0}, {"x": 20, "y": 0}, {"x": 20, "y": 20}, {"x": 0, "y": 20}]}],
                "walls": [{"id": "w1", "start_point": {"x": 0, "y": 0}, "end_point": {"x": 20, "y": 0}}]
            }
        }
    }

    # 1. Create Job
    create_resp = client.post("/api/v1/jobs", json=req_payload)
    assert create_resp.status_code == 202
    data = create_resp.json()
    assert "job_id" in data
    assert data["task_name"] == "geometry_generation"
    assert "poll_url" in data

    job_id = data["job_id"]

    # 2. Poll Job Status
    poll_resp = client.get(f"/api/v1/jobs/{job_id}")
    assert poll_resp.status_code == 200
    job_status = poll_resp.json()
    assert job_status["id"] == job_id
    assert job_status["status"] in ["queued", "running", "completed"], f"Job failed with: {job_status.get('error_message')}"


def test_all_12_worker_tasks_submission():
    task_names = [
        "requirements_ai",
        "optimization",
        "geometry_generation",
        "blender_render",
        "glb_generation",
        "boq_generation",
        "compliance",
        "ifc_export",
        "aps_sync",
        "speckle_sync",
        "meshy_generation",
        "solar_analysis",
    ]

    for tname in task_names:
        resp = client.post("/api/v1/jobs", json={"task_name": tname, "payload": {}})
        assert resp.status_code == 202
        assert resp.json()["task_name"] == tname
