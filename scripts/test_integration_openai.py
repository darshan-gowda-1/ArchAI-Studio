"""
ArchAI Studio v3 - Integration Test 1: OpenAI AIService
Validates:
1. Natural language architectural requirements parsing
2. Site image & setback vision analysis
3. Floorplan spatial layout analysis
4. Municipal constraint extraction
5. Bioclimatic design explanation & executive summary
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from integrations.openai.ai_service import AIService
from integrations.openai.parser import RequirementsParser
from packages.building_model import create_default_building_model


def test_openai_integration():
    print("=" * 70)
    print("INTEGRATION 1: OPENAI AI ARCHITECTURAL SERVICE")
    print("=" * 70)

    ai_service = AIService()
    parser = RequirementsParser()

    # 1. Natural Language Brief Parsing
    brief = "Design a contemporary 3BHK duplex villa on a 30x40 south-facing plot with double-height living room, modular open kitchen, home office, and rooftop solar panels under 45 Lakhs INR."
    print(f"\n[1] Parsing Natural Language Brief:\n    \"{brief}\"")
    reqs = parser.parse_natural_language(brief)
    print(f"    - Bedrooms: {reqs.bedrooms}")
    print(f"    - Target Area: {reqs.target_area_sqft} sq ft")
    print(f"    - Special Requirements: {reqs.special_requirements}")
    print(f"    - Budget Target: INR {reqs.target_budget_inr:,.2f}")
    assert reqs.bedrooms == 3
    assert reqs.target_area_sqft > 0

    # 2. Site Image Analysis
    print("\n[2] Site Image & Orientation Analysis:")
    site_analysis = ai_service.analyze_site_image("https://assets.archai.studio/sites/demo_plot_survey.jpg")
    features = site_analysis.get("detected_features", {})
    print(f"    - Plot Shape: {features.get('plot_shape')}")
    print(f"    - Road Access: {features.get('road_access_width_ft')} ft")
    print(f"    - Topography Slope: {features.get('estimated_slope_percent')}%")
    print(f"    - Solar Shading: {features.get('solar_shading_risks')}")
    assert "plot_shape" in features

    # 3. Floorplan Image Analysis
    print("\n[3] Floorplan Spatial Layout Analysis:")
    floorplan_analysis = ai_service.analyze_floorplan({"spaces": [{"name": "Living", "area_sqft": 240}, {"name": "Kitchen", "area_sqft": 120}]})
    print(f"    - Circulation Efficiency: {floorplan_analysis.get('circulation_efficiency_score')}%")
    print(f"    - Acoustic Zoning: {floorplan_analysis.get('acoustic_zoning_score')}%")
    print(f"    - Ventilation Flow: {floorplan_analysis.get('ventilation_flow_rate_score')}%")
    assert floorplan_analysis.get("circulation_efficiency_score") > 0

    # 4. Municipal Constraints Extraction
    print("\n[4] Municipal & NBC 2016 Constraint Extraction:")
    constraints = ai_service.extract_building_constraints("Plot size 1200 sqft in Bangalore BBMP zone with 30ft road width.")
    c_data = constraints.get("extracted_constraints", {})
    print(f"    - Jurisdiction: {c_data.get('jurisdiction')}")
    print(f"    - Max FAR/FSI: {c_data.get('maximum_far_fsi')}")
    print(f"    - Max Height: {c_data.get('maximum_height_ft')} ft")
    print(f"    - Setbacks: {c_data.get('minimum_setbacks_ft')}")
    assert "minimum_setbacks_ft" in c_data

    # 5. Design Explanation & Bioclimatic Rationale
    print("\n[5] Bioclimatic Design Rationale & Executive Summary:")
    bldg = create_default_building_model()
    bldg_dict = bldg.model_dump() if hasattr(bldg, "model_dump") else bldg.dict()
    explanation = ai_service.explain_design(bldg_dict)
    print(f"    - Architectural Rationale: {explanation.get('architectural_rationale')[:120]}...")
    print(f"    - Client Pitch: {explanation.get('target_client_pitch')}")
    assert "architectural_rationale" in explanation

    print("\n" + "=" * 70)
    print("SUCCESS: INTEGRATION 1 (OPENAI) FULLY OPERATIONAL!")
    print("=" * 70)
    return True


if __name__ == "__main__":
    test_openai_integration()
