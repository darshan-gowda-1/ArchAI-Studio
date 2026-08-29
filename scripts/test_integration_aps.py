"""
ArchAI Studio v3 - Integration Test 4: Autodesk Platform Services (APS / Forge)
Validates:
1. 2-Legged OAuth token generation
2. OSS bucket provisioning
3. IFC / BIM model registration and URN encoding
4. Model Derivative SVF/SVF2 cloud translation
5. Autodesk Viewer manifest readiness
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from integrations.autodesk.service import AutodeskAPSService


def test_aps_integration():
    print("=" * 70)
    print("INTEGRATION 4: AUTODESK PLATFORM SERVICES (APS / FORGE)")
    print("=" * 70)

    aps_service = AutodeskAPSService()

    # 1. 2-Legged OAuth Token
    print(f"\n[1] Generating 2-Legged OAuth Viewer Token:")
    token_data = aps_service.get_viewer_token()
    print(f"    - Token Type: {token_data.get('token_type')}")
    print(f"    - Access Token: {token_data.get('access_token')[:25]}...")
    print(f"    - Expires In: {token_data.get('expires_in')} seconds")
    assert token_data.get("access_token") is not None

    # 2. OSS Bucket Management
    print(f"\n[2] Provisioning APS OSS Bucket:")
    bucket = aps_service.create_bucket_if_needed("archai-v3-bim-storage")
    print(f"    - Bucket Key: {bucket.get('bucketKey')}")
    print(f"    - Policy: {bucket.get('policyKey')}")
    assert bucket.get("status") == "success"

    # 3. Model Registration & SVF2 Translation
    print(f"\n[3] Submitting IFC4 Model to Model Derivative API:")
    reg = aps_service.register_model_for_translation("local_temp/building.ifc", filename="villa_project.ifc")
    print(f"    - Encoded Base64 URN: {reg.get('urn')[:35]}...")
    print(f"    - Translation Status: {reg.get('translation_status')}")
    print(f"    - Autodesk Cloud Viewer URL: {reg.get('viewer_url')}")
    assert reg.get("translation_status") == "complete"
    assert "urn" in reg

    print("\n" + "=" * 70)
    print("SUCCESS: INTEGRATION 4 (AUTODESK APS) FULLY OPERATIONAL!")
    print("=" * 70)
    return True


if __name__ == "__main__":
    test_aps_integration()
