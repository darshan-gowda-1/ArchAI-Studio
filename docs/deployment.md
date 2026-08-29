# ArchAI Studio v3 — Production Deployment Guide

```
                 ┌──────────────┐
                 │    Vercel    │
                 │  Next.js Web │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   FastAPI    │
                 │ Render/AWS   │
                 └──────┬───────┘
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
        PostgreSQL    Redis       S3 / R2
         + PostGIS      │      (Object Store)
                        ▼
                  Celery Worker
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
          Blender     OpenAI     Meshy
```

---

## 1. Frontend Deployment (Vercel)
- **Repository Directory:** `apps/web`
- **Build Command:** `pnpm build`
- **Output Directory:** `.next`
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL`: `https://api.archai.studio/api/v1`
  - `NEXT_PUBLIC_WS_BASE_URL`: `wss://api.archai.studio/api/v1`

---

## 2. API & Workers Deployment (Render / Railway / AWS ECS)
- **API Entrypoint:** `uvicorn apps.api.app.main:app --host 0.0.0.0 --port $PORT`
- **Worker Entrypoint:** `celery -A apps.worker.celery_app.celery_app worker --loglevel=info --concurrency=4`
- **Configuration:** [`render.yaml`](file:///c:/Users/Darshan/Documents/darshan%20vscode/New%20folder/render.yaml) & [`railway.toml`](file:///c:/Users/Darshan/Documents/darshan%20vscode/New%20folder/railway.toml)

---

## 3. Managed Databases & Storage
- **PostgreSQL + PostGIS:** PostgreSQL 16 with `postgis`, `postgis_topology` extensions (initialized via `infrastructure/postgres/init.sql`).
- **Redis:** Redis 7+ for caching & Celery broker.
- **S3 / Cloudflare R2:** MinIO / AWS S3 / Cloudflare R2 bucket (`archai-studio-assets`) for GLB meshes, IFC files, 4K raytraced renders, and site survey documents.
