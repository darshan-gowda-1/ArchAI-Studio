"""
ArchAI Studio v3 - Parametric Building Geometry Compiler
Compiles canonical BuildingModel through standard 9-stage architectural pipeline:
site -> footprint -> rooms -> walls -> doors/windows -> floors -> roof -> structural elements -> architectural elements
"""

from typing import Dict, Any, List, Tuple, Optional
import shapely.geometry as sg
import shapely.ops as so
import math


class ParametricWall:
    def __init__(
        self,
        id: str,
        start: Tuple[float, float],
        end: Tuple[float, float],
        thickness: float = 230.0,
        height: float = 3000.0,
        material: str = "AAC Block Masonry",
        is_exterior: bool = False,
        level_index: int = 0
    ):
        self.id = id
        self.start = start
        self.end = end
        self.thickness = thickness
        self.height = height
        self.material = material
        self.is_exterior = is_exterior
        self.level_index = level_index

    @property
    def length(self) -> float:
        dx = self.end[0] - self.start[0]
        dy = self.end[1] - self.start[1]
        return math.sqrt(dx * dx + dy * dy)

    @property
    def direction(self) -> Tuple[float, float]:
        l = self.length
        if l == 0:
            return (1.0, 0.0)
        dx = (self.end[0] - self.start[0]) / l
        dy = (self.end[1] - self.start[1]) / l
        return (round(dx, 4), round(dy, 4))

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "start": list(self.start),
            "end": list(self.end),
            "thickness": self.thickness,
            "height": self.height,
            "material": self.material,
            "is_exterior": self.is_exterior,
            "level_index": self.level_index,
            "length": round(self.length, 2),
            "direction": list(self.direction)
        }


class ParametricDoor:
    def __init__(
        self,
        id: str,
        wall_id: str,
        offset_along_wall: float = 1000.0,
        width: float = 1000.0,
        height: float = 2100.0,
        door_style: str = "Teak Pivot Door",
        swing_direction: str = "inward_right"
    ):
        self.id = id
        self.wall_id = wall_id
        self.offset_along_wall = offset_along_wall
        self.width = width
        self.height = height
        self.door_style = door_style
        self.swing_direction = swing_direction

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "wall_id": self.wall_id,
            "offset_along_wall": self.offset_along_wall,
            "width": self.width,
            "height": self.height,
            "door_style": self.door_style,
            "swing_direction": self.swing_direction
        }


class ParametricWindow:
    def __init__(
        self,
        id: str,
        wall_id: str,
        offset_along_wall: float = 1500.0,
        width: float = 1500.0,
        height: float = 1200.0,
        sill_height: float = 900.0,
        glazing_type: str = "Double Glazed Low-E"
    ):
        self.id = id
        self.wall_id = wall_id
        self.offset_along_wall = offset_along_wall
        self.width = width
        self.height = height
        self.sill_height = sill_height
        self.glazing_type = glazing_type

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "wall_id": self.wall_id,
            "offset_along_wall": self.offset_along_wall,
            "width": self.width,
            "height": self.height,
            "sill_height": self.sill_height,
            "glazing_type": self.glazing_type
        }


class ParametricFloor:
    def __init__(
        self,
        id: str,
        level_index: int,
        elevation: float = 0.0,
        thickness: float = 150.0,
        boundary: List[Tuple[float, float]] = None,
        material: str = "Vitrified Tile on RCC Slab"
    ):
        self.id = id
        self.level_index = level_index
        self.elevation = elevation
        self.thickness = thickness
        self.boundary = boundary or []
        self.material = material

    @property
    def area(self) -> float:
        if len(self.boundary) < 3:
            return 0.0
        poly = sg.Polygon(self.boundary)
        return poly.area

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "level_index": self.level_index,
            "elevation": self.elevation,
            "thickness": self.thickness,
            "boundary": [list(p) for p in self.boundary],
            "material": self.material,
            "area": round(self.area, 2)
        }


class ParametricRoof:
    def __init__(
        self,
        id: str,
        roof_type: str = "flat_terrace",
        boundary: List[Tuple[float, float]] = None,
        elevation: float = 6000.0,
        pitch_slope_degrees: float = 1.5,
        parapet_height: float = 1050.0,
        solar_pv_panel_count: int = 14
    ):
        self.id = id
        self.roof_type = roof_type
        self.boundary = boundary or []
        self.elevation = elevation
        self.pitch_slope_degrees = pitch_slope_degrees
        self.parapet_height = parapet_height
        self.solar_pv_panel_count = solar_pv_panel_count

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "roof_type": self.roof_type,
            "boundary": [list(p) for p in self.boundary],
            "elevation": self.elevation,
            "pitch_slope_degrees": self.pitch_slope_degrees,
            "parapet_height": self.parapet_height,
            "solar_pv_panel_count": self.solar_pv_panel_count
        }


class ParametricColumn:
    def __init__(
        self,
        id: str,
        level_index: int,
        position: Tuple[float, float],
        width: float = 230.0,
        depth: float = 380.0,
        height: float = 3000.0,
        material: str = "M25 Reinforced Concrete"
    ):
        self.id = id
        self.level_index = level_index
        self.position = position
        self.width = width
        self.depth = depth
        self.height = height
        self.material = material

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "level_index": self.level_index,
            "position": list(self.position),
            "width": self.width,
            "depth": self.depth,
            "height": self.height,
            "material": self.material
        }


def compile_building(building_model: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parametric building geometry compiler:
    site -> footprint -> rooms -> walls -> doors/windows -> floors -> roof -> structural elements -> architectural elements
    """
    site_data = building_model.get("site", {})
    boundary_verts = site_data.get("boundary", {}).get("vertices", [])
    setbacks = site_data.get("setbacks", {})

    # 1. Site Polygon
    site_pts = []
    for v in boundary_verts:
        if isinstance(v, dict):
            site_pts.append((v.get("x", 0.0), v.get("y", 0.0)))
        elif hasattr(v, 'x') and hasattr(v, 'y'):
            site_pts.append((v.x, v.y))
        elif isinstance(v, (list, tuple)):
            site_pts.append((v[0], v[1]))

    site_poly = sg.Polygon(site_pts) if len(site_pts) >= 3 else sg.Polygon([(0, 0), (30, 0), (30, 40), (0, 40)])

    # 2. Footprint (Buildable envelope clipped by setbacks)
    front_sb = setbacks.get("front", setbacks.get("front_ft", 6.0))
    rear_sb = setbacks.get("rear", setbacks.get("rear_ft", 5.0))
    left_sb = setbacks.get("side_left", setbacks.get("side_left_ft", 4.0))
    right_sb = setbacks.get("side_right", setbacks.get("side_right_ft", 4.0))

    bounds = site_poly.bounds
    minx, miny, maxx, maxy = bounds
    bx1 = minx + left_sb
    by1 = miny + front_sb
    bx2 = max(bx1 + 5.0, maxx - right_sb)
    by2 = max(by1 + 5.0, maxy - rear_sb)
    footprint_poly = sg.box(bx1, by1, bx2, by2)

    # 3. Rooms
    spaces_data = building_model.get("spaces", [])
    compiled_rooms = []
    for s in spaces_data:
        spc_dict = s if isinstance(s, dict) else s.dict() if hasattr(s, 'dict') else {}
        poly_2d = spc_dict.get("polygon_2d", [])
        pts = [(p["x"], p["y"]) if isinstance(p, dict) else (p.x, p.y) if hasattr(p, 'x') else (p[0], p[1]) for p in poly_2d]
        compiled_rooms.append({
            "id": spc_dict.get("id"),
            "name": spc_dict.get("name"),
            "type": spc_dict.get("type"),
            "level_index": spc_dict.get("level_index", 0),
            "polygon": pts,
            "area": spc_dict.get("area_sqft", 0.0),
            "finishes": spc_dict.get("finishes", {})
        })

    # 4. Walls
    walls_data = building_model.get("walls", [])
    compiled_walls: List[ParametricWall] = []
    for idx, w in enumerate(walls_data):
        w_dict = w if isinstance(w, dict) else w.dict() if hasattr(w, 'dict') else {}
        sp = w_dict.get("start_point", {})
        ep = w_dict.get("end_point", {})
        s_coord = (sp.get("x", 0.0), sp.get("y", 0.0)) if isinstance(sp, dict) else (sp.x, sp.y) if hasattr(sp, 'x') else (0.0, 0.0)
        e_coord = (ep.get("x", 0.0), ep.get("y", 0.0)) if isinstance(ep, dict) else (ep.x, ep.y) if hasattr(ep, 'x') else (0.0, 0.0)

        wall_obj = ParametricWall(
            id=w_dict.get("id", f"wall_{idx}"),
            start=s_coord,
            end=e_coord,
            thickness=w_dict.get("thickness_inches", 9.0) * 25.4,
            height=w_dict.get("height_ft", 10.0) * 304.8,
            material=w_dict.get("material", "AAC Block Masonry"),
            is_exterior=w_dict.get("is_exterior", False),
            level_index=w_dict.get("level_index", 0)
        )
        compiled_walls.append(wall_obj)

    # 5. Doors & Windows
    doors_data = building_model.get("doors", [])
    windows_data = building_model.get("windows", [])
    compiled_doors = []
    for d in doors_data:
        d_dict = d if isinstance(d, dict) else d.dict() if hasattr(d, 'dict') else {}
        door_obj = ParametricDoor(
            id=d_dict.get("id", "door"),
            wall_id=d_dict.get("wall_id", ""),
            offset_along_wall=d_dict.get("offset_along_wall_ft", 3.0) * 304.8,
            width=d_dict.get("width_ft", 3.25) * 304.8,
            height=d_dict.get("height_ft", 7.0) * 304.8,
            door_style=d_dict.get("door_style", "Flush Door"),
            swing_direction=d_dict.get("swing_direction", "inward_right")
        )
        compiled_doors.append(door_obj)

    compiled_windows = []
    for win in windows_data:
        win_dict = win if isinstance(win, dict) else win.dict() if hasattr(win, 'dict') else {}
        win_obj = ParametricWindow(
            id=win_dict.get("id", "win"),
            wall_id=win_dict.get("wall_id", ""),
            offset_along_wall=win_dict.get("offset_along_wall_ft", 4.0) * 304.8,
            width=win_dict.get("width_ft", 5.0) * 304.8,
            height=win_dict.get("height_ft", 4.5) * 304.8,
            sill_height=win_dict.get("sill_height_ft", 3.0) * 304.8,
            glazing_type=win_dict.get("glazing_type", "6mm Double Glazed Low-E")
        )
        compiled_windows.append(win_obj)

    # 6. Floors / Slabs
    slabs_data = building_model.get("slabs", [])
    compiled_floors = []
    for idx, sl in enumerate(slabs_data):
        sl_dict = sl if isinstance(sl, dict) else sl.dict() if hasattr(sl, 'dict') else {}
        b_pts = sl_dict.get("boundary", [])
        pts = [(p["x"], p["y"]) if isinstance(p, dict) else (p.x, p.y) if hasattr(p, 'x') else (p[0], p[1]) for p in b_pts]
        floor_obj = ParametricFloor(
            id=sl_dict.get("id", f"slab_{idx}"),
            level_index=sl_dict.get("level_index", 0),
            elevation=sl_dict.get("elevation_ft", 0.0) * 304.8,
            thickness=sl_dict.get("thickness_inches", 6.0) * 25.4,
            boundary=pts
        )
        compiled_floors.append(floor_obj)

    # 7. Roof
    roof_data = building_model.get("roof", {})
    compiled_roof = None
    if roof_data:
        r_dict = roof_data if isinstance(roof_data, dict) else roof_data.dict() if hasattr(roof_data, 'dict') else {}
        r_pts = r_dict.get("boundary", [])
        pts = [(p["x"], p["y"]) if isinstance(p, dict) else (p.x, p.y) if hasattr(p, 'x') else (p[0], p[1]) for p in r_pts]
        compiled_roof = ParametricRoof(
            id=r_dict.get("id", "roof_01"),
            roof_type=r_dict.get("roof_type", "flat_terrace"),
            boundary=pts,
            elevation=6000.0,
            pitch_slope_degrees=r_dict.get("pitch_slope_degrees", 1.5),
            parapet_height=r_dict.get("parapet_height_ft", 3.5) * 304.8,
            solar_pv_panel_count=r_dict.get("solar_pv_panel_count", 14)
        )

    # 8. Structural Elements (Columns)
    columns_data = building_model.get("columns", [])
    compiled_columns = []
    for idx, col in enumerate(columns_data):
        c_dict = col if isinstance(col, dict) else col.dict() if hasattr(col, 'dict') else {}
        pos = c_dict.get("position", {})
        pos_coord = (pos.get("x", 0.0), pos.get("y", 0.0)) if isinstance(pos, dict) else (pos.x, pos.y) if hasattr(pos, 'x') else (0.0, 0.0)
        col_obj = ParametricColumn(
            id=c_dict.get("id", f"col_{idx}"),
            level_index=c_dict.get("level_index", 0),
            position=pos_coord,
            width=c_dict.get("width_inches", 9.0) * 25.4,
            depth=c_dict.get("depth_inches", 15.0) * 25.4,
            height=c_dict.get("height_ft", 10.0) * 304.8
        )
        compiled_columns.append(col_obj)

    # 9. Architectural Elements (Finishes & Furniture)
    furniture_data = building_model.get("furniture", [])

    total_wall_len = sum(w.length for w in compiled_walls)

    summary_info = {
        "total_wall_linear_ft": round(total_wall_len, 2),
        "total_walls": len(compiled_walls),
        "total_openings": len(compiled_doors) + len(compiled_windows),
        "slab_count": len(compiled_floors),
        "column_count": len(compiled_columns),
        "estimated_triangles": len(compiled_walls) * 24 + len(compiled_floors) * 12 + len(compiled_columns) * 12
    }

    walls_list = [w.to_dict() for w in compiled_walls]
    floors_list = [fl.to_dict() for fl in compiled_floors]
    doors_list = [d.to_dict() for d in compiled_doors]
    windows_list = [win.to_dict() for win in compiled_windows]
    columns_list = [c.to_dict() for c in compiled_columns]

    return {
        "pipeline_stages": [
            "site", "footprint", "rooms", "walls", "doors_windows", "floors", "roof", "structural_elements", "architectural_elements"
        ],
        "site": {
            "polygon": [list(p) for p in site_poly.exterior.coords],
            "area_sqft": site_poly.area
        },
        "footprint": {
            "polygon": [list(p) for p in footprint_poly.exterior.coords] if footprint_poly.is_valid and not footprint_poly.is_empty else [],
            "buildable_area_sqft": footprint_poly.area if footprint_poly.is_valid else 0.0
        },
        "rooms": compiled_rooms,
        "walls": walls_list,
        "doors": doors_list,
        "windows": windows_list,
        "floors": floors_list,
        "roof": compiled_roof.to_dict() if compiled_roof else None,
        "structural_elements": {
            "columns": columns_list
        },
        "architectural_elements": {
            "furniture_count": len(furniture_data),
            "systems": building_model.get("systems", {})
        },
        "summary": summary_info,
        "mesh_summary": summary_info,
        "meshes": {
            "walls": walls_list,
            "floors": floors_list,
            "doors": doors_list,
            "windows": windows_list,
            "columns": columns_list
        }
    }


class GeometryCompiler:
    """Wrapper class maintaining backwards compatibility"""
    def __init__(self, building_model: Dict[str, Any]):
        self.model = building_model

    def compile_summary(self) -> Dict[str, Any]:
        res = compile_building(self.model)
        total_wall_len = sum(w.get("length", 0.0) for w in res["walls"])
        return {
            "total_wall_linear_ft": round(total_wall_len, 2),
            "slab_count": len(res["floors"]),
            "column_count": len(res["structural_elements"]["columns"]),
            "estimated_triangles": res["mesh_summary"]["estimated_triangles"],
            "parametric_pipeline": res
        }
