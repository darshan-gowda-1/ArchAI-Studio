# ArchAI Studio: Enterprise Architectural Platform Architecture

---

## 1. System Topology & Architecture

```
                         ARCHAI PLATFORM
                                │
                  ┌─────────────┴──────────────┐
                  │                            │
               WEB APP                        API
                  │                            │
             Next.js 14                     FastAPI
                  │                            │
             Three.js / R3F                    │
                  │              ┌─────────────┼─────────────┐
                  │              │             │             │
                  │             AI          Geometry    Optimization
                  │          (OpenAI)       (Shapely)     (NSGA-II)
                  │              │             │             │
                  │              └─────────────┼─────────────┘
                  │                            │
                  │                    PostgreSQL / PostGIS
                  │                            │
                  │                        BIM Engine
                  │                            │
                  │             ┌──────────────┼──────────────┐
                  │             │              │              │
                  │            IFC4           APS          Speckle
                  │
                  ├───────────────────── 3D ──────────────────┐
                  │                                           │
                  │                                        Blender
                  │                                           │
                  │                                          GLB
                  │                                           │
                  └────────────────── Three.js ───────────────┘
                                               │
                                     Interactive Building
                                               │
                            ┌──────────────────┼─────────────────┐
                            ▼                  ▼                 ▼
                         Interior            Solar             Cost
                            │                  │                 │
                          Meshy          Google Solar          BOQ
                            │                  │                 │
                            └──────────────────┼─────────────────┘
                                               ▼
                                      Compliance + Reports
```

---

## 2. Locked Enterprise Technology Stack (#71)

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Three.js, React Three Fiber, Lucide | Dark cinematic architectural studio, real-time 3D viewport, GIS satellite canvas. |
| **Backend API** | Python 3.11, FastAPI, Pydantic v2, Uvicorn, httpx | High-concurrency microservices gateway, rate-limiting, and REST API. |
| **Database & GIS** | PostgreSQL 16, PostGIS, SQLAlchemy | Spatial cadastral plot polygons, project persistence, and snapshot history. |
| **Artificial Intelligence** | OpenAI (GPT-4o & Vision), Embeddings, PyTorch | Intent extraction, plot image computer vision, and structured rationale. |
| **Geometry & Optimization** | Shapely, GEOS, NSGA-II Genetic Algorithm, OR-Tools | Spatial clipping, non-overlapping room polygons, and multi-objective Pareto optimization. |
| **3D & Rendering** | Blender (Headless Cycles), Three.js, GLTF/GLB | Deterministic physical rendering, sun-ray shadows, and CAD wireframes. |
| **Open BIM** | IFC4 Schema, Autodesk Platform Services (APS), Speckle | Canonical BIM compilation, Revit cloud translation, and collaborative streams. |
| **3D Assets** | Meshy API | Text-to-3D, Image-to-3D, and textured furniture GLB assets. |
| **Geospatial & Climate** | Google Maps Platform, Google Solar API, Open-Meteo | Rooftop solar flux, DSM elevation, and 54-station climate models. |
| **Object Storage** | Cloudflare R2 / AWS S3 | Zero-binary storage for high-res GLBs, 4K renders, and PDF blueprints. |
| **Distributed Queue** | Redis, Celery | Asynchronous background workers for heavy genetic optimization and rendering. |
| **Deployment** | Vercel (Frontend), Railway / Render (Backend), Supabase (DB) | Multi-tier scalable cloud hosting. |

---

## 3. 11-Stage Development Execution Framework (#66)

1. **Stage 1 — Foundation:** PostgreSQL, PostGIS, canonical schema, FastAPI gateway, Vercel/Railway deployment.
2. **Stage 2 — Real Geometry:** Polygon plots, setbacks, buildable envelope, room polygons, doors, windows, multi-floor slabs.
3. **Stage 3 — Real Optimizer:** Room adjacency graph, non-overlapping constraints, NSGA-II multi-objective scoring (Space, Daylight, Privacy, Cost, Columns).
4. **Stage 4 — AI Requirements:** Natural language brief parsing, plot photo computer vision, structured JSON schema validation.
5. **Stage 5 — Real 3D:** Parametric walls with window/door cutouts, balconies, solar panels, Three.js lerping camera transitions.
6. **Stage 6 — Open BIM:** IFC4 building elements, Autodesk APS Revit automation, Speckle collaborative streams.
7. **Stage 7 — Interior:** 3D furniture layout, collision detection, wheelchair accessibility clearance, Meshy 3D asset generation.
8. **Stage 8 — Site Intelligence:** Google Solar API flux, terrain contour elevations, soil bearing capacity.
9. **Stage 9 — Engineering Intelligence:** RCC column regularization, vertical structural alignment, MEP (electrical, plumbing, drainage, HVAC).
10. **Stage 10 — Commercial Intelligence:** Direct geometric Quantity Takeoff (QTO), itemized BOQ, regional pricing, budget optimization.
11. **Stage 11 — Professional Outputs:** 2D floor plans, elevations, section cuts, IFC exports, DXF CAD files, executive PDF dossiers.

---

## 4. Headline Showcase Feature (#70)
### Natural-Language Constrained Architectural Redesign

* **Input Brief:**
  > *"I want a 3BHK house on a 30 × 40 plot. Keep two-car parking, give the master bedroom morning sunlight, keep the living room large, and stay below ₹40 lakh."*
* **Optimization Execution:**
  - Site analyzed $\rightarrow$ 1,200 sq ft plot with setback clipping.
  - 500 candidates synthesized $\rightarrow$ 318 valid layouts passed constraint solver.
  - NSGA-II evolved across 7 fitness functions $\rightarrow$ Top 3 Pareto-optimal designs synthesized.
* **Constrained Follow-Up Directive:**
  > *"Make the kitchen larger but don't increase the budget."*
  - Applies **Budget Lock** constraint.
  - Resizes kitchen ($+22\text{ sq ft}$), compacts utility corridor ($-22\text{ sq ft}$), reruns local optimizer, preserves ₹39.2L budget, and updates 3D model in real time.
