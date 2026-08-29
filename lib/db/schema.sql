-- ============================================================================
-- ArchAI Studio: Enterprise PostgreSQL + PostGIS Relational & Geospatial Schema
-- Fully normalized 22-table architecture with spatial indexing and versioning.
-- ============================================================================

-- Enable UUID & PostGIS Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'architect' CHECK (role IN ('architect', 'structural_engineer', 'mep_engineer', 'client', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'optimizing', 'approved', 'under_construction', 'archived')),
    building_code_jurisdiction VARCHAR(50) NOT NULL DEFAULT 'NBC_INDIA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SITES (Geospatial Point & Elevation)
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    formatted_address TEXT NOT NULL,
    coordinates GEOMETRY(Point, 4326) NOT NULL, -- EPSG:4326 WGS84 Lat/Lon
    elevation_meters NUMERIC(8, 2) DEFAULT 24.0,
    slope_gradient_percent NUMERIC(5, 2) DEFAULT 1.8,
    soil_type VARCHAR(100) NOT NULL DEFAULT 'Medium Clay',
    soil_bearing_capacity_kpa NUMERIC(8, 2) NOT NULL DEFAULT 180.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sites_spatial_coords ON sites USING GIST (coordinates);

-- 4. PLOTS (Geospatial Cadastral Polygon & Setbacks)
CREATE TABLE IF NOT EXISTS plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    boundary_polygon GEOMETRY(Polygon, 4326) NOT NULL,
    setback_envelope_polygon GEOMETRY(Polygon, 4326) NOT NULL,
    length_ft NUMERIC(8, 2) NOT NULL,
    width_ft NUMERIC(8, 2) NOT NULL,
    road_width_ft NUMERIC(8, 2) NOT NULL DEFAULT 30.0,
    road_orientation VARCHAR(20) NOT NULL DEFAULT 'South',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_plots_boundary_spatial ON plots USING GIST (boundary_polygon);

-- 5. REQUIREMENTS (Programmatic Brief)
CREATE TABLE IF NOT EXISTS requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    floors INTEGER NOT NULL DEFAULT 2,
    bedrooms INTEGER NOT NULL DEFAULT 3,
    bathrooms INTEGER NOT NULL DEFAULT 3,
    parking_capacity INTEGER NOT NULL DEFAULT 2,
    has_pooja_room BOOLEAN DEFAULT TRUE,
    has_office BOOLEAN DEFAULT TRUE,
    has_kitchen BOOLEAN DEFAULT TRUE,
    has_living BOOLEAN DEFAULT TRUE,
    target_budget_inr NUMERIC(12, 2) DEFAULT 4000000.0,
    architectural_style VARCHAR(100) DEFAULT 'Modern Sustainable'
);

-- 6. DESIGNS (Pareto Candidates)
CREATE TABLE IF NOT EXISTS designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subtitle TEXT,
    archetype VARCHAR(50) NOT NULL CHECK (archetype IN ('space_max', 'light_ventilation', 'vastu_compliant', 'budget_optimized', 'balanced')),
    pareto_rank INTEGER NOT NULL DEFAULT 1,
    space_efficiency_score NUMERIC(5, 2) NOT NULL,
    natural_light_score NUMERIC(5, 2) NOT NULL,
    ventilation_score NUMERIC(5, 2) NOT NULL,
    vastu_score NUMERIC(5, 2) NOT NULL,
    total_built_up_area_sqft NUMERIC(10, 2) NOT NULL,
    estimated_cost_inr NUMERIC(12, 2) NOT NULL,
    is_active_selection BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. DESIGN_VERSIONS (Snapshot History)
CREATE TABLE IF NOT EXISTS design_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    changelog TEXT,
    snapshot_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. FLOORS
CREATE TABLE IF NOT EXISTS floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    elevation_ft NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    total_built_area_sqft NUMERIC(10, 2) NOT NULL
);

-- 9. ROOMS (Spatial 2D Polygons)
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    polygon GEOMETRY(Polygon, 4326),
    x_offset_ft NUMERIC(8, 2) NOT NULL,
    y_offset_ft NUMERIC(8, 2) NOT NULL,
    width_ft NUMERIC(8, 2) NOT NULL,
    height_ft NUMERIC(8, 2) NOT NULL,
    area_sqft NUMERIC(8, 2) NOT NULL,
    floor_material VARCHAR(100) DEFAULT 'Vitrified Tiles',
    wall_material VARCHAR(100) DEFAULT 'Acrylic Emulsion'
);
CREATE INDEX IF NOT EXISTS idx_rooms_spatial_polygon ON rooms USING GIST (polygon);

-- 10. WALLS
CREATE TABLE IF NOT EXISTS walls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
    start_point GEOMETRY(Point, 4326) NOT NULL,
    end_point GEOMETRY(Point, 4326) NOT NULL,
    thickness_ft NUMERIC(5, 2) NOT NULL DEFAULT 0.75,
    height_ft NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
    is_exterior BOOLEAN DEFAULT FALSE,
    material VARCHAR(100) DEFAULT 'AAC Blockwork 9 Inch'
);

-- 11. DOORS
CREATE TABLE IF NOT EXISTS doors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    tag VARCHAR(20) NOT NULL,
    width_ft NUMERIC(5, 2) NOT NULL DEFAULT 3.0,
    height_ft NUMERIC(5, 2) NOT NULL DEFAULT 7.0,
    sill_height_ft NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    lintel_height_ft NUMERIC(5, 2) NOT NULL DEFAULT 7.0,
    material VARCHAR(100) DEFAULT 'Laminated Hardwood Flush Door'
);

-- 12. WINDOWS
CREATE TABLE IF NOT EXISTS windows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    tag VARCHAR(20) NOT NULL,
    width_ft NUMERIC(5, 2) NOT NULL DEFAULT 4.5,
    height_ft NUMERIC(5, 2) NOT NULL DEFAULT 4.5,
    sill_height_ft NUMERIC(5, 2) NOT NULL DEFAULT 3.0,
    lintel_height_ft NUMERIC(5, 2) NOT NULL DEFAULT 7.5,
    glazing_type VARCHAR(100) DEFAULT 'UPVC Low-E Double Glazed'
);

-- 13. FURNITURE
CREATE TABLE IF NOT EXISTS furniture (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    x_ft NUMERIC(8, 2) NOT NULL,
    y_ft NUMERIC(8, 2) NOT NULL,
    width_ft NUMERIC(6, 2) NOT NULL,
    depth_ft NUMERIC(6, 2) NOT NULL,
    rotation_deg NUMERIC(6, 2) DEFAULT 0.0
);

-- 14. MATERIALS (Physical & Environmental Library)
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    density_kg_m3 NUMERIC(8, 2) NOT NULL,
    unit_rate_inr NUMERIC(10, 2) NOT NULL,
    embodied_co2_kg_per_unit NUMERIC(8, 2) NOT NULL,
    thermal_conductivity_w_mk NUMERIC(6, 3) NOT NULL
);

-- 15. CONSTRAINTS (Architectural Semantic Adjacency Graph)
CREATE TABLE IF NOT EXISTS constraints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    source_room_type VARCHAR(50) NOT NULL,
    target_room_type VARCHAR(50) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    weight INTEGER NOT NULL DEFAULT 10
);

-- 16. RULES (Statutory Municipal Bye-Laws)
CREATE TABLE IF NOT EXISTS rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jurisdiction VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    rule_code VARCHAR(100) NOT NULL,
    parameter_name VARCHAR(100) NOT NULL,
    min_value NUMERIC(10, 2),
    max_value NUMERIC(10, 2),
    mandatory_clause_citation TEXT
);

-- 17. BOQ (Parametric Quantity Takeoff Items)
CREATE TABLE IF NOT EXISTS boq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    item_name TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    unit_rate_inr NUMERIC(10, 2) NOT NULL,
    total_amount_inr NUMERIC(12, 2) NOT NULL
);

-- 18. COSTS (Financial Breakdown & Regional Rates)
CREATE TABLE IF NOT EXISTS costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
    direct_subtotal_inr NUMERIC(12, 2) NOT NULL,
    contractor_margin_inr NUMERIC(12, 2) NOT NULL,
    contingency_inr NUMERIC(12, 2) NOT NULL,
    gst_tax_inr NUMERIC(12, 2) NOT NULL,
    grand_total_inr NUMERIC(12, 2) NOT NULL,
    cost_per_sqft_inr NUMERIC(10, 2) NOT NULL,
    region_id VARCHAR(50) NOT NULL DEFAULT 'mumbai'
);

-- 19. MODELS (Object Storage URIs for 3D Assets)
CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
    storage_uri VARCHAR(512) NOT NULL, -- e.g. "r2://models/archai_design_01.glb"
    format VARCHAR(20) NOT NULL CHECK (format IN ('glb', 'gltf', 'ifc', 'obj', 'dxf')),
    file_size_bytes BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. RENDERS (Object Storage URIs for Photorealistic Imagery)
CREATE TABLE IF NOT EXISTS renders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
    style VARCHAR(50) NOT NULL,
    storage_uri VARCHAR(512) NOT NULL, -- e.g. "r2://renders/facade_cycles_01.webp"
    prompt TEXT,
    aspect_ratio VARCHAR(10) DEFAULT '16:9',
    is_concept_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. REPORTS (Object Storage URIs for Documents)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('full_project_pdf', 'structural_report', 'compliance_certificate', 'sustainability_audit')),
    storage_uri VARCHAR(512) NOT NULL, -- e.g. "r2://reports/compliance_cert.pdf"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. JOBS (Async Background Processing Pipeline)
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('genetic_optimization', 'blender_render', 'revit_automation', 'vision_pipeline')),
    status VARCHAR(50) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    progress_percent INTEGER DEFAULT 0,
    error_log TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);
