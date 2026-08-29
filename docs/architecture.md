# ArchAI Studio v3 — Enterprise System Architecture

---

## 1. System Topology & Monorepo Design

ArchAI Studio v3 is structured as a high-performance monorepo designed for generative architectural design, constraint satisfaction, and Open BIM interoperability.

```
                           ARCHAI STUDIO V3
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
  [apps/web]                  [apps/api]                 [apps/worker]
  Next.js 14                  FastAPI Backend             Celery Task Worker
  Three.js / R3F              PostGIS + REST + WS         Redis Queue
  Zustand Canonical Store     Pydantic v2 Gateway         NSGA-II + Blender Cycles
       │                           │                           │
       └───────────────────────────┼───────────────────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
             [packages/]                    [integrations/]
        ├── building-model (SSOT)         ├── openai
        ├── geometry                      ├── google-solar
        ├── optimizer                     ├── meshy
        ├── boq                           ├── autodesk (APS)
        ├── compliance                    ├── speckle
        └── shared                        └── blender (Cycles)
```

---

## 2. Core Architectural Pillars

### I. The Canonical Building Model (Single Source of Truth)
Every subsystem (Web UI, API, Geometry Engine, NSGA-II Optimizer, BOQ, Compliance Checker, and BIM Exporter) reads and updates the exact same canonical schema `BuildingModel`. No subsystem maintains divergent representations.

### II. PostGIS Cadastral Spatial Engine
Cadastral plot boundaries, setback offsets, access road networks, and buildable envelopes are modeled using PostGIS polygons and Shapely computational geometry.

### III. Safe Requirements AI Pipeline
AI output is never permitted to mutate the database directly. All natural-language briefs pass through:
`User Brief` $\rightarrow$ `OpenAI` $\rightarrow$ `Pydantic Validation` $\rightarrow$ `Constraint Solver` $\rightarrow$ `Canonical Model` $\rightarrow$ `Database`.

### IV. Procedural Geometry & Open BIM
Replaces bounding boxes with extruded walls, parametric door/window boolean cutouts, floor/ceiling slabs, cantilever balconies, and structural columns. Directly exports standard **IFC4**, **AutoCAD DXF**, and **glTF/GLB**.
