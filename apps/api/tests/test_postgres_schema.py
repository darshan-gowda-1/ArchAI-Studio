"""
ArchAI Studio v3 - PostgreSQL & PostGIS Schema & ORM Model Tests
"""

import pytest
from apps.api.app.db.models import (
    Base,
    User,
    Project,
    Site,
    BuildingModelRecord,
    LevelRecord,
    SpaceRecord,
    WallRecord,
    DoorRecord,
    WindowRecord,
    SlabRecord,
    RoofRecord,
    FurnitureRecord,
    MaterialRecord,
    ConstraintRecord,
    DesignRecord,
    OptimizationRunRecord,
    OptimizationSolutionRecord,
    BOQItemRecord,
    ComplianceRuleRecord,
    ComplianceResultRecord,
    AssetRecord,
    ExportRecord,
    JobRecord,
)


def test_23_database_tables_defined():
    tables = Base.metadata.tables

    expected_tables = [
        "users",
        "projects",
        "sites",
        "building_models",
        "levels",
        "spaces",
        "walls",
        "doors",
        "windows",
        "slabs",
        "roofs",
        "furniture",
        "materials",
        "constraints",
        "designs",
        "optimization_runs",
        "optimization_solutions",
        "boq_items",
        "compliance_rules",
        "compliance_results",
        "assets",
        "exports",
        "jobs",
    ]

    assert len(expected_tables) == 23
    for tbl in expected_tables:
        assert tbl in tables, f"Table '{tbl}' must be defined in PostgreSQL schema."


def test_spatial_table_attributes():
    site_tbl = Base.metadata.tables["sites"]
    assert "latitude" in site_tbl.columns
    assert "longitude" in site_tbl.columns
    assert "total_area_sqft" in site_tbl.columns
    assert "far_fsi" in site_tbl.columns
