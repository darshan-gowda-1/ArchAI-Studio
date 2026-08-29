"""
ArchAI Studio v3 - Python Building Model Package
"""

from .site import Site, BoundaryPolygon, RoadAccess, SolarData, Point2D
from .elements import (
    Point3D,
    Vector3D,
    Level,
    Space,
    SpaceType,
    Wall,
    Opening,
    Door,
    Window,
    Column,
    Slab,
    Roof,
    RoofType,
    Furniture,
    Material,
    BuildingSystems,
)
from .constraints import BuildingConstraints, Setbacks
from .metrics import BuildingMetrics, CostEstimate, SustainabilityScore
from .building_model import BuildingModel, ProjectMetadata, create_default_building_model

__all__ = [
    "BuildingModel",
    "ProjectMetadata",
    "create_default_building_model",
    "Site",
    "BoundaryPolygon",
    "RoadAccess",
    "SolarData",
    "Point2D",
    "Point3D",
    "Vector3D",
    "Level",
    "Space",
    "SpaceType",
    "Wall",
    "Opening",
    "Door",
    "Window",
    "Column",
    "Slab",
    "Roof",
    "RoofType",
    "Furniture",
    "Material",
    "BuildingSystems",
    "BuildingConstraints",
    "Setbacks",
    "BuildingMetrics",
    "CostEstimate",
    "SustainabilityScore",
]
