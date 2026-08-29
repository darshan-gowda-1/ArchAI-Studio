FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for GEOS, GDAL, and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgeos-dev \
    libgdal-dev \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY apps/api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy monorepo packages and integrations
COPY packages /app/packages
COPY integrations /app/integrations
COPY apps/api /app/apps/api

# Set Python path so packages and integrations are resolvable
ENV PYTHONPATH="/app:/app/packages/building-model/python:/app/packages/geometry/python:/app/packages/optimizer/python:/app/packages/boq/python:/app/packages/compliance/python"

EXPOSE 8000

CMD ["uvicorn", "apps.api.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
