"""
ArchAI Studio v3 - SQLAlchemy 2.0 ORM Models
Relational & PostGIS Spatial Table Mappings (23 Tables)
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    BigInteger,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(String(64), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="architect")
    organization = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Project(Base):
    __tablename__ = "projects"
    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"))
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True)
    client_name = Column(String(255))
    jurisdiction = Column(String(100), default="NBC_2016_INDIA")
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Site(Base):
    __tablename__ = "sites"
    id = Column(String(64), primary_key=True)
    project_id = Column(String(64), ForeignKey("projects.id", ondelete="CASCADE"))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text)
    climate_zone = Column(String(100), default="Warm & Humid")
    elevation_meters = Column(Float, default=0.0)
    slope_pct = Column(Float, default=0.0)
    north_angle_deg = Column(Float, default=0.0)
    facing_direction = Column(String(50), default="South")
    width_ft = Column(Float, nullable=False)
    length_ft = Column(Float, nullable=False)
    total_area_sqft = Column(Float, nullable=False)
    front_setback_ft = Column(Float, default=6.0)
    rear_setback_ft = Column(Float, default=5.0)
    side_left_setback_ft = Column(Float, default=4.0)
    side_right_setback_ft = Column(Float, default=4.0)
    far_fsi = Column(Float, default=2.0)
    ground_coverage_max_pct = Column(Float, default=60.0)
    maximum_height_ft = Column(Float, default=36.0)
    solar_data = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)


class BuildingModelRecord(Base):
    __tablename__ = "building_models"
    id = Column(String(64), primary_key=True)
    project_id = Column(String(64), ForeignKey("projects.id", ondelete="CASCADE"))
    site_id = Column(String(64), ForeignKey("sites.id", ondelete="SET NULL"))
    version_number = Column(Integer, default=1)
    status = Column(String(50), default="active")
    model_json = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LevelRecord(Base):
    __tablename__ = "levels"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)
    level_index = Column(Integer, nullable=False)
    elevation_ft = Column(Float, default=0.0)
    floor_to_floor_height_ft = Column(Float, default=10.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class SpaceRecord(Base):
    __tablename__ = "spaces"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    level_id = Column(String(64), ForeignKey("levels.id", ondelete="SET NULL"))
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    area_sqft = Column(Float, nullable=False)
    target_area_sqft = Column(Float)
    ceiling_height_ft = Column(Float, default=9.5)
    polygon_2d = Column(JSONB, nullable=False)
    finishes = Column(JSONB, default={})
    requires_ventilation = Column(Boolean, default=True)
    daylight_factor_target = Column(Float, default=2.0)


class WallRecord(Base):
    __tablename__ = "walls"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    level_index = Column(Integer, default=0)
    start_x = Column(Float, nullable=False)
    start_y = Column(Float, nullable=False)
    end_x = Column(Float, nullable=False)
    end_y = Column(Float, nullable=False)
    thickness_inches = Column(Float, default=9.0)
    height_ft = Column(Float, default=10.0)
    is_exterior = Column(Boolean, default=False)
    is_load_bearing = Column(Boolean, default=False)
    material = Column(String(100), default="AAC Block Masonry")


class DoorRecord(Base):
    __tablename__ = "doors"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    wall_id = Column(String(64), ForeignKey("walls.id", ondelete="CASCADE"))
    offset_along_wall_ft = Column(Float, nullable=False)
    width_ft = Column(Float, default=3.25)
    height_ft = Column(Float, default=7.0)
    door_style = Column(String(100), default="Teak Flush Door")
    swing_direction = Column(String(50), default="inward_right")


class WindowRecord(Base):
    __tablename__ = "windows"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    wall_id = Column(String(64), ForeignKey("walls.id", ondelete="CASCADE"))
    offset_along_wall_ft = Column(Float, nullable=False)
    width_ft = Column(Float, default=5.0)
    height_ft = Column(Float, default=4.5)
    sill_height_ft = Column(Float, default=3.0)
    glazing_type = Column(String(100), default="6mm Double Glazed Low-E")
    u_value = Column(Float, default=2.4)
    shgc = Column(Float, default=0.35)


class SlabRecord(Base):
    __tablename__ = "slabs"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    level_index = Column(Integer, default=0)
    elevation_ft = Column(Float, default=0.0)
    thickness_inches = Column(Float, default=6.0)
    boundary = Column(JSONB, nullable=False)
    slab_type = Column(String(100), default="RCC Two-Way Solid Slab")


class RoofRecord(Base):
    __tablename__ = "roofs"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    roof_type = Column(String(50), default="flat_terrace")
    boundary = Column(JSONB, nullable=False)
    pitch_slope_degrees = Column(Float, default=1.5)
    parapet_height_ft = Column(Float, default=3.5)
    solar_pv_panel_count = Column(Integer, default=14)


class FurnitureRecord(Base):
    __tablename__ = "furniture"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    pos_x = Column(Float, nullable=False)
    pos_y = Column(Float, nullable=False)
    pos_z = Column(Float, nullable=False)
    rotation_yaw_deg = Column(Float, default=0.0)
    width_ft = Column(Float, nullable=False)
    depth_ft = Column(Float, nullable=False)
    height_ft = Column(Float, nullable=False)
    asset_uri = Column(Text)


class MaterialRecord(Base):
    __tablename__ = "materials"
    id = Column(String(64), primary_key=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    unit_cost_inr = Column(Float, default=0.0)
    embodied_carbon_kg_co2_unit = Column(Float, default=0.0)
    density_kg_m3 = Column(Float, default=2400.0)
    texture_url = Column(Text)


class ConstraintRecord(Base):
    __tablename__ = "constraints"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    jurisdiction_code = Column(String(100), default="NBC_2016_INDIA")
    max_building_height_ft = Column(Float, default=36.0)
    max_far_fsi = Column(Float, default=2.0)
    max_ground_coverage_pct = Column(Float, default=60.0)
    min_habitable_room_area_sqft = Column(Float, default=100.0)
    budget_cap_inr = Column(Float, default=5000000.0)
    rules_json = Column(JSONB, default={})


class DesignRecord(Base):
    __tablename__ = "designs"
    id = Column(String(64), primary_key=True)
    project_id = Column(String(64), ForeignKey("projects.id", ondelete="CASCADE"))
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="SET NULL"))
    name = Column(String(255), nullable=False)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class OptimizationRunRecord(Base):
    __tablename__ = "optimization_runs"
    id = Column(String(64), primary_key=True)
    project_id = Column(String(64), ForeignKey("projects.id", ondelete="CASCADE"))
    status = Column(String(50), default="pending")
    population_size = Column(Integer, default=16)
    generations = Column(Integer, default=10)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    metrics_summary = Column(JSONB, default={})


class OptimizationSolutionRecord(Base):
    __tablename__ = "optimization_solutions"
    id = Column(String(64), primary_key=True)
    optimization_run_id = Column(String(64), ForeignKey("optimization_runs.id", ondelete="CASCADE"))
    pareto_rank = Column(Integer, default=1)
    cost_inr = Column(Float, nullable=False)
    usable_area_sqft = Column(Float, nullable=False)
    daylight_score = Column(Float, nullable=False)
    ventilation_score = Column(Float, nullable=False)
    compliance_score = Column(Float, nullable=False)
    overall_fitness = Column(Float, nullable=False)
    solution_model_json = Column(JSONB, nullable=False)


class BOQItemRecord(Base):
    __tablename__ = "boq_items"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    category = Column(String(50), nullable=False)
    item_description = Column(Text, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    unit_rate_inr = Column(Float, nullable=False)
    total_amount_inr = Column(Float, nullable=False)


class ComplianceRuleRecord(Base):
    __tablename__ = "compliance_rules"
    id = Column(String(64), primary_key=True)
    jurisdiction = Column(String(100), default="NBC_2016_INDIA")
    category = Column(String(100), nullable=False)
    rule_code = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    required_value = Column(Text, nullable=False)
    citation = Column(Text, nullable=False)


class ComplianceResultRecord(Base):
    __tablename__ = "compliance_results"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    jurisdiction = Column(String(100), default="NBC_2016_INDIA")
    title = Column(String(255), default="Automated preliminary compliance analysis")
    disclaimer = Column(Text)
    overall_status = Column(String(50), default="COMPLIANT")
    score_percent = Column(Float, default=100.0)
    violations_json = Column(JSONB, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)


class AssetRecord(Base):
    __tablename__ = "assets"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    asset_type = Column(String(50), nullable=False)
    file_uri = Column(Text, nullable=False)
    file_size_bytes = Column(BigInteger)
    mime_type = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)


class ExportRecord(Base):
    __tablename__ = "exports"
    id = Column(String(64), primary_key=True)
    building_model_id = Column(String(64), ForeignKey("building_models.id", ondelete="CASCADE"))
    export_format = Column(String(50), nullable=False)
    status = Column(String(50), default="completed")
    download_url = Column(Text)
    file_size_bytes = Column(BigInteger)
    created_at = Column(DateTime, default=datetime.utcnow)


class JobRecord(Base):
    __tablename__ = "jobs"
    id = Column(String(64), primary_key=True)
    task_name = Column(String(100), nullable=False)
    status = Column(String(50), default="queued")
    progress_percent = Column(Integer, default=0)
    input_payload = Column(JSONB, default={})
    output_result = Column(JSONB)
    error_message = Column(Text)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
