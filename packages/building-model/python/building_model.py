"""
ArchAI Studio v3 - Canonical Building Model (Single Source of Truth)

Central schema representing the entire architectural design.
Consumed by:
- Next.js Web Studio (Three.js & 2D SVG canvas)
- Python FastAPI REST & WebSocket APIs
- Celery Task Workers
- Shapely/trimesh Geometry Compiler
- NSGA-II Genetic Optimizer
- Parametric BOQ & QTO Engine
- NBC / IBC Compliance Engine
- Open BIM Exporters (IFC4, DXF, GLTF, Blender Cycles)
"""

import uuid
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from .site import Site
from .elements import (
    Level,
    Space,
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
from .constraints import BuildingConstraints
from .metrics import BuildingMetrics


class ProjectMetadata(BaseModel):
    id: str = Field(default_factory=lambda: f"proj_{uuid.uuid4().hex[:8]}")
    name: str = Field(default="ArchAI Modern Residence")
    code: str = Field(default="ARCH-2026-001")
    client_name: Optional[str] = Field(default="Private Client")
    architect_name: Optional[str] = Field(default="ArchAI Autonomous Engine")
    organization: Optional[str] = Field(default="Studio ArchAI Enterprise")
    created_at: str = Field(default="2026-08-28T12:00:00Z")
    updated_at: str = Field(default="2026-08-28T12:00:00Z")
    version_number: int = Field(default=1, ge=1)
    status: str = Field(default="active", description="draft, optimizing, active, approved, construction_ready")
    units: str = Field(default="imperial_feet", description="imperial_feet or metric_meters")
    tags: List[str] = Field(default_factory=lambda: ["residential", "modern", "sustainable", "v3"])


class BuildingModel(BaseModel):
    id: str = Field(default_factory=lambda: f"bldg_{uuid.uuid4().hex[:8]}", description="Unique Building Model UUID")
    project_id: str = Field(default_factory=lambda: f"proj_{uuid.uuid4().hex[:8]}", description="Parent project reference")

    project: ProjectMetadata = Field(default_factory=ProjectMetadata, description="Project metadata and tracking info")
    site: Site = Field(..., description="Cadastral plot, terrain, setbacks, orientation, solar flux")
    levels: List[Level] = Field(default_factory=list, description="Ordered vertical floor levels")

    spaces: List[Space] = Field(default_factory=list, description="Rooms and functional zones with 2D boundary polygons")
    walls: List[Wall] = Field(default_factory=list, description="Physical partition and load-bearing walls")
    openings: List[Opening] = Field(default_factory=list, description="Generic openings")
    doors: List[Door] = Field(default_factory=list, description="Doors with swings, styles, fire ratings")
    windows: List[Window] = Field(default_factory=list, description="Windows with glazing, U-values, SHGC")

    slabs: List[Slab] = Field(default_factory=list, description="Floor and ceiling slabs with cantilever balconies")
    columns: List[Column] = Field(default_factory=list, description="RCC structural column grid")
    roof: Optional[Roof] = Field(default=None, description="Roof structure, pitch, solar PV array")

    furniture: List[Furniture] = Field(default_factory=list, description="Placed furniture assets with clearance zones")
    materials: List[Material] = Field(default_factory=list, description="Material definitions, textures, embodied carbon")
    systems: BuildingSystems = Field(default_factory=BuildingSystems, description="MEP, plumbing, electrical, HVAC, solar")

    constraints: BuildingConstraints = Field(default_factory=BuildingConstraints, description="Statutory and spatial constraints")
    metrics: BuildingMetrics = Field(default_factory=BuildingMetrics, description="Computed QTO cost, sustainability, FAR, areas")

    metadata: Dict[str, Any] = Field(default_factory=dict, description="Extensible JSON metadata and provenance attributes")

    def get_spaces_by_level(self, level_index: int) -> List[Space]:
        return [s for s in self.spaces if s.level_index == level_index]

    def get_walls_by_level(self, level_index: int) -> List[Wall]:
        return [w for w in self.walls if w.level_index == level_index]

    def recompute_metrics(self) -> None:
        """Recompute built-up area, carpet area, and room counts from elements."""
        total_carpet = sum(s.area_sqft for s in self.spaces)
        ground_spaces = [s for s in self.spaces if s.level_index == 0]
        ground_cov = sum(s.area_sqft for s in ground_spaces)

        self.metrics.carpet_area_sqft = round(total_carpet, 2)
        # Built-up area includes wall thickness (~12-15% extra)
        self.metrics.total_built_up_area_sqft = round(total_carpet * 1.15, 2)
        self.metrics.ground_coverage_sqft = round(ground_cov * 1.15, 2)

        if self.site.boundary.total_area_sqft > 0:
            self.metrics.ground_coverage_percent = round(
                (self.metrics.ground_coverage_sqft / self.site.boundary.total_area_sqft) * 100, 1
            )
            self.metrics.achieved_far_fsi = round(
                self.metrics.total_built_up_area_sqft / self.site.boundary.total_area_sqft, 2
            )

        self.metrics.room_count = len(self.spaces)
        self.metrics.bedroom_count = len([s for s in self.spaces if "bedroom" in s.type.value])
        self.metrics.bathroom_count = len([s for s in self.spaces if "bathroom" in s.type.value or "powder" in s.type.value])
        self.metrics.building_height_ft = sum(lvl.floor_to_floor_height_ft for lvl in self.levels)
