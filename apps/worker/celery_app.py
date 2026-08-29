"""
ArchAI Studio v3 - Celery Application Configuration
"""

import os

try:
    from celery import Celery
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    celery_app = Celery(
        "archai_worker",
        broker=redis_url,
        backend=redis_url,
        include=[
            "apps.worker.tasks.optimization",
            "apps.worker.tasks.geometry",
            "apps.worker.tasks.rendering",
            "apps.worker.tasks.bim",
            "apps.worker.tasks.all_tasks",
        ]
    )
    celery_app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        task_time_limit=3600,
    )
except ImportError:
    # Graceful fallback when Celery package is not installed locally
    class MockCeleryTask:
        def __init__(self, fn, bind=False, name=None):
            self.fn = fn
            self.bind = bind
            self.name = name

        def __call__(self, *args, **kwargs):
            if self.bind:
                if len(args) > 0 and (args[0] is None or hasattr(args[0], "update_state")):
                    return self.fn(*args, **kwargs)
                return self.fn(self, *args, **kwargs)
            return self.fn(*args, **kwargs)

        def delay(self, *args, **kwargs):
            return self(*args, **kwargs)

        def update_state(self, state="PROGRESS", meta=None):
            pass

    class MockCelery:
        def __init__(self, *args, **kwargs):
            self.conf = {}

        def task(self, *dargs, **dkwargs):
            def decorator(fn):
                return MockCeleryTask(fn, bind=dkwargs.get("bind", False), name=dkwargs.get("name"))
            return decorator

    celery_app = MockCelery()
