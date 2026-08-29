"""
ArchAI Studio v3 - Asynchronous Geometry Compilation Worker Task
"""

from apps.worker.celery_app import celery_app
from packages.geometry.python.compiler import GeometryCompiler


@celery_app.task(name="tasks.compile_3d_geometry")
def async_compile_3d_geometry(building_model_dict):
    compiler = GeometryCompiler(building_model_dict)
    summary = compiler.compile_summary()
    obj_str = compiler.generate_obj_string()
    return {
        "status": "completed",
        "summary": summary,
        "obj_size_bytes": len(obj_str)
    }
