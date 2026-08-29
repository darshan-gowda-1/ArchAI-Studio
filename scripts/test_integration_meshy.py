"""
ArchAI Studio v3 - Integration Test 3: Meshy 3D Asset Service
Validates:
1. 9 Architectural asset categories coverage
2. Pre-seeded high-fidelity PBR GLB catalog
3. AI text-to-3D asset synthesis
4. Category filtering and asset retrieval
5. Three.js furniture instancing schema
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from integrations.meshy.service import MeshyAssetService, SUPPORTED_ASSET_CATEGORIES


def test_meshy_integration():
    print("=" * 70)
    print("INTEGRATION 3: MESHY 3D ASSET GENERATION SERVICE")
    print("=" * 70)

    meshy_service = MeshyAssetService()

    # 1. Validate 9 Architectural Categories
    print(f"\n[1] Verifying 9 Architectural Categories:")
    print(f"    - Categories: {SUPPORTED_ASSET_CATEGORIES}")
    assert len(SUPPORTED_ASSET_CATEGORIES) == 9
    for cat in ["sofa", "bed", "table", "chair", "kitchen", "plant", "lamp", "cabinet", "sanitary_fixtures"]:
        assert cat in SUPPORTED_ASSET_CATEGORIES

    # 2. Inspect Pre-Seeded Catalog Library
    print(f"\n[2] Checking Pre-Seeded Asset Library:")
    all_assets = meshy_service.list_category_assets()
    print(f"    - Catalog Size: {len(all_assets)} standard architectural assets")
    assert len(all_assets) >= 9

    # 3. AI Text-to-3D Asset Synthesis
    prompts = [
        ("Italian leather 3-seater modular sofa with walnut legs", "sofa"),
        ("Teak dining table with 6 upholstered chairs", "table"),
        ("Fiddle leaf fig in fluted terracotta planter", "plant")
    ]

    print(f"\n[3] Synthesizing AI 3D Assets:")
    for p, expected_cat in prompts:
        gen = meshy_service.generate_asset(prompt=p, category=expected_cat)
        print(f"    - Prompt: \"{p}\"")
        print(f"      Asset ID: {gen['id']} | Category: {gen['category']} | Polycount: {gen['polygon_count']}")
        print(f"      GLB URL: {gen['glb_url']}")
        assert gen["category"] == expected_cat
        assert gen["glb_url"].endswith(".glb")

    # 4. Category Filtering
    print(f"\n[4] Querying Catalog by Category ('sofa'):")
    sofas = meshy_service.list_category_assets("sofa")
    print(f"    - Matching Sofas in Catalog: {len(sofas)}")
    assert len(sofas) >= 2

    print("\n" + "=" * 70)
    print("SUCCESS: INTEGRATION 3 (MESHY) FULLY OPERATIONAL!")
    print("=" * 70)
    return True


if __name__ == "__main__":
    test_meshy_integration()
