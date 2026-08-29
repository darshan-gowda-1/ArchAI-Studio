"""
ArchAI Studio v3 - Asynchronous BIM Compilation Task
"""

from apps.worker.celery_app import celery_app
from integrations.blender.export_cad import CADExporter


@celery_app.task(name="tasks.export_cad_dxf")
def async_export_cad_dxf(building_model_dict):
    exporter = CADExporter()
    dxf_str = exporter.export_dxf_string(building_model_dict)
    return {
        "status": "completed",
        "dxf_size_bytes": len(dxf_str)
    }
