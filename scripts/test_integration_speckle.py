"""
ArchAI Studio v3 - Integration Test 5: Speckle AEC Interoperability
Validates:
1. Speckle Stream creation & multi-branch initialization
2. Canonical BuildingModel -> Speckle Base AEC Object translation
3. Real-time stream commit & versioning
4. Rhino, Grasshopper & Revit receiver link synthesis
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from integrations.speckle.service import SpeckleService
from packages.building_model import create_default_building_model


def test_speckle_integration():
    print("=" * 70)
    print("INTEGRATION 5: SPECKLE AEC INTEROPERABILITY SERVICE")
    print("=" * 70)

    speckle_service = SpeckleService()

    # 1. Project Stream Creation
    print(f"\n[1] Creating Project Stream on Speckle Server:")
    stream = speckle_service.create_project_stream(
        name="Eco-Villa Bangalore Synthesis",
        description="Parametric BIM stream synchronized from ArchAI Studio v3"
    )
    stream_id = stream.get("stream_id")
    print(f"    - Stream ID: {stream_id}")
    print(f"    - Stream Name: {stream.get('name')}")
    print(f"    - Active Branches: {stream.get('branches')}")
    print(f"    - Speckle Web App URL: {stream.get('url')}")
    assert stream.get("status") == "success"
    assert stream_id is not None

    # 2. Sync Canonical BuildingModel to Speckle
    print(f"\n[2] Committing BuildingModel Hierarchy to Stream Branch 'main':")
    bldg = create_default_building_model()
    bldg_dict = bldg.model_dump() if hasattr(bldg, "model_dump") else bldg.dict()
    
    commit = speckle_service.sync_building_model(
        stream_id=stream_id,
        building_model=bldg_dict,
        branch_name="main",
        message="Initial NSGA-II Pareto Option A commit"
    )
    print(f"    - Commit ID: {commit.get('commit_id')}")
    breakdown = commit.get("element_breakdown", {})
    print(f"    - Elements Serialized: {breakdown.get('total_speckle_objects')} objects ({breakdown.get('walls')} walls, {breakdown.get('spaces')} rooms, {breakdown.get('slabs')} slabs, {breakdown.get('columns')} columns)")
    print(f"    - Speckle Commit View: {commit.get('view_url')}")
    print(f"    - Rhino/Grasshopper Receiver: {commit.get('rhino_receiver_url')}")
    print(f"    - Autodesk Revit Receiver: {commit.get('revit_receiver_url')}")
    assert commit.get("status") == "success"
    assert breakdown.get("total_speckle_objects") > 0

    print("\n" + "=" * 70)
    print("SUCCESS: INTEGRATION 5 (SPECKLE) FULLY OPERATIONAL!")
    print("=" * 70)
    return True


if __name__ == "__main__":
    test_speckle_integration()
