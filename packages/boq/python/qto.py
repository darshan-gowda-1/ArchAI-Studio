"""
ArchAI Studio v3 - Comprehensive BOQ & Parametric Quantity Takeoff (QTO) Engine
Calculates 16-category itemized cost estimate:
1. Earthwork
2. Foundation
3. Concrete
4. Reinforcement Steel
5. Brick / Block Masonry
6. Plaster
7. Flooring
8. Doors
9. Windows
10. Roof & Waterproofing
11. Painting & Wall Finishes
12. Electrical & Solar
13. Plumbing & Sanitation
14. HVAC
15. Landscape
16. Furniture & Millwork
"""

from typing import Dict, Any, List, Optional
import math


# Default Schedule of Rates (SOR) - Configurable from DB / Region
DEFAULT_RATES_INR = {
    "earthwork_excavation_m3": 450.0,
    "rcc_foundation_m3": 8200.0,
    "rcc_structural_m3": 7500.0,
    "fe550_tmt_rebar_kg": 72.0,
    "aac_block_masonry_m3": 3800.0,
    "cement_sand_plaster_m2": 280.0,
    "vitrified_tile_flooring_m2": 1450.0,
    "flush_door_veneer_ea": 12500.0,
    "upvc_double_glazed_window_m2": 6200.0,
    "terrace_waterproofing_m2": 850.0,
    "premium_emulsion_paint_m2": 240.0,
    "mep_electrical_point_ea": 850.0,
    "mep_plumbing_fixture_lot": 45000.0,
    "hvac_ductless_split_tr": 42000.0,
    "hardscape_landscape_m2": 950.0,
    "interior_furniture_fixed_lot": 150000.0
}


def calculate_building_boq(
    building_model: Dict[str, Any],
    custom_rates: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Building Model -> Quantity Takeoff -> BOQ -> Cost Engine
    Computes all 16 categories and outputs standardized BOQ schema.
    """
    rates = {**DEFAULT_RATES_INR, **(custom_rates or {})}

    spaces = building_model.get("spaces", [])
    walls = building_model.get("walls", [])
    doors = building_model.get("doors", [])
    windows = building_model.get("windows", [])
    slabs = building_model.get("slabs", [])
    columns = building_model.get("columns", [])
    site = building_model.get("site", {})

    # Geometric metrics
    carpet_sqft = sum(s.get("area_sqft", 0.0) for s in spaces)
    if carpet_sqft == 0.0:
        carpet_sqft = 1200.0
    carpet_sqm = carpet_sqft * 0.092903

    ground_cov_sqft = sum(s.get("area_sqft", 0.0) for s in spaces if s.get("level_index", 0) == 0)
    ground_cov_sqm = (ground_cov_sqft or carpet_sqft * 0.6) * 0.092903

    # Total wall length (meters)
    total_wall_len_m = sum(math.hypot(
        (w.get("end_point", {}).get("x", 0) - w.get("start_point", {}).get("x", 0)) * 0.3048,
        (w.get("end_point", {}).get("y", 0) - w.get("start_point", {}).get("y", 0)) * 0.3048
    ) for w in walls)
    if total_wall_len_m == 0.0:
        total_wall_len_m = 75.0

    wall_height_m = 3.0
    gross_wall_area_m2 = total_wall_len_m * wall_height_m

    # Openings areas
    window_area_m2 = sum((win.get("width_ft", 4.0) * 0.3048) * (win.get("height_ft", 4.0) * 0.3048) for win in windows)
    door_count = max(len(doors), 4)

    net_wall_area_m2 = max(10.0, gross_wall_area_m2 - window_area_m2 - (door_count * 1.8))
    masonry_vol_m3 = net_wall_area_m2 * 0.23

    # 16 Categories Calculation
    qto_items: List[Dict[str, Any]] = []

    # 1. Earthwork
    earthwork_m3 = round(ground_cov_sqm * 1.5, 1)
    qto_items.append({
        "category": "earthwork",
        "item_description": "Site excavation and foundation trenching",
        "quantity": earthwork_m3,
        "unit": "m3",
        "rate": rates["earthwork_excavation_m3"],
        "amount": round(earthwork_m3 * rates["earthwork_excavation_m3"], 2)
    })

    # 2. Foundation
    foundation_m3 = round(ground_cov_sqm * 0.35, 1)
    qto_items.append({
        "category": "foundation",
        "item_description": "RCC Isolated footings & plinth beams M25",
        "quantity": foundation_m3,
        "unit": "m3",
        "rate": rates["rcc_foundation_m3"],
        "amount": round(foundation_m3 * rates["rcc_foundation_m3"], 2)
    })

    # 3. Concrete (Superstructure)
    slab_vol_m3 = len(slabs) * (ground_cov_sqm * 0.15)
    col_vol_m3 = len(columns) * (0.23 * 0.38 * 3.0)
    concrete_m3 = round(max(35.0, slab_vol_m3 + col_vol_m3), 1)
    qto_items.append({
        "category": "concrete",
        "item_description": "Superstructure RCC slabs, beams & columns M25",
        "quantity": concrete_m3,
        "unit": "m3",
        "rate": rates["rcc_structural_m3"],
        "amount": round(concrete_m3 * rates["rcc_structural_m3"], 2)
    })

    # 4. Reinforcement Steel
    rebar_kg = round((foundation_m3 + concrete_m3) * 95.0, 1)
    qto_items.append({
        "category": "reinforcement",
        "item_description": "Fe550D TMT High-Yield Reinforcement Bars",
        "quantity": rebar_kg,
        "unit": "kg",
        "rate": rates["fe550_tmt_rebar_kg"],
        "amount": round(rebar_kg * rates["fe550_tmt_rebar_kg"], 2)
    })

    # 5. Brick / Block Masonry
    masonry_qty = round(masonry_vol_m3, 1)
    qto_items.append({
        "category": "brick_block",
        "item_description": "230mm AAC Block Masonry with Thinbed Mortar",
        "quantity": masonry_qty,
        "unit": "m3",
        "rate": rates["aac_block_masonry_m3"],
        "amount": round(masonry_qty * rates["aac_block_masonry_m3"], 2)
    })

    # 6. Plaster
    plaster_m2 = round(net_wall_area_m2 * 2.0, 1)
    qto_items.append({
        "category": "plaster",
        "item_description": "12mm Internal & 20mm Sand Face External Plaster",
        "quantity": plaster_m2,
        "unit": "m2",
        "rate": rates["cement_sand_plaster_m2"],
        "amount": round(plaster_m2 * rates["cement_sand_plaster_m2"], 2)
    })

    # 7. Flooring
    flooring_m2 = round(carpet_sqm, 1)
    qto_items.append({
        "category": "flooring",
        "item_description": "800x800mm Glazed Vitrified Tiles with Italian Border",
        "quantity": flooring_m2,
        "unit": "m2",
        "rate": rates["vitrified_tile_flooring_m2"],
        "amount": round(flooring_m2 * rates["vitrified_tile_flooring_m2"], 2)
    })

    # 8. Doors
    qto_items.append({
        "category": "doors",
        "item_description": "35mm Flush Doors with Natural Teak Veneer & SS Hardware",
        "quantity": door_count,
        "unit": "nos",
        "rate": rates["flush_door_veneer_ea"],
        "amount": round(door_count * rates["flush_door_veneer_ea"], 2)
    })

    # 9. Windows
    win_m2 = round(max(15.0, window_area_m2), 1)
    qto_items.append({
        "category": "windows",
        "item_description": "UPVC 3-Track Sliding Windows with Low-E DGU",
        "quantity": win_m2,
        "unit": "m2",
        "rate": rates["upvc_double_glazed_window_m2"],
        "amount": round(win_m2 * rates["upvc_double_glazed_window_m2"], 2)
    })

    # 10. Roof & Waterproofing
    roof_m2 = round(ground_cov_sqm * 1.1, 1)
    qto_items.append({
        "category": "roof",
        "item_description": "APP Modified Bituminous Membrane & Brickbat Coba",
        "quantity": roof_m2,
        "unit": "m2",
        "rate": rates["terrace_waterproofing_m2"],
        "amount": round(roof_m2 * rates["terrace_waterproofing_m2"], 2)
    })

    # 11. Painting
    paint_m2 = round(plaster_m2 + carpet_sqm, 1)
    qto_items.append({
        "category": "painting",
        "item_description": "Premium Acrylic Emulsion 3-Coat Paint with Primer",
        "quantity": paint_m2,
        "unit": "m2",
        "rate": rates["premium_emulsion_paint_m2"],
        "amount": round(paint_m2 * rates["premium_emulsion_paint_m2"], 2)
    })

    # 12. Electrical
    elec_points = max(60, len(spaces) * 12)
    qto_items.append({
        "category": "electrical",
        "item_description": "Concealed FR-LSH Copper Wiring & Modular Switches",
        "quantity": elec_points,
        "unit": "points",
        "rate": rates["mep_electrical_point_ea"],
        "amount": round(elec_points * rates["mep_electrical_point_ea"], 2)
    })

    # 13. Plumbing
    qto_items.append({
        "category": "plumbing",
        "item_description": "CPVC/UPVC Piping, Overhead Tank & Premium Sanitaryware",
        "quantity": 1,
        "unit": "lot",
        "rate": rates["mep_plumbing_fixture_lot"],
        "amount": round(rates["mep_plumbing_fixture_lot"], 2)
    })

    # 14. HVAC
    tonnage = 5.5
    qto_items.append({
        "category": "HVAC",
        "item_description": "Inverter Variable Speed Ductless Split Air Conditioning",
        "quantity": tonnage,
        "unit": "TR",
        "rate": rates["hvac_ductless_split_tr"],
        "amount": round(tonnage * rates["hvac_ductless_split_tr"], 2)
    })

    # 15. Landscape
    plot_area_sqm = site.get("boundary", {}).get("total_area_sqft", 1200.0) * 0.092903
    unbuilt_m2 = round(max(20.0, plot_area_sqm - ground_cov_sqm), 1)
    qto_items.append({
        "category": "landscape",
        "item_description": "Permeable Paver Driveway & Native Garden Landscaping",
        "quantity": unbuilt_m2,
        "unit": "m2",
        "rate": rates["hardscape_landscape_m2"],
        "amount": round(unbuilt_m2 * rates["hardscape_landscape_m2"], 2)
    })

    # 16. Furniture
    qto_items.append({
        "category": "furniture",
        "item_description": "Modular Kitchen Cabinets & Master Bedroom Wardrobes",
        "quantity": 1,
        "unit": "lot",
        "rate": rates["interior_furniture_fixed_lot"],
        "amount": round(rates["interior_furniture_fixed_lot"], 2)
    })

    total_cost = sum(item["amount"] for item in qto_items)
    rate_per_sqft = round(total_cost / max(1.0, carpet_sqft), 2)

    cat_map = {item["category"]: item for item in qto_items}

    # Grouped breakdown helper
    breakdown = {
        "substructure": {
            "total_inr": cat_map["earthwork"]["amount"] + cat_map["foundation"]["amount"],
            "items": [cat_map["earthwork"], cat_map["foundation"]]
        },
        "superstructure": {
            "total_inr": cat_map["concrete"]["amount"] + cat_map["reinforcement"]["amount"] + cat_map["brick_block"]["amount"],
            "items": [cat_map["concrete"], cat_map["reinforcement"], cat_map["brick_block"]]
        },
        "finishes": {
            "total_inr": cat_map["plaster"]["amount"] + cat_map["flooring"]["amount"] + cat_map["doors"]["amount"] + cat_map["windows"]["amount"] + cat_map["painting"]["amount"],
            "items": [cat_map["plaster"], cat_map["flooring"], cat_map["doors"], cat_map["windows"], cat_map["painting"]]
        },
        "services_mep": {
            "total_inr": cat_map["electrical"]["amount"] + cat_map["plumbing"]["amount"] + cat_map["HVAC"]["amount"],
            "items": [cat_map["electrical"], cat_map["plumbing"], cat_map["HVAC"]]
        },
        "external_works": {
            "total_inr": cat_map["roof"]["amount"] + cat_map["landscape"]["amount"],
            "items": [cat_map["roof"], cat_map["landscape"]]
        },
        "interiors": {
            "total_inr": cat_map["furniture"]["amount"],
            "items": [cat_map["furniture"]]
        }
    }

    return {
        "total_cost": int(round(total_cost)),
        "grand_total_inr": int(round(total_cost)),
        "currency": "INR",
        "rate_per_sqft_inr": int(round(rate_per_sqft)),
        "items": qto_items,
        "categories": cat_map,
        "breakdown": breakdown
    }
