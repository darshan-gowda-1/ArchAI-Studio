-- ArchAI Studio v3 - PostgreSQL & PostGIS Spatial Initialization
-- Comprehensive schema for 23 architectural tables with PostGIS 4326 spatial geometry

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'architect',
    organization VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    client_name VARCHAR(255),
    jurisdiction VARCHAR(100) DEFAULT 'NBC_2016_INDIA',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sites
CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    climate_zone VARCHAR(100) DEFAULT 'Warm & Humid',
    elevation_meters DOUBLE PRECISION DEFAULT 0.0,
    slope_pct DOUBLE PRECISION DEFAULT 0.0,
    north_angle_deg DOUBLE PRECISION DEFAULT 0.0,
    facing_direction VARCHAR(50) DEFAULT 'South',
    width_ft DOUBLE PRECISION NOT NULL,
    length_ft DOUBLE PRECISION NOT NULL,
    total_area_sqft DOUBLE PRECISION NOT NULL,
    front_setback_ft DOUBLE PRECISION DEFAULT 6.0,
    rear_setback_ft DOUBLE PRECISION DEFAULT 5.0,
    side_left_setback_ft DOUBLE PRECISION DEFAULT 4.0,
    side_right_setback_ft DOUBLE PRECISION DEFAULT 4.0,
    far_fsi DOUBLE PRECISION DEFAULT 2.0,
    ground_coverage_max_pct DOUBLE PRECISION DEFAULT 60.0,
    maximum_height_ft DOUBLE PRECISION DEFAULT 36.0,
    solar_data JSONB DEFAULT '{}'::jsonb,
    boundary geometry(Polygon, 4326),
    location geometry(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Building Models (Canonical Single Source of Truth)
CREATE TABLE IF NOT EXISTS building_models (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    site_id VARCHAR(64) REFERENCES sites(id) ON DELETE SET NULL,
    version_number INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active',
    model_json JSONB NOT NULL,
    footprint geometry(Polygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Levels
CREATE TABLE IF NOT EXISTS levels (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level_index INT NOT NULL,
    elevation_ft DOUBLE PRECISION DEFAULT 0.0,
    floor_to_floor_height_ft DOUBLE PRECISION DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Spaces
CREATE TABLE IF NOT EXISTS spaces (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    level_id VARCHAR(64) REFERENCES levels(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    area_sqft DOUBLE PRECISION NOT NULL,
    target_area_sqft DOUBLE PRECISION,
    ceiling_height_ft DOUBLE PRECISION DEFAULT 9.5,
    polygon_2d JSONB NOT NULL,
    finishes JSONB DEFAULT '{}'::jsonb,
    requires_ventilation BOOLEAN DEFAULT TRUE,
    daylight_factor_target DOUBLE PRECISION DEFAULT 2.0
);

-- 7. Walls
CREATE TABLE IF NOT EXISTS walls (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    level_index INT DEFAULT 0,
    start_x DOUBLE PRECISION NOT NULL,
    start_y DOUBLE PRECISION NOT NULL,
    end_x DOUBLE PRECISION NOT NULL,
    end_y DOUBLE PRECISION NOT NULL,
    thickness_inches DOUBLE PRECISION DEFAULT 9.0,
    height_ft DOUBLE PRECISION DEFAULT 10.0,
    is_exterior BOOLEAN DEFAULT FALSE,
    is_load_bearing BOOLEAN DEFAULT FALSE,
    material VARCHAR(100) DEFAULT 'AAC Block Masonry'
);

-- 8. Doors
CREATE TABLE IF NOT EXISTS doors (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    wall_id VARCHAR(64) REFERENCES walls(id) ON DELETE CASCADE,
    offset_along_wall_ft DOUBLE PRECISION NOT NULL,
    width_ft DOUBLE PRECISION DEFAULT 3.25,
    height_ft DOUBLE PRECISION DEFAULT 7.0,
    door_style VARCHAR(100) DEFAULT 'Teak Flush Door',
    swing_direction VARCHAR(50) DEFAULT 'inward_right'
);

-- 9. Windows
CREATE TABLE IF NOT EXISTS windows (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    wall_id VARCHAR(64) REFERENCES walls(id) ON DELETE CASCADE,
    offset_along_wall_ft DOUBLE PRECISION NOT NULL,
    width_ft DOUBLE PRECISION DEFAULT 5.0,
    height_ft DOUBLE PRECISION DEFAULT 4.5,
    sill_height_ft DOUBLE PRECISION DEFAULT 3.0,
    glazing_type VARCHAR(100) DEFAULT '6mm Double Glazed Low-E',
    u_value DOUBLE PRECISION DEFAULT 2.4,
    shgc DOUBLE PRECISION DEFAULT 0.35
);

-- 10. Slabs
CREATE TABLE IF NOT EXISTS slabs (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    level_index INT DEFAULT 0,
    elevation_ft DOUBLE PRECISION DEFAULT 0.0,
    thickness_inches DOUBLE PRECISION DEFAULT 6.0,
    boundary JSONB NOT NULL,
    slab_type VARCHAR(100) DEFAULT 'RCC Two-Way Solid Slab'
);

-- 11. Roofs
CREATE TABLE IF NOT EXISTS roofs (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    roof_type VARCHAR(50) DEFAULT 'flat_terrace',
    boundary JSONB NOT NULL,
    pitch_slope_degrees DOUBLE PRECISION DEFAULT 1.5,
    parapet_height_ft DOUBLE PRECISION DEFAULT 3.5,
    solar_pv_panel_count INT DEFAULT 14
);

-- 12. Furniture
CREATE TABLE IF NOT EXISTS furniture (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    pos_x DOUBLE PRECISION NOT NULL,
    pos_y DOUBLE PRECISION NOT NULL,
    pos_z DOUBLE PRECISION NOT NULL,
    rotation_yaw_deg DOUBLE PRECISION DEFAULT 0.0,
    width_ft DOUBLE PRECISION NOT NULL,
    depth_ft DOUBLE PRECISION NOT NULL,
    height_ft DOUBLE PRECISION NOT NULL,
    asset_uri TEXT
);

-- 13. Materials
CREATE TABLE IF NOT EXISTS materials (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_cost_inr DOUBLE PRECISION DEFAULT 0.0,
    embodied_carbon_kg_co2_unit DOUBLE PRECISION DEFAULT 0.0,
    density_kg_m3 DOUBLE PRECISION DEFAULT 2400.0,
    texture_url TEXT
);

-- 14. Constraints
CREATE TABLE IF NOT EXISTS constraints (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    jurisdiction_code VARCHAR(100) DEFAULT 'NBC_2016_INDIA',
    max_building_height_ft DOUBLE PRECISION DEFAULT 36.0,
    max_far_fsi DOUBLE PRECISION DEFAULT 2.0,
    max_ground_coverage_pct DOUBLE PRECISION DEFAULT 60.0,
    min_habitable_room_area_sqft DOUBLE PRECISION DEFAULT 100.0,
    budget_cap_inr DOUBLE PRECISION DEFAULT 5000000.0,
    rules_json JSONB DEFAULT '{}'::jsonb
);

-- 15. Designs
CREATE TABLE IF NOT EXISTS designs (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Optimization Runs
CREATE TABLE IF NOT EXISTS optimization_runs (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    population_size INT DEFAULT 16,
    generations INT DEFAULT 10,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    metrics_summary JSONB DEFAULT '{}'::jsonb
);

-- 17. Optimization Solutions
CREATE TABLE IF NOT EXISTS optimization_solutions (
    id VARCHAR(64) PRIMARY KEY,
    optimization_run_id VARCHAR(64) REFERENCES optimization_runs(id) ON DELETE CASCADE,
    pareto_rank INT DEFAULT 1,
    cost_inr DOUBLE PRECISION NOT NULL,
    usable_area_sqft DOUBLE PRECISION NOT NULL,
    daylight_score DOUBLE PRECISION NOT NULL,
    ventilation_score DOUBLE PRECISION NOT NULL,
    compliance_score DOUBLE PRECISION NOT NULL,
    overall_fitness DOUBLE PRECISION NOT NULL,
    solution_model_json JSONB NOT NULL
);

-- 18. BOQ Items
CREATE TABLE IF NOT EXISTS boq_items (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    item_description TEXT NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_rate_inr DOUBLE PRECISION NOT NULL,
    total_amount_inr DOUBLE PRECISION NOT NULL
);

-- 19. Compliance Rules
CREATE TABLE IF NOT EXISTS compliance_rules (
    id VARCHAR(64) PRIMARY KEY,
    jurisdiction VARCHAR(100) DEFAULT 'NBC_2016_INDIA',
    category VARCHAR(100) NOT NULL,
    rule_code VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    required_value TEXT NOT NULL,
    citation TEXT NOT NULL
);

-- 20. Compliance Results
CREATE TABLE IF NOT EXISTS compliance_results (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    jurisdiction VARCHAR(100) DEFAULT 'NBC_2016_INDIA',
    title VARCHAR(255) DEFAULT 'Automated preliminary compliance analysis',
    disclaimer TEXT,
    overall_status VARCHAR(50) DEFAULT 'COMPLIANT',
    score_percent DOUBLE PRECISION DEFAULT 100.0,
    violations_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Assets
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- 'glb', 'glb_low', 'glb_high', 'render_png', 'render_jpg'
    file_uri TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Exports
CREATE TABLE IF NOT EXISTS exports (
    id VARCHAR(64) PRIMARY KEY,
    building_model_id VARCHAR(64) REFERENCES building_models(id) ON DELETE CASCADE,
    export_format VARCHAR(50) NOT NULL, -- 'ifc4', 'dxf', 'gltf', 'obj', 'speckle', 'aps'
    status VARCHAR(50) DEFAULT 'completed',
    download_url TEXT,
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(64) PRIMARY KEY,
    task_name VARCHAR(100) NOT NULL, -- 'requirements_ai', 'optimization', 'geometry_generation', 'blender_render', etc.
    status VARCHAR(50) DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed'
    progress_percent INT DEFAULT 0,
    input_payload JSONB DEFAULT '{}'::jsonb,
    output_result JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Spatial GIST Indexes
CREATE INDEX IF NOT EXISTS idx_sites_boundary ON sites USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_sites_location ON sites USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_building_models_footprint ON building_models USING GIST (footprint);
