"""
ArchAI Studio v3 - Conversational Architectural Redesign Engine
Handles follow-up natural-language constraints (e.g. "Make the kitchen larger but don't increase budget").
"""

from typing import Dict, Any, List
import copy


class ConversationalRedesignEngine:
    """
    Applies constrained delta mutations to a canonical BuildingModel.
    """

    def apply_directive(self, building_model_dict: Dict[str, Any], directive: str) -> Dict[str, Any]:
        updated = copy.deepcopy(building_model_dict)
        directive_lower = directive.lower()

        spaces = updated.get("spaces", [])

        # Example directive: "Make the kitchen larger"
        if "kitchen" in directive_lower and ("larger" in directive_lower or "bigger" in directive_lower or "expand" in directive_lower):
            for s in spaces:
                if s.get("type") == "kitchen":
                    s["area_sqft"] = round(s.get("area_sqft", 120.0) + 25.0, 1)
                    s["target_area_sqft"] = s["area_sqft"]
                elif s.get("type") == "foyer" or s.get("type") == "utility":
                    # Compensate to keep footprint / budget neutral
                    s["area_sqft"] = max(25.0, round(s.get("area_sqft", 50.0) - 15.0, 1))

        # Example directive: "Add another bedroom"
        elif "bedroom" in directive_lower and ("add" in directive_lower or "extra" in directive_lower or "another" in directive_lower):
            new_bed = {
                "id": f"spc_bed_extra_{len(spaces)+1}",
                "name": "Guest Bedroom (Garden Side)",
                "type": "bedroom",
                "level_index": 1,
                "polygon_2d": [
                    {"x": 15, "y": 22},
                    {"x": 26, "y": 22},
                    {"x": 26, "y": 35},
                    {"x": 15, "y": 35}
                ],
                "area_sqft": 140.0,
                "ceiling_height_ft": 9.5,
                "finishes": {
                    "flooring_material": "Vitrified Tiles",
                    "wall_finish": "Low VOC Matte",
                    "ceiling_finish": "Gypsum Board",
                    "skirting_height_inches": 4.0
                },
                "requires_ventilation": True,
                "daylight_factor_target": 2.5,
                "furniture_ids": []
            }
            spaces.append(new_bed)

        # Recompute metrics
        total_carpet = sum(s.get("area_sqft", 0.0) for s in spaces)
        metrics = updated.get("metrics", {})
        metrics["carpet_area_sqft"] = total_carpet
        metrics["total_built_up_area_sqft"] = round(total_carpet * 1.15, 1)

        updated["metadata"]["lastDirectiveApplied"] = directive

        return updated
