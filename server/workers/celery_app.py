"""
ArchAI Enterprise Celery + Redis Distributed Job Worker Configuration
"""

import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "archai_workers",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["server.workers.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300, # 5 min timeout
    worker_concurrency=4,
    task_routes={
        "server.workers.tasks.generate_3d": {"queue": "blender_queue"},
        "server.workers.tasks.render": {"queue": "blender_queue"},
        "server.workers.tasks.optimize_design": {"queue": "compute_queue"},
        "server.workers.tasks.generate_floorplans": {"queue": "compute_queue"},
    }
)
