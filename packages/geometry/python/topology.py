"""
ArchAI Studio v3 - 2D Topology & Spatial Analysis with Shapely & NumPy
"""

from typing import List, Tuple, Dict, Any, Optional
import math
import numpy as np
from shapely.geometry import Polygon, Point, LineString, MultiPolygon
from shapely.ops import unary_union


def points_to_shapely_polygon(points: List[Dict[str, float]]) -> Polygon:
    """Converts a list of dicts with 'x' and 'y' keys to a Shapely Polygon."""
    coords = [(p["x"] if isinstance(p, dict) else p.x, p["y"] if isinstance(p, dict) else p.y) for p in points]
    return Polygon(coords)


def shapely_to_points_dict(poly: Polygon) -> List[Dict[str, float]]:
    """Converts a Shapely Polygon exterior ring back to a list of Point2D dicts."""
    coords = list(poly.exterior.coords)[:-1]  # Drop repeated closing vertex
    return [{"x": round(float(x), 2), "y": round(float(y), 2)} for x, y in coords]


def compute_polygon_area(points: List[Any]) -> float:
    """Computes exact polygon area."""
    poly = points_to_shapely_polygon(points)
    return round(float(poly.area), 2)


def compute_polygon_centroid(points: List[Any]) -> Dict[str, float]:
    """Computes geometric centroid coordinates."""
    poly = points_to_shapely_polygon(points)
    c = poly.centroid
    return {"x": round(float(c.x), 2), "y": round(float(c.y), 2)}


def clip_polygon_by_setbacks(
    boundary_points: List[Any],
    front_setback: float,
    rear_setback: float,
    side_left: float,
    side_right: float,
) -> List[Dict[str, float]]:
    """
    Computes buildable envelope polygon clipped by setbacks.
    """
    poly = points_to_shapely_polygon(boundary_points)
    minx, miny, maxx, maxy = poly.bounds

    bx1 = minx + side_left
    bx2 = maxx - side_right
    by1 = miny + front_setback
    by2 = maxy - rear_setback

    if bx2 <= bx1 or by2 <= by1:
        # Fallback to scaled buffer if setbacks exceed dimensions
        buffered = poly.buffer(-min(side_left, front_setback) * 0.5)
        if buffered.is_empty:
            return shapely_to_points_dict(poly)
        if isinstance(buffered, MultiPolygon):
            buffered = max(buffered.geoms, key=lambda g: g.area)
        return shapely_to_points_dict(buffered)

    buildable_rect = Polygon([(bx1, by1), (bx2, by1), (bx2, by2), (bx1, by2)])
    intersection = poly.intersection(buildable_rect)

    if intersection.is_empty:
        return shapely_to_points_dict(poly)

    if isinstance(intersection, MultiPolygon):
        intersection = max(intersection.geoms, key=lambda g: g.area)

    return shapely_to_points_dict(intersection)


def check_room_overlaps(space_polygons: List[List[Any]]) -> float:
    """
    Computes total intersection area between pairs of rooms.
    Should be 0.0 in a valid architectural design.
    """
    total_overlap_area = 0.0
    polys = [points_to_shapely_polygon(pts) for pts in space_polygons if len(pts) >= 3]

    for i in range(len(polys)):
        for j in range(i + 1, len(polys)):
            inter = polys[i].intersection(polys[j])
            if not inter.is_empty and inter.area > 0.05:  # Tolerate minimal float precision touch
                total_overlap_area += inter.area

    return round(float(total_overlap_area), 2)


def generate_wall_centerlines_from_spaces(spaces: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extracts shared and exterior walls by matching boundary edges of spaces.
    """
    edges: List[Tuple[Tuple[float, float], Tuple[float, float], str]] = []

    for space in spaces:
        pts = space["polygon_2d"]
        n = len(pts)
        for i in range(n):
            p1 = (round(float(pts[i]["x"] if isinstance(pts[i], dict) else pts[i].x), 2),
                  round(float(pts[i]["y"] if isinstance(pts[i], dict) else pts[i].y), 2))
            p2 = (round(float(pts[(i + 1) % n]["x"] if isinstance(pts[(i + 1) % n], dict) else pts[(i + 1) % n].x), 2),
                  round(float(pts[(i + 1) % n]["y"] if isinstance(pts[(i + 1) % n], dict) else pts[(i + 1) % n].y), 2))
            # Sort endpoints so order doesn't affect matching
            sorted_edge = tuple(sorted([p1, p2]))
            edges.append((sorted_edge[0], sorted_edge[1], space.get("id", "")))

    from collections import defaultdict
    edge_counts = defaultdict(list)
    for p1, p2, spc_id in edges:
        edge_counts[(p1, p2)].append(spc_id)

    walls = []
    wall_idx = 1
    for (p1, p2), spc_ids in edge_counts.items():
        is_shared = len(spc_ids) > 1
        length = math.hypot(p2[0] - p1[0], p2[1] - p1[1])
        if length > 0.5:
            walls.append({
                "id": f"w_compiled_{wall_idx}",
                "start_point": {"x": p1[0], "y": p1[1]},
                "end_point": {"x": p2[0], "y": p2[1]},
                "thickness_inches": 4.5 if is_shared else 9.0,
                "height_ft": 10.0,
                "is_exterior": not is_shared,
                "is_load_bearing": not is_shared,
                "material": "AAC Partition Block" if is_shared else "AAC Block Masonry",
                "opening_ids": []
            })
            wall_idx += 1

    return walls


class Topology2D:
    """Class wrapper for 2D spatial calculations."""
    @staticmethod
    def area(points: List[Any]) -> float:
        return compute_polygon_area(points)

    @staticmethod
    def centroid(points: List[Any]) -> Dict[str, float]:
        return compute_polygon_centroid(points)

    @staticmethod
    def clip_setbacks(boundary: List[Any], f: float, r: float, sl: float, sr: float) -> List[Dict[str, float]]:
        return clip_polygon_by_setbacks(boundary, f, r, sl, sr)

    @staticmethod
    def overlap_area(space_polys: List[List[Any]]) -> float:
        return check_room_overlaps(space_polys)

    @staticmethod
    def extract_walls(spaces: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return generate_wall_centerlines_from_spaces(spaces)
