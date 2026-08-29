"""
ArchAI Studio v3 - Canonical Building Model Single Source of Truth
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid

from .site import Site, BoundaryPolygon, Point2D, Setbacks, RoadAccess, SolarData
from .elements import (
    Level,
    Space,
    SpaceType,
    Wall,
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
from .constraints import BuildingConstraints
from .metrics import BuildingMetrics, CostEstimate


class ProjectMetadata(BaseModel):
    id: str = Field(default_factory=lambda: f"proj_{uuid.uuid4().hex[:8]}")
    name: str = "ArchAI Modern Eco-Villa"
    code: str = "ARCH-V3-001"
    client_name: str = "Mr. & Mrs. Sharma"
    jurisdiction: str = "NBC_2016_INDIA"
    designer: str = "ArchAI Generative Engine"
    version: int = 1


class BuildingModel(BaseModel):
    id: str = Field(default_factory=lambda: f"bldg_{uuid.uuid4().hex[:8]}")
    project: ProjectMetadata = Field(default_factory=ProjectMetadata)
    site: Site
    levels: List[Level] = Field(default_factory=list)
    spaces: List[Space] = Field(default_factory=list)
    walls: List[Wall] = Field(default_factory=list)
    doors: List[Door] = Field(default_factory=list)
    windows: List[Window] = Field(default_factory=list)
    columns: List[Column] = Field(default_factory=list)
    slabs: List[Slab] = Field(default_factory=list)
    roof: Optional[Roof] = None
    furniture: List[Furniture] = Field(default_factory=list)
    materials: List[Material] = Field(default_factory=list)
    constraints: BuildingConstraints = Field(default_factory=BuildingConstraints)
    metrics: BuildingMetrics = Field(default_factory=BuildingMetrics)
    systems: BuildingSystems = Field(default_factory=BuildingSystems)

    def get_spaces_by_level(self, level_index: int) -> List[Space]:
        return [s for s in self.spaces if s.level_index == level_index]

    def get_walls_by_level(self, level_index: int) -> List[Wall]:
        return [w for w in self.walls if w.level_index == level_index]

    def recompute_metrics(self) -> None:
        total_carpet = sum(s.area_sqft for s in self.spaces)
        ground_spaces = [s for s in self.spaces if s.level_index == 0]
        ground_cov = sum(s.area_sqft for s in ground_spaces)

        self.metrics.carpet_area_sqft = round(total_carpet, 2)
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
        self.metrics.bedroom_count = len([s for s in self.spaces if "bedroom" in (s.type.value if hasattr(s.type, 'value') else str(s.type))])
        self.metrics.bathroom_count = len([s for s in self.spaces if "bathroom" in (s.type.value if hasattr(s.type, 'value') else str(s.type)) or "powder" in (s.type.value if hasattr(s.type, 'value') else str(s.type))])
        self.metrics.building_height_ft = sum(lvl.floor_to_floor_height_ft for lvl in self.levels)


def create_default_building_model() -> BuildingModel:
    """Generates default benchmark 30x40 villa model."""
    site = Site(
        id="site_benchmark_30x40",
        latitude=19.0760,
        longitude=72.8777,
        address="Bandra West, Mumbai, India",
        climate_zone="Warm & Humid",
        boundary=BoundaryPolygon(
            vertices=[Point2D(x=0, y=0), Point2D(x=30, y=0), Point2D(x=30, y=40), Point2D(x=0, y=40)],
            shape="rectangular",
            width=30.0,
            length=40.0,
            total_area_sqft=1200.0
        ),
        roads=[
            RoadAccess(
                id="road_front",
                name="Front Street (30ft R.O.W.)",
                side="South",
                road_width_ft=30.0,
                is_main_road=True
            )
        ],
        setbacks=Setbacks(front=6.0, rear=5.0, side_left=4.0, side_right=4.0),
        far_fsi=2.0,
        ground_coverage_max_pct=60.0,
        maximum_height_ft=36.0,
        solar_data=SolarData(annual_solar_flux_kwh_m2=1820.0, peak_sun_hours_daily=5.5, rooftop_solar_capacity_kw=8.5)
    )

    levels = [
        Level(id="lvl_0", name="Ground Floor", level_index=0, elevation_ft=0.0, floor_to_floor_height_ft=10.0),
        Level(id="lvl_1", name="First Floor", level_index=1, elevation_ft=10.0, floor_to_floor_height_ft=10.0),
    ]

    spaces = [
        Space(id="spc_foyer", name="Entry Foyer", type=SpaceType.FOYER, level_index=0,
              polygon_2d=[Point2D(x=4, y=6), Point2D(x=12, y=6), Point2D(x=12, y=12), Point2D(x=4, y=12)],
              area_sqft=48.0, target_area_sqft=50.0),
        Space(id="spc_living", name="Living & Dining Lounge", type=SpaceType.LIVING_ROOM, level_index=0,
              polygon_2d=[Point2D(x=12, y=6), Point2D(x=26, y=6), Point2D(x=26, y=22), Point2D(x=12, y=22)],
              area_sqft=224.0, target_area_sqft=220.0),
        Space(id="spc_kitchen", name="Modular Kitchen", type=SpaceType.KITCHEN, level_index=0,
              polygon_2d=[Point2D(x=4, y=22), Point2D(x=15, y=22), Point2D(x=15, y=35), Point2D(x=4, y=35)],
              area_sqft=143.0, target_area_sqft=140.0),
        Space(id="spc_office", name="Home Office / Study", type=SpaceType.HOME_OFFICE, level_index=0,
              polygon_2d=[Point2D(x=15, y=22), Point2D(x=26, y=22), Point2D(x=26, y=35), Point2D(x=15, y=35)],
              area_sqft=143.0, target_area_sqft=140.0),
        Space(id="spc_master_bed", name="Master Bedroom", type=SpaceType.MASTER_BEDROOM, level_index=1,
              polygon_2d=[Point2D(x=4, y=6), Point2D(x=16, y=6), Point2D(x=16, y=22), Point2D(x=4, y=22)],
              area_sqft=192.0, target_area_sqft=190.0),
        Space(id="spc_bed_2", name="Bedroom 2", type=SpaceType.BEDROOM, level_index=1,
              polygon_2d=[Point2D(x=16, y=6), Point2D(x=26, y=6), Point2D(x=26, y=22), Point2D(x=16, y=22)],
              area_sqft=160.0, target_area_sqft=160.0),
        Space(id="spc_bed_3", name="Bedroom 3", type=SpaceType.BEDROOM, level_index=1,
              polygon_2d=[Point2D(x=4, y=22), Point2D(x=15, y=22), Point2D(x=15, y=35), Point2D(x=4, y=35)],
              area_sqft=143.0, target_area_sqft=140.0),
        Space(id="spc_terrace", name="Terrace Lounge", type=SpaceType.TERRACE, level_index=1,
              polygon_2d=[Point2D(x=15, y=22), Point2D(x=26, y=22), Point2D(x=26, y=35), Point2D(x=15, y=35)],
              area_sqft=143.0, target_area_sqft=140.0),
    ]

    walls = [
        Wall(id="w_g1", level_index=0, start_point=Point2D(x=4, y=6), end_point=Point2D(x=26, y=6), is_exterior=True, thickness_inches=9),
        Wall(id="w_g2", level_index=0, start_point=Point2D(x=26, y=6), end_point=Point2D(x=26, y=35), is_exterior=True, thickness_inches=9),
        Wall(id="w_g3", level_index=0, start_point=Point2D(x=26, y=35), end_point=Point2D(x=4, y=35), is_exterior=True, thickness_inches=9),
        Wall(id="w_g4", level_index=0, start_point=Point2D(x=4, y=35), end_point=Point2D(x=4, y=6), is_exterior=True, thickness_inches=9),
        Wall(id="w_g_int1", level_index=0, start_point=Point2D(x=4, y=22), end_point=Point2D(x=26, y=22), is_exterior=False, thickness_inches=4.5),
        Wall(id="w_g_int2", level_index=0, start_point=Point2D(x=15, y=22), end_point=Point2D(x=15, y=35), is_exterior=False, thickness_inches=4.5),
        Wall(id="w_f1", level_index=1, start_point=Point2D(x=4, y=6), end_point=Point2D(x=26, y=6), is_exterior=True, thickness_inches=9),
        Wall(id="w_f2", level_index=1, start_point=Point2D(x=26, y=6), end_point=Point2D(x=26, y=35), is_exterior=True, thickness_inches=9),
        Wall(id="w_f3", level_index=1, start_point=Point2D(x=26, y=35), end_point=Point2D(x=4, y=35), is_exterior=True, thickness_inches=9),
        Wall(id="w_f4", level_index=1, start_point=Point2D(x=4, y=35), end_point=Point2D(x=4, y=6), is_exterior=True, thickness_inches=9),
        Wall(id="w_f_int1", level_index=1, start_point=Point2D(x=4, y=22), end_point=Point2D(x=26, y=22), is_exterior=False, thickness_inches=4.5),
        Wall(id="w_f_int2", level_index=1, start_point=Point2D(x=16, y=6), end_point=Point2D(x=16, y=22), is_exterior=False, thickness_inches=4.5),
    ]

    doors = [
        Door(id="door_main", wall_id="w_g1", level_index=0, offset_along_wall_ft=3.0, width_ft=4.0, height_ft=8.0, sill_height_ft=0.0, lintel_height_ft=8.0, door_style="Teak Pivot Door"),
        Door(id="door_kit", wall_id="w_g_int1", level_index=0, offset_along_wall_ft=5.0, width_ft=3.25, height_ft=7.5, sill_height_ft=0.0, lintel_height_ft=7.5, door_style="Flush Door"),
    ]

    windows = [
        Window(id="win_liv_south", wall_id="w_g1", level_index=0, offset_along_wall_ft=12.0, width_ft=8.0, height_ft=6.0, sill_height_ft=2.0, lintel_height_ft=8.0, window_style="UPVC 3-Track Slider"),
        Window(id="win_liv_east", wall_id="w_g2", level_index=0, offset_along_wall_ft=6.0, width_ft=6.0, height_ft=5.5, sill_height_ft=2.5, lintel_height_ft=8.0, window_style="UPVC Slider"),
        Window(id="win_office_east", wall_id="w_g2", level_index=0, offset_along_wall_ft=20.0, width_ft=5.0, height_ft=5.0, sill_height_ft=3.0, lintel_height_ft=8.0, window_style="Casement"),
        Window(id="win_master_south", wall_id="w_f1", level_index=1, offset_along_wall_ft=4.0, width_ft=8.0, height_ft=6.5, sill_height_ft=1.5, lintel_height_ft=8.0, window_style="French Balcony Slider"),
    ]

    columns = [
        Column(id="col_1", level_index=0, position=Point2D(x=4, y=6), width_inches=9, depth_inches=15, height_ft=10),
        Column(id="col_2", level_index=0, position=Point2D(x=15, y=6), width_inches=9, depth_inches=15, height_ft=10),
        Column(id="col_3", level_index=0, position=Point2D(x=26, y=6), width_inches=9, depth_inches=15, height_ft=10),
        Column(id="col_4", level_index=0, position=Point2D(x=4, y=22), width_inches=9, depth_inches=15, height_ft=10),
        Column(id="col_5", level_index=0, position=Point2D(x=15, y=22), width_inches=9, depth_inches=15, height_ft=10),
        Column(id="col_6", level_index=0, position=Point2D(x=26, y=22), width_inches=9, depth_inches=15, height_ft=10),
        Column(id="col_7", level_index=0, position=Point2D(x=4, y=35), width_inches=9, depth_inches=15, height_ft=10),
        Column(id="col_8", level_index=0, position=Point2D(x=15, y=35), width_inches=9, depth_inches=15, height_ft=10),
        Column(id="col_9", level_index=0, position=Point2D(x=26, y=35), width_inches=9, depth_inches=15, height_ft=10),
    ]

    slabs = [
        Slab(id="slab_g", level_index=0, boundary=[Point2D(x=4, y=6), Point2D(x=26, y=6), Point2D(x=26, y=35), Point2D(x=4, y=35)], thickness_inches=6, elevation_ft=0.0),
        Slab(id="slab_f", level_index=1, boundary=[Point2D(x=3, y=5), Point2D(x=27, y=5), Point2D(x=27, y=36), Point2D(x=3, y=36)], thickness_inches=6, elevation_ft=10.0),
    ]

    roof = Roof(
        id="roof_top",
        roof_type=RoofType.FLAT_TERRACE,
        boundary=[Point2D(x=3, y=5), Point2D(x=27, y=5), Point2D(x=27, y=36), Point2D(x=3, y=36)],
        pitch_slope_degrees=1.5,
        parapet_height_ft=3.5,
        solar_pv_panel_count=14
    )

    model = BuildingModel(
        project=ProjectMetadata(name="ArchAI Bandra Benchmark Eco-Villa", code="ARCH-V3-CLI"),
        site=site,
        levels=levels,
        spaces=spaces,
        walls=walls,
        doors=doors,
        windows=windows,
        columns=columns,
        slabs=slabs,
        roof=roof
    )
    model.recompute_metrics()
    return model
