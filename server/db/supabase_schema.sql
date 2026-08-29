-- ==============================================================================
-- ArchAI Studio - Enterprise Supabase / PostgreSQL + PostGIS Schema
-- ==============================================================================

-- Enable spatial extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    organization TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location_name TEXT,
    location_point GEOMETRY(Point, 4326),
    building_code_jurisdiction TEXT DEFAULT 'NBC_INDIA',
    status TEXT DEFAULT 'active',
    active_design_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sites & Cadastral Boundaries
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    length_feet NUMERIC NOT NULL,
    width_feet NUMERIC NOT NULL,
    shape_type TEXT DEFAULT 'rectangular',
    plot_polygon GEOMETRY(Polygon, 4326),
    setbacks JSONB NOT NULL,
    roads JSONB NOT NULL,
    soil_type TEXT DEFAULT 'Medium Clay',
    soil_bearing_capacity_kpa NUMERIC DEFAULT 180,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Programmatic Requirements
CREATE TABLE IF NOT EXISTS requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    floors INT DEFAULT 2,
    bedrooms INT DEFAULT 3,
    bathrooms INT DEFAULT 3,
    parking_capacity INT DEFAULT 2,
    target_budget NUMERIC DEFAULT 4500000,
    architectural_style TEXT DEFAULT 'Modern Minimal',
    vastu_compliant BOOLEAN DEFAULT TRUE,
    rooms_config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Candidate Architectural Designs
CREATE TABLE IF NOT EXISTS candidate_designs (
    id TEXT PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subtitle TEXT,
    generation_number INT DEFAULT 25,
    total_built_up_area NUMERIC NOT NULL,
    estimated_cost NUMERIC NOT NULL,
    cost_per_sq_ft NUMERIC NOT NULL,
    pareto_objectives JSONB NOT NULL,
    spatial_floors JSONB NOT NULL,
    structural_columns JSONB NOT NULL,
    structural_beams JSONB NOT NULL,
    provenance_metadata JSONB NOT NULL,
    glb_model_s3_url TEXT,
    ifc_file_s3_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Design Versions (Snapshot History & Diffing)
CREATE TABLE IF NOT EXISTS design_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    design_id TEXT NOT NULL,
    snapshot_payload JSONB NOT NULL,
    commit_message TEXT,
    author_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Background Optimization & Render Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    operation TEXT NOT NULL,
    status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
    stage TEXT DEFAULT 'queued',
    progress_percent INT DEFAULT 0,
    message TEXT,
    logs JSONB DEFAULT '[]'::jsonb,
    result_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for high performance geospatial & lookup queries
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects USING GIST (location_point);
CREATE INDEX IF NOT EXISTS idx_sites_polygon ON sites USING GIST (plot_polygon);
CREATE INDEX IF NOT EXISTS idx_designs_project ON candidate_designs(project_id);
CREATE INDEX IF NOT EXISTS idx_versions_project ON design_versions(project_id, version_number);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
