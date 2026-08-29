"""
ArchAI Studio v3 - Canonical Building Model Package
Single Source of Truth for all architectural entities, spaces, physical elements, constraints, and metrics.
"""

from .site import Site, BoundaryPolygon, RoadAccess, SolarData
from .elements import (
    Point2D,
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
    Furniture,
    Material,
    BuildingSystems,
)
from .constraints import BuildingConstraints, Setbacks
from .metrics import BuildingMetrics, CostEstimate, SustainabilityScore
from .building_model import BuildingModel, ProjectMetadata

__all__ = [
    "BuildingModel",
    "ProjectMetadata",
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
    "Furniture",
    "Material",
    "BuildingSystems",
    "BuildingConstraints",
    "Setbacks",
    "BuildingMetrics",
    "CostEstimate",
    "SustainabilityScore",
]
