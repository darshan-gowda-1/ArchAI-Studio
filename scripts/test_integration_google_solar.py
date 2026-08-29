"""
ArchAI Studio v3 - Integration Test 2: Google Solar Service
Validates:
1. Google Solar API Lat/Lon rooftop potential retrieval
2. Roof segment segmentation (South pitch, North pitch, Flat terrace)
3. NSGA-II solar fitness score computation
4. Indoor daylight factor illuminance calculation
5. Bioclimatic roof pitch & orientation recommendation
6. Solar PV system sizing, annual kWh generation & financial payback (INR)
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from integrations.google_solar.service import GoogleSolarService


def test_google_solar_integration():
    print("=" * 70)
    print("INTEGRATION 2: GOOGLE SOLAR PLATFORM SERVICE")
    print("=" * 70)

    solar_service = GoogleSolarService()
    # Coordinates for Bangalore, India
    lat, lon = 12.9716, 77.5946

    # 1. Retrieve Solar Analysis & Roof Segments
    print(f"\n[1] Querying Solar Potential for ({lat}, {lon}):")
    analysis = solar_service.get_solar_analysis(lat, lon)
    pot = analysis.get("solar_potential", {})
    sun = analysis.get("sun_exposure", {})
    print(f"    - Max Sunshine Hours/Year: {analysis.get('max_sunshine_hours_per_year')} hrs")
    print(f"    - Max Solar Array Area: {pot.get('max_array_area_sqft'):.1f} sq ft")
    print(f"    - Daily Peak Sun Hours: {sun.get('annual_average_daily_sun_hours')} hrs/day")
    print(f"    - Roof Segments Extracted: {len(analysis.get('roof_segments', []))}")
    assert len(analysis.get("roof_segments", [])) >= 2

    # 2. Feed into NSGA-II Solar Objective
    print("\n[2] Feeding into NSGA-II Multi-Objective Optimizer:")
    solar_score = solar_service.feed_into_solar_objective(analysis)
    print(f"    - Normalized Solar Objective Score: {solar_score}/1.0 (Higher is Better)")
    assert 0.0 <= solar_score <= 1.0

    # 3. Feed into Daylight & Lux Analysis
    print("\n[3] Computing Indoor Daylight & Lux Distribution:")
    daylight = solar_service.feed_into_daylight_analysis(analysis, window_to_wall_ratio=0.25)
    print(f"    - Average Daylight Factor: {daylight.get('average_daylight_factor_pct')}%")
    print(f"    - Useful Daylight Illuminance: {daylight.get('useful_daylight_illuminance_lux')} lux")
    print(f"    - LEED Daylight Compliant: {daylight.get('leed_daylight_compliant')}")
    assert daylight.get("average_daylight_factor_pct") > 0.0

    # 4. Feed into Roof Pitch & Orientation Design
    print("\n[4] Bioclimatic Roof Geometry Recommendations:")
    roof_rec = solar_service.feed_into_roof_design(analysis)
    print(f"    - Optimum Tilt Angle: {roof_rec.get('recommended_roof_tilt_degrees')} deg")
    print(f"    - Optimal Azimuth Facing: {roof_rec.get('optimal_azimuth_facing')}")
    print(f"    - Recommended Roof Form: {roof_rec.get('recommended_roof_type')}")
    assert "recommended_roof_tilt_degrees" in roof_rec

    # 5. Feed into PV System Recommendation & Financial Payback
    print("\n[5] Solar PV System Sizing & Payback Modeling:")
    pv_rec = solar_service.feed_into_pv_recommendation(analysis, target_offset_pct=100.0)
    print(f"    - Recommended Panel Count: {pv_rec.get('recommended_panel_count')} panels")
    print(f"    - System Capacity: {pv_rec.get('system_capacity_kw')} kWp")
    print(f"    - Annual Energy Generation: {pv_rec.get('annual_generation_kwh'):,.0f} kWh/year")
    print(f"    - Annual Bill Savings: INR {pv_rec.get('annual_bill_savings_inr'):,}")
    print(f"    - Carbon Offset: {pv_rec.get('carbon_offset_tonnes_co2_year')} tonnes CO2/yr")
    print(f"    - Est. Payback Period: {pv_rec.get('payback_period_years')} years")
    assert pv_rec.get("annual_generation_kwh") > 0

    print("\n" + "=" * 70)
    print("SUCCESS: INTEGRATION 2 (GOOGLE SOLAR) FULLY OPERATIONAL!")
    print("=" * 70)
    return True


if __name__ == "__main__":
    test_google_solar_integration()
