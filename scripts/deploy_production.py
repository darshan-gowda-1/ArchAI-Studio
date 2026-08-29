"""
ArchAI Studio v3 - Production Multi-Cloud Deployment Script
Validates all assets and prepares one-click deployment for:
1. Frontend Web -> Vercel (apps/web)
2. Backend REST API -> Render / Railway / AWS ECS (apps/api)
3. Background Worker -> Celery (apps/worker)
4. Database & Cache -> Managed PostGIS 16 & Redis 7
5. Storage -> S3 / Cloudflare R2
"""

import os
import sys
import subprocess
import shutil

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def check_prerequisites():
    print("=" * 75)
    print("ARCHAI STUDIO v3 -- PRODUCTION DEPLOYMENT VALIDATOR")
    print("=" * 75)

    print("\n[1] Checking Configuration Files...")
    required_files = [
        "vercel.json",
        "apps/web/vercel.json",
        "render.yaml",
        "railway.toml",
        "Procfile",
        "docker-compose.yml",
        ".env.example",
        "apps/api/requirements.txt"
    ]

    all_present = True
    for f in required_files:
        exists = os.path.exists(f)
        status = "[OK]" if exists else "[MISSING]"
        print(f"  {status:9s} {f}")
        if not exists:
            all_present = False

    if not all_present:
        print("\nERROR: Required deployment configuration files are missing.")
        return False
    print("  -> All deployment manifests verified!")
    return True


def run_deployment_summary():
    print("\n" + "=" * 75)
    print("ONE-CLICK MULTI-CLOUD DEPLOYMENT INSTRUCTIONS")
    print("=" * 75)

    print("""
---------------------------------------------------------------------------
STEP 1: FRONTEND WEB DEPLOYMENT (Vercel)
---------------------------------------------------------------------------
1. Navigate to: https://vercel.com/new
2. Import your Git repository: 'ArchAI-Studio'
3. Set 'Root Directory': apps/web (or leave root with root vercel.json)
4. Build Command: npm run build
5. Add Environment Variables:
   - NEXT_PUBLIC_API_URL: https://api.yourdomain.com/api/v1
   - NEXT_PUBLIC_API_BASE_URL: https://api.yourdomain.com/api/v1
   - NEXT_PUBLIC_WS_BASE_URL: wss://api.yourdomain.com/api/v1
6. Click 'Deploy' -> Instant Global Edge Deployment!

CLI Alternative:
  npx vercel --prod

---------------------------------------------------------------------------
STEP 2: BACKEND API & WORKER DEPLOYMENT (Render / Railway / AWS)
---------------------------------------------------------------------------
Option A: Render Blueprint (Infrastructure-as-Code)
1. Navigate to: https://dashboard.render.com/blueprints
2. Connect your Git repository.
3. Render will automatically read 'render.yaml' and launch:
   - 'archai-api' (FastAPI REST Service)
   - 'archai-worker' (Celery Background Worker)
   - 'archai-postgres' (Managed PostgreSQL 16 + PostGIS)
   - 'archai-redis' (Managed Redis Cache)
4. Click 'Apply' -> Complete Infrastructure Deployed!

Option B: Railway
1. Navigate to: https://railway.app/new
2. Deploy from GitHub Repo -> Railway automatically detects 'railway.toml' and 'Procfile'.
3. Add PostgreSQL and Redis plugins with one click.

Option C: Custom Server / Docker
  docker-compose up --build -d
---------------------------------------------------------------------------
""")
    print("=" * 75)
    print("SUCCESS: PRODUCTION DEPLOYMENT ASSETS READY FOR DEPLOY!")
    print("=" * 75)


if __name__ == "__main__":
    if check_prerequisites():
        run_deployment_summary()
