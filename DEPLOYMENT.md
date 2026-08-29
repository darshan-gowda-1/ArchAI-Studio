# ArchAI Studio: Enterprise Production Cloud Deployment Architecture

---

## 🏛️ Architecture Overview

```
                         VERCEL
                  (Next.js 14 Frontend)
                            │
                            │ HTTPS / WebSockets (WSS)
                            ▼
                    RAILWAY / RENDER
                 (FastAPI Backend Gateway)
                            │
        ┌───────────────────┼─────────────────────┬──────────────────┐
        ▼                   ▼                     ▼                  ▼
SUPABASE POSTGRES      UPSTASH REDIS        CLOUDFLARE R2       GPU WORKER POOL
 (PostGIS Database)    (Celery Broker)    (GLB & Render S3)    (Blender Cycles)
```

---

## 🚀 Tier 1: Frontend Deployment (Vercel)

1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. **Build Settings:**
   * **Framework Preset:** `Next.js`
   * **Build Command:** `npm run build`
   * **Output Directory:** `.next`
3. **Environment Variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1/gateway
   NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app/api/v1/ws
   ```
4. Deploy! Vercel serves the global CDN edge frontend.

---

## ⚙️ Tier 2: Backend API & Gateway Deployment (Railway / Render)

### Option A: Deploy on Railway (Recommended)
1. In [Railway](https://railway.app), create a new project from your GitHub repository.
2. Select the `Dockerfile` for the API service:
   * **Root Directory:** `/`
   * **Port:** `8000`
   * **Health Check Path:** `/`
3. **Environment Variables on Railway:**
   ```env
   PORT=8000
   APP_ENV=production
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   REDIS_URL=rediss://default:[PASSWORD]@[HOST].upstash.io:6379
   OPENAI_API_KEY=sk-proj-...
   MESHY_API_KEY=msy-...
   GOOGLE_SOLAR_API_KEY=AIzaSy...
   AUTODESK_CLIENT_ID=...
   AUTODESK_CLIENT_SECRET=...
   SPECKLE_TOKEN=...
   S3_ENDPOINT=https://[ACCOUNT_ID].r2.cloudflarestorage.com
   S3_ACCESS_KEY=...
   S3_SECRET_KEY=...
   S3_BUCKET=archai-production-models
   ```

### Option B: Deploy on Render via Blueprint
1. In [Render](https://render.com), choose **New > Blueprint**.
2. Select your repository pointing to [`render.yaml`](./render.yaml). Render will automatically spin up the FastAPI gateway, Celery worker, Redis broker, and PostgreSQL database.

---

## 🗄️ Tier 3: Relational Database & PostGIS (Supabase)

1. Create a project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and execute [`server/db/supabase_schema.sql`](./server/db/supabase_schema.sql).
4. Copy the `Transaction Connection String` (URI) into your backend `DATABASE_URL`.

---

## ☁️ Tier 4: Zero-Binary Object Storage (Cloudflare R2)

1. In [Cloudflare Dashboard](https://dash.cloudflare.com), go to **R2**.
2. Create a bucket: `archai-production-models`.
3. Generate an S3 API Token with `Object Read & Write` permissions.
4. Set `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, and `S3_BUCKET` in Railway.

---

## ⚡ Tier 5: Background Celery Compute Worker

1. In Railway or Render, spin up a second service using `Dockerfile.worker`.
2. Connect it to the same `REDIS_URL` and `DATABASE_URL`.
3. The worker will autonomously process distributed tasks:
   * `analyze_site`
   * `generate_floorplans`
   * `optimize_design` (NSGA-II)
   * `generate_3d` (Headless geometry compilation)
   * `render` (Blender Cycles)
   * `calculate_boq`
