#!/usr/bin/env python3
"""
ArchAI Studio v3 - System Healthcheck CLI
Verifies Python dependencies, package imports, and engine status.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../packages/building-model/python")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../packages/geometry/python")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../packages/optimizer/python")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../packages/boq/python")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../packages/compliance/python")))

def run_healthcheck():
    print("ArchAI Studio v3 - System Diagnostic Healthcheck")
    print("-" * 50)

    modules_to_test = [
        ("Canonical Building Model", "packages.building_model.building_model"),
        ("Geometry Engine (Shapely / trimesh)", "packages.geometry.python.compiler"),
        ("NSGA-II Optimizer", "packages.optimizer.python.nsga2"),
        ("BOQ / QTO Engine", "packages.boq.python.qto"),
        ("Compliance Engine", "packages.compliance.python.checker"),
        ("OpenAI Requirements Parser", "integrations.openai.parser"),
        ("Google Solar Integration", "integrations.google_solar.client"),
        ("FastAPI Backend Application", "apps.api.app.main"),
    ]

    all_passed = True
    for name, mod_path in modules_to_test:
        try:
            __import__(mod_path)
            print(f"  [OK] {name}")
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")
            all_passed = False

    print("-" * 50)
    if all_passed:
        print("ALL ARCHAI V3 ENGINES ONLINE & OPERATIONAL")
        return 0
    else:
        print("SOME CHECKS FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(run_healthcheck())
