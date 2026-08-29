web: uvicorn apps.api.app.main:app --host 0.0.0.0 --port $PORT
worker: celery -A apps.worker.celery_app.celery_app worker --loglevel=info --concurrency=4
