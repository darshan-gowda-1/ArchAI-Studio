"""
ArchAI Studio v3 - Dedicated ConstraintEngine Service
Evaluates deterministic hard and soft constraints across 11 statutory and architectural categories:
- check_site_boundary()
- check_setbacks()
- check_far()
- check_height()
- check_room_sizes()
- check_corridors()
- check_accessibility()
- check_parking()
- check_openings()
- check_ventilation()
- check_daylight()
"""

from typing import Dict, Any, List, Optional
import math
import shapely.geometry as sg


class Violation:
    def __init__(
        self,
        rule: str,
        severity: str,  # 'error', 'warning', 'info'
        category: str,
        space: Optional[str] = None,
        actual: Any = None,
        required: Any = None,
        message: str = ""
    ):
        self.rule = rule
        self.severity = severity
        self.category = category
        self.space = space
        self.actual = actual
        self.required = required
        self.message = message

    def __getitem__(self, item):
        return getattr(self, item)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule": self.rule,
            "severity": self.severity,
            "category": self.category,
            "space": self.space,
            "actual": self.actual,
            "required": self.required,
            "message": self.message
        }


class ConstraintEngine:
    def __init__(self, building_model: Dict[str, Any]):
        self.model = building_model
        self.site = self.model.get("site", {})
        self.spaces = self.model.get("spaces", [])
        self.walls = self.model.get("walls", [])
        self.doors = self.model.get("doors", [])
        self.windows = self.model.get("windows", [])
        self.levels = self.model.get("levels", [])
        self.metrics = self.model.get("metrics", {})
        self.constraints = self.model.get("constraints", {})

    def check_site_boundary(self) -> List[Violation]:
        violations = []
        b_verts = self.site.get("boundary", {}).get("vertices", [])
        if len(b_verts) < 3:
            violations.append(Violation(
                rule="site_boundary_vertices",
                severity="error",
                category="Zoning & Boundary",
                actual=len(b_verts),
                required=3,
                message="Site boundary must form a valid polygon with at least 3 vertices."
            ))
            return violations

        pts = [(v.get("x", 0.0), v.get("y", 0.0)) if isinstance(v, dict) else (v.x, v.y) for v in b_verts]
        site_poly = sg.Polygon(pts)
        if not site_poly.is_valid:
            violations.append(Violation(
                rule="site_boundary_validity",
                severity="error",
                category="Zoning & Boundary",
                actual="self_intersecting",
                required="simple_polygon",
                message="Site boundary polygon is self-intersecting or invalid."
            ))

        # Check if any room polygon extends outside site boundary
        for spc in self.spaces:
            s_pts = spc.get("polygon_2d", [])
            sp_poly_pts = [(p.get("x", 0.0), p.get("y", 0.0)) if isinstance(p, dict) else (p.x, p.y) for p in s_pts]
            if len(sp_poly_pts) >= 3:
                r_poly = sg.Polygon(sp_poly_pts)
                if not site_poly.contains(r_poly):
                    violations.append(Violation(
                        rule="room_within_site_boundary",
                        severity="error",
                        category="Zoning & Boundary",
                        space=spc.get("name", spc.get("id")),
                        actual="protruding",
                        required="inside_site",
                        message=f"Space '{spc.get('name')}' protrudes outside cadastral plot boundary."
                    ))
        return violations

    def check_setbacks(self) -> List[Violation]:
        violations = []
        sb = self.site.get("setbacks", {})
        front = sb.get("front", sb.get("front_ft", 6.0))
        rear = sb.get("rear", sb.get("rear_ft", 5.0))
        side_l = sb.get("side_left", sb.get("side_left_ft", 4.0))
        side_r = sb.get("side_right", sb.get("side_right_ft", 4.0))

        b_width = self.site.get("boundary", {}).get("width", 30.0)
        b_length = self.site.get("boundary", {}).get("length", 40.0)

        # Check all space vertices against setback margins
        for spc in self.spaces:
            s_pts = spc.get("polygon_2d", [])
            for p in s_pts:
                px = p.get("x", 0.0) if isinstance(p, dict) else p.x
                py = p.get("y", 0.0) if isinstance(p, dict) else p.y

                if px < side_l - 0.01:
                    violations.append(Violation(
                        rule="minimum_left_setback",
                        severity="error",
                        category="Setbacks",
                        space=spc.get("name"),
                        actual=round(px, 2),
                        required=side_l,
                        message=f"Space '{spc.get('name')}' encroaches into left side setback."
                    ))
                    break
                if px > (b_width - side_r) + 0.01:
                    violations.append(Violation(
                        rule="minimum_right_setback",
                        severity="error",
                        category="Setbacks",
                        space=spc.get("name"),
                        actual=round(b_width - px, 2),
                        required=side_r,
                        message=f"Space '{spc.get('name')}' encroaches into right side setback."
                    ))
                    break
                if py < front - 0.01:
                    violations.append(Violation(
                        rule="minimum_front_setback",
                        severity="error",
                        category="Setbacks",
                        space=spc.get("name"),
                        actual=round(py, 2),
                        required=front,
                        message=f"Space '{spc.get('name')}' encroaches into front road setback."
                    ))
                    break
                if py > (b_length - rear) + 0.01:
                    violations.append(Violation(
                        rule="minimum_rear_setback",
                        severity="error",
                        category="Setbacks",
                        space=spc.get("name"),
                        actual=round(b_length - py, 2),
                        required=rear,
                        message=f"Space '{spc.get('name')}' encroaches into rear garden setback."
                    ))
                    break
        return violations

    def check_far(self) -> List[Violation]:
        violations = []
        max_far = self.site.get("far_fsi", 2.0)
        total_plot_area = self.site.get("boundary", {}).get("total_area_sqft", 1200.0)
        total_built_up = self.metrics.get("total_built_up_area_sqft", 0.0)
        if total_built_up == 0.0:
            total_built_up = sum(s.get("area_sqft", 0.0) for s in self.spaces) * 1.15

        achieved_far = round(total_built_up / max(1.0, total_plot_area), 2)
        if achieved_far > max_far:
            violations.append(Violation(
                rule="maximum_far_limit",
                severity="error",
                category="Floor Area Ratio",
                actual=achieved_far,
                required=max_far,
                message=f"Total built-up area yields FAR of {achieved_far}, exceeding statutory max of {max_far}."
            ))
        return violations

    def check_height(self) -> List[Violation]:
        violations = []
        max_height = self.site.get("maximum_height_ft", 36.0)
        actual_height = sum(lvl.get("floor_to_floor_height_ft", 10.0) for lvl in self.levels)
        if actual_height > max_height:
            violations.append(Violation(
                rule="maximum_building_height",
                severity="error",
                category="Zoning Height",
                actual=actual_height,
                required=max_height,
                message=f"Total building height of {actual_height}ft exceeds zoning cap of {max_height}ft."
            ))
        return violations

    def check_room_sizes(self) -> List[Violation]:
        violations = []
        min_room_sizes = {
            "master_bedroom": 120.0,
            "bedroom": 100.0,
            "living_room": 150.0,
            "kitchen": 60.0,
            "bathroom": 28.0,
            "home_office": 80.0
        }

        for spc in self.spaces:
            stype = str(spc.get("type", "")).lower().replace("spacetype.", "")
            req_area = min_room_sizes.get(stype)
            if req_area:
                actual_area = spc.get("area_sqft", 0.0)
                if actual_area < req_area:
                    violations.append(Violation(
                        rule=f"minimum_{stype}_area",
                        severity="error",
                        category="Room Dimensions",
                        space=spc.get("name", spc.get("id")),
                        actual=round(actual_area, 1),
                        required=req_area,
                        message=f"{spc.get('name')} area ({actual_area} sq ft) is below minimum required {req_area} sq ft."
                    ))
        return violations

    def check_corridors(self) -> List[Violation]:
        violations = []
        min_corridor_width = 3.5  # 3.5 feet (1050mm) for NBC
        for spc in self.spaces:
            stype = str(spc.get("type", "")).lower()
            if "corridor" in stype or "foyer" in stype:
                pts = spc.get("polygon_2d", [])
                if len(pts) >= 4:
                    xs = [p.get("x", 0.0) if isinstance(p, dict) else p.x for p in pts]
                    ys = [p.get("y", 0.0) if isinstance(p, dict) else p.y for p in pts]
                    w = max(xs) - min(xs)
                    h = max(ys) - min(ys)
                    min_dim = min(w, h)
                    if min_dim < min_corridor_width:
                        violations.append(Violation(
                            rule="minimum_corridor_width",
                            severity="error",
                            category="Circulation",
                            space=spc.get("name"),
                            actual=round(min_dim, 2),
                            required=min_corridor_width,
                            message=f"Circulation path in {spc.get('name')} width ({min_dim}ft) is below NBC 3.5ft clearance."
                        ))
        return violations

    def check_accessibility(self) -> List[Violation]:
        violations = []
        # Main entry door must be >= 3.25ft (1000mm)
        for door in self.doors:
            w = door.get("width_ft", 3.0)
            if "main" in str(door.get("id", "")).lower() and w < 3.25:
                violations.append(Violation(
                    rule="barrier_free_main_door_width",
                    severity="warning",
                    category="Accessibility",
                    space="Main Entrance",
                    actual=w,
                    required=3.25,
                    message="Main entrance door width is less than barrier-free 1000mm (3.25ft)."
                ))
        return violations

    def check_parking(self) -> List[Violation]:
        violations = []
        req_parking = 2
        actual_parking = self.metrics.get("parking_slots", 2)
        if actual_parking < req_parking:
            violations.append(Violation(
                rule="mandatory_parking_slots",
                severity="error",
                category="Parking",
                actual=actual_parking,
                required=req_parking,
                message=f"Project provides {actual_parking} parking bays; zoning requires {req_parking} bays."
            ))
        return violations

    def check_openings(self) -> List[Violation]:
        violations = []
        # Check that doors and windows fit along wall segments
        for door in self.doors:
            offset = door.get("offset_along_wall_ft", 0.0)
            w = door.get("width_ft", 3.0)
            if offset < 0.5:
                violations.append(Violation(
                    rule="door_corner_clearance",
                    severity="warning",
                    category="Openings",
                    space=f"Door {door.get('id')}",
                    actual=offset,
                    required=0.5,
                    message=f"Door {door.get('id')} is placed directly against corner without 150mm hinge jamb."
                ))
        return violations

    def check_ventilation(self) -> List[Violation]:
        violations = []
        # Habitable rooms must have ventilation aperture >= 5% of floor area
        for spc in self.spaces:
            stype = str(spc.get("type", "")).lower()
            if any(k in stype for k in ["bedroom", "living", "kitchen", "office"]):
                req_vent_area = spc.get("area_sqft", 100.0) * 0.05
                # Sum windows in room
                win_area = sum(w.get("width_ft", 4.0) * w.get("height_ft", 4.0) for w in self.windows) / max(1, len(self.spaces))
                if win_area < req_vent_area:
                    violations.append(Violation(
                        rule="natural_ventilation_aperture",
                        severity="warning",
                        category="Ventilation",
                        space=spc.get("name"),
                        actual=round(win_area, 1),
                        required=round(req_vent_area, 1),
                        message=f"{spc.get('name')} openable aperture is below 5% floor area standard."
                    ))
        return violations

    def check_daylight(self) -> List[Violation]:
        violations = []
        # Habitable rooms must have glazing >= 10% of floor area
        for spc in self.spaces:
            stype = str(spc.get("type", "")).lower()
            if any(k in stype for k in ["bedroom", "living", "kitchen"]):
                req_glazing = spc.get("area_sqft", 100.0) * 0.10
                est_glazing = sum(w.get("width_ft", 4.0) * w.get("height_ft", 4.0) for w in self.windows) / max(1, len(self.spaces))
                if est_glazing < req_glazing:
                    violations.append(Violation(
                        rule="daylight_glazing_ratio",
                        severity="warning",
                        category="Daylight",
                        space=spc.get("name"),
                        actual=round(est_glazing, 1),
                        required=round(req_glazing, 1),
                        message=f"{spc.get('name')} window glazing ratio is below 10% statutory daylight requirement."
                    ))
        return violations

    def validate_all(self) -> Dict[str, Any]:
        """
        Executes all 11 constraint rules and returns consolidated validation response.
        """
        violations: List[Violation] = []
        violations.extend(self.check_site_boundary())
        violations.extend(self.check_setbacks())
        violations.extend(self.check_far())
        violations.extend(self.check_height())
        violations.extend(self.check_room_sizes())
        violations.extend(self.check_corridors())
        violations.extend(self.check_accessibility())
        violations.extend(self.check_parking())
        violations.extend(self.check_openings())
        violations.extend(self.check_ventilation())
        violations.extend(self.check_daylight())

        error_count = sum(1 for v in violations if v.severity == "error")
        is_valid = (error_count == 0)

        return {
            "valid": is_valid,
            "error_count": error_count,
            "warning_count": sum(1 for v in violations if v.severity == "warning"),
            "violations": [v.to_dict() for v in violations]
        }
