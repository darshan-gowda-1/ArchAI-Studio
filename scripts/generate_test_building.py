#!/usr/bin/env python3
"""
ArchAI Studio v3 - Standalone Canonical Building Generator CLI
Synthesizes a full canonical building model, runs geometry compilation, evaluates compliance, computes BOQ, and writes outputs.
"""

import sys
import os
import json

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure packages and integrations are on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../packages/building-model/python")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../packages/geometry/python")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../packages/optimizer/python")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../packages/boq/python")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../packages/compliance/python")))

from packages.building_model.site import Site, BoundaryPolygon, Point2D, Setbacks, RoadAccess, SolarData
from packages.building_model.elements import (
    Level, Space, SpaceType, Wall, Door, Window, Column, Slab, Roof, RoofType, Furniture
)
from packages.building_model.building_model import BuildingModel, ProjectMetadata
from packages.geometry.python.compiler import GeometryCompiler
from packages.boq.python.qto import calculate_building_boq
from packages.compliance.python.checker import check_building_compliance
from packages.optimizer.python.fitness import evaluate_building_fitness


def generate_benchmark_building():
    print("=" * 70)
    print("ArchAI Studio v3 - Canonical Building Model Generator")
    print("Single Source of Truth: Canonical BuildingModel")
    print("=" * 70)

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
        # Ground Floor Spaces
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

        # First Floor Spaces
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
        # Ground Floor Walls
        Wall(id="w_g1", level_index=0, start_point=Point2D(x=4, y=6), end_point=Point2D(x=26, y=6), is_exterior=True, thickness_inches=9),
        Wall(id="w_g2", level_index=0, start_point=Point2D(x=26, y=6), end_point=Point2D(x=26, y=35), is_exterior=True, thickness_inches=9),
        Wall(id="w_g3", level_index=0, start_point=Point2D(x=26, y=35), end_point=Point2D(x=4, y=35), is_exterior=True, thickness_inches=9),
        Wall(id="w_g4", level_index=0, start_point=Point2D(x=4, y=35), end_point=Point2D(x=4, y=6), is_exterior=True, thickness_inches=9),
        Wall(id="w_g_int1", level_index=0, start_point=Point2D(x=4, y=22), end_point=Point2D(x=26, y=22), is_exterior=False, thickness_inches=4.5),
        Wall(id="w_g_int2", level_index=0, start_point=Point2D(x=15, y=22), end_point=Point2D(x=15, y=35), is_exterior=False, thickness_inches=4.5),

        # First Floor Walls
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

    print("\n[1] Canonical Building Model Created:")
    print(f"    - Model ID: {model.id}")
    print(f"    - Carpet Area: {model.metrics.carpet_area_sqft} sq ft")
    print(f"    - Built-up Area: {model.metrics.total_built_up_area_sqft} sq ft")
    print(f"    - Room Count: {model.metrics.room_count} ({model.metrics.bedroom_count} bedrooms)")
    print(f"    - Ground Coverage: {model.metrics.ground_coverage_percent}%")

    # Geometry Compiler
    bldg_dict = model.model_dump() if hasattr(model, 'model_dump') else model.dict()
    compiler = GeometryCompiler(bldg_dict)
    geom_summary = compiler.compile_summary()
    print("\n[2] 3D Geometry Compilation Summary:")
    print(f"    - Total Linear Wall Length: {geom_summary['total_wall_linear_ft']} ft")
    print(f"    - Slab Count: {geom_summary['slab_count']}, Columns: {geom_summary['column_count']}")
    print(f"    - Estimated Triangles: {geom_summary['estimated_triangles']}")

    # BOQ Calculation
    boq = calculate_building_boq(bldg_dict)
    print("\n[3] BOQ & Cost Takeoff:")
    print(f"    - Grand Total: INR {boq['grand_total_inr']:,}")
    print(f"    - Rate per Sq Ft: INR {boq['rate_per_sqft_inr']:,}")

    # Compliance Verification
    compliance = check_building_compliance(bldg_dict)
    print("\n[4] Building Regulations & NBC Compliance:")
    print(f"    - Overall Status: {compliance['overall_status']}")
    print(f"    - Compliance Score: {compliance['score_percent']}%")

    # Fitness Evaluation
    fitness = evaluate_building_fitness(bldg_dict)
    print("\n[5] NSGA-II Multi-Objective Fitness Evaluation:")
    print(f"    - Space Score: {fitness['space_score']}/100")
    print(f"    - Daylight Score: {fitness['daylight_score']}/100")
    print(f"    - Overall Score: {fitness['overall_score']}/100")

    print("\n" + "=" * 70)
    print("✓ Canonical Building Model successfully generated and verified!")
    print("=" * 70)

    return model


if __name__ == "__main__":
    generate_benchmark_building()
