"""
ArchAI Studio v3 - Canonical Building Elements
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Point2D(BaseModel):
    x: float = Field(..., description="X coordinate in feet or meters")
    y: float = Field(..., description="Y coordinate in feet or meters")


class Point3D(BaseModel):
    x: float = Field(...)
    y: float = Field(...)
    z: float = Field(...)


class Vector3D(BaseModel):
    x: float = Field(default=0.0)
    y: float = Field(default=0.0)
    z: float = Field(default=1.0)


class SpaceType(str, Enum):
    LIVING_ROOM = "living_room"
    MASTER_BEDROOM = "master_bedroom"
    BEDROOM = "bedroom"
    KITCHEN = "kitchen"
    DINING = "dining"
    BATHROOM = "bathroom"
    POWDER_ROOM = "powder_room"
    HOME_OFFICE = "home_office"
    BALCONY = "balcony"
    TERRACE = "terrace"
    CORRIDOR = "corridor"
    FOYER = "foyer"
    UTILITY = "utility"
    PARKING_GARAGE = "parking_garage"
    STAIRCASE = "staircase"
    STORAGE = "storage"
    OTHER = "other"


class Level(BaseModel):
    id: str = Field(...)
    name: str = Field(...)
    level_index: int = Field(..., ge=0)
    elevation_ft: float = Field(default=0.0)
    floor_to_floor_height_ft: float = Field(default=10.0, gt=0)
    slab_id: Optional[str] = Field(default=None)


class SpaceFinishes(BaseModel):
    flooring_material: str = Field(default="Vitrified Tiles (800x800mm)")
    wall_finish: str = Field(default="Premium Emulsion Paint")
    ceiling_finish: str = Field(default="Gypsum False Ceiling with LED Coves")
    skirting_height_inches: float = Field(default=4.0)


class Space(BaseModel):
    id: str = Field(...)
    name: str = Field(...)
    type: SpaceType = Field(...)
    level_index: int = Field(default=0, ge=0)
    polygon_2d: List[Point2D] = Field(..., min_items=3)
    area_sqft: float = Field(..., gt=0)
    ceiling_height_ft: float = Field(default=9.5, gt=0)
    target_area_sqft: Optional[float] = Field(default=None)
    finishes: SpaceFinishes = Field(default_factory=SpaceFinishes)
    requires_ventilation: bool = Field(default=True)
    daylight_factor_target: float = Field(default=2.0, ge=0.5, le=10.0)
    furniture_ids: List[str] = Field(default_factory=list)


class Wall(BaseModel):
    id: str = Field(...)
    level_index: int = Field(default=0, ge=0)
    start_point: Point2D = Field(...)
    end_point: Point2D = Field(...)
    thickness_inches: float = Field(default=9.0, gt=0)
    height_ft: float = Field(default=10.0, gt=0)
    is_exterior: bool = Field(default=False)
    is_load_bearing: bool = Field(default=False)
    material: str = Field(default="AAC Block Masonry with Cement Plaster")
    opening_ids: List[str] = Field(default_factory=list)


class OpeningType(str, Enum):
    DOOR = "door"
    WINDOW = "window"
    VENTILATOR = "ventilator"
    ARCH = "arch"


class Opening(BaseModel):
    id: str = Field(...)
    wall_id: str = Field(...)
    level_index: int = Field(default=0, ge=0)
    opening_type: OpeningType = Field(...)
    offset_along_wall_ft: float = Field(..., ge=0)
    width_ft: float = Field(..., gt=0)
    height_ft: float = Field(..., gt=0)
    sill_height_ft: float = Field(default=0.0, ge=0)
    lintel_height_ft: float = Field(default=7.0, gt=0)


class Door(Opening):
    opening_type: OpeningType = Field(default=OpeningType.DOOR)
    door_style: str = Field(default="Flush Door with Teak Veneer")
    swing_direction: str = Field(default="inward_right")
    fire_rating_minutes: int = Field(default=0)


class Window(Opening):
    opening_type: OpeningType = Field(default=OpeningType.WINDOW)
    window_style: str = Field(default="UPVC 3-Track Sliding Window")
    glazing_type: str = Field(default="6mm Double Glazed Low-E Glass")
    u_value: float = Field(default=2.4)
    shgc: float = Field(default=0.35)


class Column(BaseModel):
    id: str = Field(...)
    level_index: int = Field(default=0, ge=0)
    position: Point2D = Field(...)
    width_inches: float = Field(default=9.0, gt=0)
    depth_inches: float = Field(default=15.0, gt=0)
    height_ft: float = Field(default=10.0, gt=0)
    material: str = Field(default="M25 Grade RCC")
    is_structural_grid_aligned: bool = Field(default=True)


class Slab(BaseModel):
    id: str = Field(...)
    level_index: int = Field(default=0, ge=0)
    boundary: List[Point2D] = Field(..., min_items=3)
    thickness_inches: float = Field(default=6.0, gt=0)
    elevation_ft: float = Field(default=0.0)
    slab_type: str = Field(default="RCC Two-Way Solid Slab")
    openings: List[List[Point2D]] = Field(default_factory=list)


class RoofType(str, Enum):
    FLAT_TERRACE = "flat_terrace"
    GABLE = "gable"
    HIP = "hip"
    MONOSLOPE = "monoslope"
    PARAPET = "parapet"


class Roof(BaseModel):
    id: str = Field(default="roof_01")
    roof_type: RoofType = Field(default=RoofType.FLAT_TERRACE)
    boundary: List[Point2D] = Field(..., min_items=3)
    pitch_slope_degrees: float = Field(default=0.0, ge=0, le=45.0)
    overhang_ft: float = Field(default=1.5, ge=0)
    parapet_height_ft: float = Field(default=3.5, ge=0)
    waterproofing_system: str = Field(default="App Modified Bituminous Membrane")
    solar_pv_panel_count: int = Field(default=12, ge=0)


class Furniture(BaseModel):
    id: str = Field(...)
    name: str = Field(...)
    category: str = Field(...)
    level_index: int = Field(default=0, ge=0)
    position: Point3D = Field(...)
    rotation_yaw_deg: float = Field(default=0.0)
    width_ft: float = Field(..., gt=0)
    depth_ft: float = Field(..., gt=0)
    height_ft: float = Field(..., gt=0)
    clearance_radius_ft: float = Field(default=3.0, ge=0)
    asset_uri: Optional[str] = Field(default=None)


class Material(BaseModel):
    id: str = Field(...)
    name: str = Field(...)
    category: str = Field(default="masonry")
    unit_cost_usd: float = Field(default=0.0)
    embodied_carbon_kg_co2_unit: float = Field(default=0.0)
    density_kg_m3: float = Field(default=2400.0)
    texture_url: Optional[str] = Field(default=None)


class BuildingSystems(BaseModel):
    mep_electrical_capacity_kw: float = Field(default=12.0)
    plumbing_water_tank_capacity_liters: float = Field(default=4000.0)
    rainwater_harvesting_tank_liters: float = Field(default=6000.0)
    hvac_cooling_tonnage: float = Field(default=5.5)
    solar_pv_kw: float = Field(default=8.5)
