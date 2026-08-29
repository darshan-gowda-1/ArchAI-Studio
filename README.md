# ArchAI Studio v3 — Enterprise Generative Architecture Platform

> **ArchAI Studio v3** is a production monorepo for autonomous architectural design, multi-objective spatial layout optimization, procedural 3D geometry compilation, and Open BIM interoperability centered around a single source of truth: the **Canonical Building Model**.

---

## 1. Monorepo Structure

```
ArchAI-Studio/
│
├── apps/
│   ├── web/                         # Next.js 14 Web Studio (Three.js & 2D CAD)
│   ├── api/                         # FastAPI High-Performance Backend API
│   └── worker/                      # Celery Task Worker (NSGA-II & Rendering)
│
├── packages/
│   ├── building-model/              # Canonical Building Model (Single Source of Truth)
│   ├── geometry/                    # Geometry Compiler (Shapely, NumPy, trimesh)
│   ├── optimizer/                   # Multi-Objective NSGA-II Genetic Optimizer
│   ├── boq/                         # Parametric Quantity Take-Off & Cost Engine
│   ├── compliance/                  # NBC 2016 / IBC Statutory Compliance Engine
│   └── shared/                      # Shared types, math, GeoJSON, and utilities
│
├── infrastructure/
│   ├── docker/                      # Container definitions
│   ├── postgres/                    # PostGIS spatial tables & spatial indexing
│   ├── redis/                       # Message broker config
│   └── nginx/                       # Reverse proxy gateway
│
├── integrations/
│   ├── openai/                      # NL Requirements Parser & Conversational Redesign
│   ├── google-solar/                # Rooftop Solar Flux & GHI Irradiance
│   ├── meshy/                       # 3D Furniture & Landscaping Assets
│   ├── autodesk/                    # Autodesk Platform Services (APS) SVF Translation
│   ├── speckle/                     # Speckle Stream Publisher
│   └── blender/                     # Headless Cycles Raytracing & CAD DXF Exporter
│
├── scripts/
│   ├── seed.py                      # Database seeder
│   ├── migrate.py                   # PostGIS spatial migration runner
│   ├── generate_test_building.py    # Canonical building generator CLI
│   └── healthcheck.py               # System diagnostic healthcheck
│
├── docs/                            # Comprehensive architectural documentation
│   ├── architecture.md
│   ├── building-model.md
│   ├── geometry.md
│   ├── optimizer.md
│   ├── bim.md
│   └── deployment.md
│
├── docker-compose.yml               # Multi-container orchestration
├── package.json                     # Root pnpm workspaces config
├── pnpm-workspace.yaml
├── .env.example
├── .gitignore
└── LICENSE
```

---

## 2. The Canonical Building Model (Single Source of Truth)

All layers of the platform (Frontend Viewport, FastAPI Endpoints, Celery Workers, Shapely Geometry Engine, NSGA-II Optimizer, BOQ Calculator, Compliance Verifier, and BIM Exporter) consume and mutate the exact same **`BuildingModel`**:

```python
class BuildingModel(BaseModel):
    id: str
    project_id: str
    project: ProjectMetadata
    site: Site
    levels: list[Level]
    spaces: list[Space]
    walls: list[Wall]
    doors: list[Door]
    windows: list[Window]
    slabs: list[Slab]
    columns: list[Column]
    roof: Roof | None
    furniture: list[Furniture]
    materials: list[Material]
    systems: BuildingSystems
    constraints: BuildingConstraints
    metrics: BuildingMetrics
    metadata: dict
```

---

## 3. Core Capabilities

1. **Requirements AI with Strict Validation**:
   - Natural language briefs are parsed by OpenAI function calling into strongly typed `ValidatedRequirements` via Pydantic.
   - Constraint checks are enforced before updating the canonical model. The LLM never directly modifies the persistent database without validation.
2. **Procedural Geometry Compiler**:
   - Replaces bounding boxes with extruded walls, parametric door/window boolean cutouts, floor/ceiling slabs, cantilever balconies, and regularized column grids.
3. **Multi-Objective NSGA-II Genetic Optimizer**:
   - Synthesizes Pareto-optimal floor plan candidates balancing space area satisfaction, natural daylight, functional adjacency, privacy zoning, column alignment, and construction cost.
4. **Parametric BOQ & Quantity Take-Off**:
   - Computes direct geometric material quantities (masonry volume, concrete cubic meters, glass area, door counts) with localized schedules of rates.
5. **National Building Code (NBC 2016) Compliance**:
   - Real-time statutory verification for setbacks, FAR/FSI, room dimensions, natural light & ventilation ratios, and barrier-free wheelchair accessibility.
6. **Open BIM & CAD Interoperability**:
   - Exports standard IFC4, AutoCAD DXF, glTF/GLB, Speckle Streams, and Autodesk Platform Services (APS).

---

## 4. Quick Start & Execution

### Running the Canonical Building Generator CLI:
```bash
python scripts/generate_test_building.py
```

### Running System Diagnostic Healthcheck:
```bash
python scripts/healthcheck.py
```

### Running Python Backend Tests:
```bash
pytest apps/api/tests
```

### Running Web Studio Locally:
```bash
pnpm dev
# or
npm run dev
```

### Launching the Full Stack with Docker:
```bash
docker compose up -d --build
```
