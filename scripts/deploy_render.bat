@echo off
echo ===================================================
echo ArchAI Studio v3 - Render Production Deployment
echo ===================================================
echo Render Blueprint manifest located at: render.yaml
echo Services configured:
echo   1. archai-api (FastAPI REST Service)
echo   2. archai-worker (Celery Background Worker)
echo   3. archai-postgres (PostgreSQL 16 + PostGIS)
echo   4. archai-redis (Redis Broker)
echo.
echo To apply blueprint, open: https://dashboard.render.com/blueprints
echo and connect this Git repository.
echo.
pause
