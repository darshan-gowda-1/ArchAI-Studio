"""
ArchAI Studio v3 - Asynchronous Genetic Optimization Worker Task
"""

from apps.worker.celery_app import celery_app
from packages.optimizer.python.nsga2 import run_nsga2_optimization


@celery_app.task(name="tasks.run_nsga2_optimization")
def async_run_nsga2_optimization(building_model_dict, population_size=150, generations=20):
    candidates = run_nsga2_optimization(building_model_dict, population_size, generations)
    return {
        "status": "completed",
        "candidates_count": len(candidates),
        "candidates": candidates
    }
