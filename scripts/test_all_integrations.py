"""
ArchAI Studio v3 - Master Sequential Integration Test Suite
Executes all 5 external cloud integrations one at a time:
1. OpenAI (NLP, Vision, Constraints, Rationale)
2. Google Solar (Rooftop Irradiance, Flux, Pitch & PV Sizing)
3. Meshy (9-Category 3D Asset Synthesis & Catalog)
4. Autodesk Platform Services (APS / Forge SVF2 Translation)
5. Speckle AEC (Stream Commit & Revit/Rhino Bridge)
"""

import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.test_integration_openai import test_openai_integration
from scripts.test_integration_google_solar import test_google_solar_integration
from scripts.test_integration_meshy import test_meshy_integration
from scripts.test_integration_aps import test_aps_integration
from scripts.test_integration_speckle import test_speckle_integration


def run_all_integrations():
    print("=" * 80)
    print("ARCHAI STUDIO v3 -- 5-SERVICE EXTERNAL INTEGRATION SUITE (ONE AT A TIME)")
    print("=" * 80)

    integrations = [
        ("OpenAI AIService", test_openai_integration),
        ("Google Solar Service", test_google_solar_integration),
        ("Meshy 3D Asset Service", test_meshy_integration),
        ("Autodesk APS Service", test_aps_integration),
        ("Speckle AEC Service", test_speckle_integration),
    ]

    results = []
    for name, runner in integrations:
        t0 = time.time()
        try:
            success = runner()
            dt = time.time() - t0
            results.append((name, "PASS", dt))
        except Exception as e:
            dt = time.time() - t0
            results.append((name, f"FAIL: {str(e)}", dt))

    print("\n" + "=" * 80)
    print("MASTER INTEGRATION VERIFICATION SCORECARD")
    print("=" * 80)
    all_passed = True
    for name, status, dt in results:
        badge = "[PASS]" if "PASS" in status else "[FAIL]"
        print(f"  {badge:7s} | {name:32s} | Execution: {dt:.2f}s")
        if "FAIL" in status:
            all_passed = False

    print("=" * 80)
    if all_passed:
        print("ALL 5 EXTERNAL INTEGRATIONS OPERATIONAL & VERIFIED!")
    else:
        print("SOME INTEGRATIONS FAILED. CHECK LOGS ABOVE.")
    print("=" * 80)


if __name__ == "__main__":
    run_all_integrations()
