"""
ArchAI Studio v3 - 9-Dimension Multi-Objective Fitness Evaluation
Evaluates:
1. Minimize construction cost
2. Maximize usable area
3. Maximize daylight
4. Maximize ventilation
5. Minimize circulation
6. Minimize solar heat gain
7. Maximize structural efficiency
8. Minimize material waste
9. Maximize user preference score
"""

from typing import Dict, Any, List, Tuple
import math
import shapely.geometry as sg
from packages.compliance.python.constraint_engine import ConstraintEngine


def evaluate_9_objectives(building_model: Dict[str, Any]) -> Dict[str, float]:
    """
    Evaluates the 9 exact objective dimensions for NSGA-II multi-objective optimization.
    Returns normalized raw/scaled objective metrics.
    """
    spaces = building_model.get("spaces", [])
    walls = building_model.get("walls", [])
    windows = building_model.get("windows", [])
    columns = building_model.get("columns", [])
    site = building_model.get("site", {})

    total_carpet = sum(s.get("area_sqft", 0.0) for s in spaces)
    if total_carpet == 0.0:
        total_carpet = 1200.0

    # 1. Construction Cost (Minimize - lower is better)
    # Approx base civil + openings + MEP
    wall_len = sum(math.hypot(
        w.get("end_point", {}).get("x", 0) - w.get("start_point", {}).get("x", 0),
        w.get("end_point", {}).get("y", 0) - w.get("start_point", {}).get("y", 0)
    ) for w in walls)
    if wall_len == 0.0:
        wall_len = 240.0
    construction_cost = round(total_carpet * 2200.0 + wall_len * 1500.0 + len(windows) * 18000.0, 2)

    # 2. Usable Area (Maximize - higher is better)
    usable_area = round(total_carpet, 2)

    # 3. Daylight Score (Maximize: 0.0 to 1.0)
    window_area = sum(win.get("width_ft", 4.0) * win.get("height_ft", 4.0) for win in windows)
    glazing_ratio = window_area / max(1.0, total_carpet)
    daylight_score = round(min(1.0, glazing_ratio / 0.15), 3)

    # 4. Ventilation Score (Maximize: 0.0 to 1.0)
    # Cross-ventilation potential based on room perimeter exposure
    ventilation_score = round(min(1.0, 0.70 + (len(windows) / max(1, len(spaces))) * 0.15), 3)

    # 5. Circulation Area (Minimize: ratio of corridors/foyers to total area)
    circ_area = sum(s.get("area_sqft", 0.0) for s in spaces if any(k in str(s.get("type", "")).lower() for k in ["corridor", "foyer", "stair"]))
    circulation_ratio = round(circ_area / max(1.0, total_carpet), 3)

    # 6. Solar Heat Gain (Minimize - lower is better: 0.0 to 1.0)
    # East/West facing windows have higher SHGC penalty
    shgc_penalty = 0.35 * (len([w for w in windows if "east" in str(w.get("id", "")).lower() or "west" in str(w.get("id", "")).lower()]) / max(1, len(windows)))
    solar_heat_gain_score = round(shgc_penalty, 3)

    # 7. Structural Efficiency (Maximize: 0.0 to 1.0)
    # Evaluates orthogonal alignment of structural column grid
    col_pts = [c.get("position", {}) for c in columns]
    xs = set(round(p.get("x", 0.0), 1) for p in col_pts)
    ys = set(round(p.get("y", 0.0), 1) for p in col_pts)
    structural_efficiency = round(max(0.60, min(1.0, 1.0 - (len(xs) + len(ys) - 6) * 0.05)), 3)

    # 8. Material Waste (Minimize: 0.0 to 1.0)
    # Layout compactness and regularity minimizes scrap cutoffs
    compactness = (4 * math.pi * total_carpet) / max(1.0, (wall_len ** 2))
    material_waste_score = round(max(0.05, min(0.30, 0.25 - compactness * 0.10)), 3)

    # 9. User Preference Score (Maximize: 0.0 to 1.0)
    target_match = 1.0
    for s in spaces:
        tgt = s.get("target_area_sqft")
        if tgt and tgt > 0:
            diff = abs(s.get("area_sqft", tgt) - tgt) / tgt
            target_match -= diff * 0.05
    user_preference_score = round(max(0.50, min(1.0, target_match)), 3)

    # Evaluate Constraints using dedicated ConstraintEngine
    constraint_eng = ConstraintEngine(building_model)
    val_res = constraint_eng.validate_all()
    compliance_score = round(1.0 - (val_res["error_count"] * 0.20 + val_res["warning_count"] * 0.05), 3)
    compliance_score = max(0.0, min(1.0, compliance_score))

    return {
        "cost": construction_cost,
        "area": usable_area,
        "daylight_score": daylight_score,
        "ventilation_score": ventilation_score,
        "circulation_ratio": circulation_ratio,
        "solar_heat_gain": solar_heat_gain_score,
        "structural_efficiency": structural_efficiency,
        "material_waste": material_waste_score,
        "user_preference": user_preference_score,
        "compliance": compliance_score,
        "constraint_violations": val_res["error_count"]
    }


def evaluate_building_fitness(building_model: Dict[str, Any]) -> Dict[str, Any]:
    """Compatibility helper returning composite score and 9 objectives."""
    objs = evaluate_9_objectives(building_model)
    composite = round(
        objs["user_preference"] * 25 +
        objs["daylight_score"] * 20 +
        objs["ventilation_score"] * 15 +
        objs["structural_efficiency"] * 15 +
        objs["compliance"] * 25,
        1
    )
    return {
        "overall_score": composite,
        "space_score": round(objs["user_preference"] * 100, 1),
        "daylight_score": round(objs["daylight_score"] * 100, 1),
        "ventilation_score": round(objs["ventilation_score"] * 100, 1),
        "structural_score": round(objs["structural_efficiency"] * 100, 1),
        "cost_inr": objs["cost"],
        "compliance_score": round(objs["compliance"] * 100, 1),
        "raw_objectives": objs
    }
