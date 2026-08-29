"""
ArchAI Studio v3 - Constraints Model
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Setbacks(BaseModel):
    front_ft: float = Field(default=6.0, ge=0)
    rear_ft: float = Field(default=5.0, ge=0)
    side_left_ft: float = Field(default=4.0, ge=0)
    side_right_ft: float = Field(default=4.0, ge=0)


class AdjacencyConstraint(BaseModel):
    space_a_type: str = Field(...)
    space_b_type: str = Field(...)
    required_adjacency: str = Field(default="direct")
    priority_weight: float = Field(default=1.0, ge=0.0, le=2.0)


class BuildingConstraints(BaseModel):
    jurisdiction_code: str = Field(default="NBC_2016_INDIA")
    max_building_height_ft: float = Field(default=36.0, gt=0)
    max_far_fsi: float = Field(default=2.0, gt=0)
    max_ground_coverage_percent: float = Field(default=60.0, ge=10.0, le=100.0)
    min_habitable_room_area_sqft: float = Field(default=100.0, gt=0)
    min_habitable_room_width_ft: float = Field(default=9.0, gt=0)
    min_ceiling_height_ft: float = Field(default=9.0, gt=0)
    min_window_area_ratio: float = Field(default=0.10, ge=0.05, le=0.5)
    budget_cap_inr: Optional[float] = Field(default=5000000.0)
    wheelchair_corridor_width_min_ft: float = Field(default=3.5, gt=0)
    setbacks: Setbacks = Field(default_factory=Setbacks)
    adjacencies: List[AdjacencyConstraint] = Field(
        default_factory=lambda: [
            AdjacencyConstraint(space_a_type="kitchen", space_b_type="dining", required_adjacency="direct", priority_weight=1.5),
            AdjacencyConstraint(space_a_type="living_room", space_b_type="foyer", required_adjacency="adjacent", priority_weight=1.2),
            AdjacencyConstraint(space_a_type="master_bedroom", space_b_type="bathroom", required_adjacency="direct", priority_weight=1.8),
        ]
    )
