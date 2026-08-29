"""
ArchAI Studio v3 - Canonical Building Model Unit Tests
"""

import pytest
from packages.building_model.site import Site, BoundaryPolygon, Point2D, Setbacks
from packages.building_model.elements import (
    Space,
    SpaceType,
    Wall,
    Door,
    Window,
    Column,
    Slab,
    Roof,
    RoofType,
    Level,
)
from packages.building_model.building_model import BuildingModel, ProjectMetadata


def test_canonical_building_model_creation():
    site = Site(
        boundary=BoundaryPolygon(
            vertices=[Point2D(x=0, y=0), Point2D(x=30, y=0), Point2D(x=30, y=40), Point2D(x=0, y=40)],
            width=30,
            length=40,
            total_area_sqft=1200
        ),
        setbacks=Setbacks(front=6, rear=5, side_left=4, side_right=4)
    )

    spaces = [
        Space(
            id="spc_living",
            name="Living Room",
            type=SpaceType.LIVING_ROOM,
            level_index=0,
            polygon_2d=[Point2D(x=4, y=6), Point2D(x=26, y=6), Point2D(x=26, y=22), Point2D(x=4, y=22)],
            area_sqft=352.0
        ),
        Space(
            id="spc_kitchen",
            name="Kitchen",
            type=SpaceType.KITCHEN,
            level_index=0,
            polygon_2d=[Point2D(x=4, y=22), Point2D(x=16, y=22), Point2D(x=16, y=35), Point2D(x=4, y=35)],
            area_sqft=156.0
        )
    ]

    model = BuildingModel(
        site=site,
        levels=[Level(id="lvl_0", name="Ground Floor", level_index=0, floor_to_floor_height_ft=10.0)],
        spaces=spaces
    )

    assert model.id.startswith("bldg_")
    assert len(model.spaces) == 2
    assert model.site.boundary.total_area_sqft == 1200

    # Test recompute metrics
    model.recompute_metrics()
    assert model.metrics.carpet_area_sqft == 508.0
    assert model.metrics.room_count == 2
    assert model.metrics.ground_coverage_percent > 0


def test_site_buildable_envelope():
    site = Site(
        boundary=BoundaryPolygon(
            vertices=[Point2D(x=0, y=0), Point2D(x=30, y=0), Point2D(x=30, y=40), Point2D(x=0, y=40)],
            width=30,
            length=40,
            total_area_sqft=1200
        ),
        setbacks=Setbacks(front=6, rear=5, side_left=4, side_right=4)
    )

    envelope = site.compute_buildable_envelope()
    assert len(envelope) == 4
    assert envelope[0].x == 4.0
    assert envelope[0].y == 6.0
    assert envelope[1].x == 26.0
    assert envelope[2].y == 35.0
