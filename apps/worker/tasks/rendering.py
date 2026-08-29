"""
ArchAI Studio v3 - Asynchronous Headless Blender Cycles Rendering Task
"""

from apps.worker.celery_app import celery_app
from integrations.blender.render import BlenderRenderer


@celery_app.task(name="tasks.render_cycles_viewport")
def async_render_cycles_viewport(building_id, sun_azimuth=180.0, sun_elevation=45.0, samples=128):
    renderer = BlenderRenderer()
    result = renderer.render_cycles_frame(
        building_id=building_id,
        sun_azimuth_deg=sun_azimuth,
        sun_elevation_deg=sun_elevation,
        samples=samples
    )
    return result
