"""
ArchAI Studio v3 - Site Model & PostGIS Spatial Integration
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Point2D(BaseModel):
    x: float = Field(..., description="X coordinate in feet or meters")
    y: float = Field(..., description="Y coordinate in feet or meters")


class BoundaryPolygon(BaseModel):
    vertices: List[Point2D] = Field(..., min_items=3, description="Boundary polygon ordered vertices")
    shape: str = Field(default="rectangular", description="Cadastral plot geometry classifier")
    width: float = Field(..., gt=0, description="Nominal width")
    length: float = Field(..., gt=0, description="Nominal length")
    total_area_sqft: float = Field(..., gt=0, description="Total surveyed area in sq ft")

    def to_geojson(self) -> Dict[str, Any]:
        coords = [[p.x, p.y] for p in self.vertices]
        if coords and coords[0] != coords[-1]:
            coords.append(coords[0])
        return {
            "type": "Polygon",
            "coordinates": [coords]
        }


class RoadAccess(BaseModel):
    id: str = Field(..., description="Unique road identifier")
    name: Optional[str] = Field(default="Access Street")
    side: str = Field(..., description="Plot facade side")
    road_width_ft: float = Field(default=30.0, gt=0)
    is_main_road: bool = Field(default=True)
    line_geometry: Optional[List[Point2D]] = Field(default=None)


class Setbacks(BaseModel):
    front: float = Field(default=6.0, ge=0)
    rear: float = Field(default=5.0, ge=0)
    side_left: float = Field(default=4.0, ge=0)
    side_right: float = Field(default=4.0, ge=0)


class SolarData(BaseModel):
    annual_solar_flux_kwh_m2: float = Field(default=1750.0)
    peak_sun_hours_daily: float = Field(default=5.4)
    optimal_pv_tilt_deg: float = Field(default=19.0)
    optimal_pv_azimuth_deg: float = Field(default=180.0)
    rooftop_solar_capacity_kw: float = Field(default=8.5)


class Site(BaseModel):
    id: str = Field(default="site_default")
    latitude: float = Field(default=19.0760)
    longitude: float = Field(default=72.8777)
    address: Optional[str] = Field(default="Mumbai, India")
    climate_zone: str = Field(default="Warm & Humid")
    elevation_meters: float = Field(default=14.0)
    slope_percentage: float = Field(default=1.5, ge=0)
    north_angle_deg: float = Field(default=0.0, ge=0, lt=360)
    facing_direction: str = Field(default="South")

    boundary: BoundaryPolygon = Field(...)
    roads: List[RoadAccess] = Field(default_factory=list)
    setbacks: Setbacks = Field(default_factory=Setbacks)

    far_fsi: float = Field(default=2.0, gt=0)
    ground_coverage_max_pct: float = Field(default=60.0, ge=10, le=100)
    maximum_height_ft: float = Field(default=36.0, gt=0)

    solar_data: Optional[SolarData] = Field(default_factory=SolarData)
    buildable_footprint: Optional[List[Point2D]] = Field(default=None)

    def compute_buildable_envelope(self) -> List[Point2D]:
        b = self.boundary
        w = max(5.0, b.width - (self.setbacks.side_left + self.setbacks.side_right))
        l = max(5.0, b.length - (self.setbacks.front + self.setbacks.rear))
        ox = self.setbacks.side_left
        oy = self.setbacks.front
        return [
            Point2D(x=ox, y=oy),
            Point2D(x=ox + w, y=oy),
            Point2D(x=ox + w, y=oy + l),
            Point2D(x=ox, y=oy + l),
        ]
