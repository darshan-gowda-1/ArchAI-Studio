FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgeos-dev \
    libgdal-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY apps/worker/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY packages /app/packages
COPY integrations /app/integrations
COPY apps/worker /app/apps/worker

ENV PYTHONPATH="/app:/app/packages/building-model/python:/app/packages/geometry/python:/app/packages/optimizer/python:/app/packages/boq/python:/app/packages/compliance/python"

CMD ["celery", "-A", "apps.worker.celery_app", "worker", "--loglevel=info"]
