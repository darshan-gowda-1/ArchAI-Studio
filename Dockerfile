# ==============================================================================
# ArchAI Studio - Enterprise Production Backend Container
# Multi-stage optimized build with GEOS, GDAL, Shapely & Uvicorn
# ==============================================================================

FROM python:3.11-slim as base

# System dependencies for GIS, GEOS, and headless rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgeos-dev \
    libgdal-dev \
    libgl1-mesa-glx \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server/ ./server/

ENV PYTHONPATH=/app
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Run FastAPI via high-concurrency Uvicorn
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
