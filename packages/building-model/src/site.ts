/**
 * ArchAI Studio v3 - Site Model (TypeScript)
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface BoundaryPolygon {
  vertices: Point2D[];
  shape: 'rectangular' | 'l_shaped' | 'corner_plot' | 'trapezoidal' | 'irregular';
  width: number;
  length: number;
  total_area_sqft: number;
}

export interface RoadAccess {
  id: string;
  name?: string;
  side: 'North' | 'South' | 'East' | 'West' | 'Front' | 'Rear' | 'Left' | 'Right';
  road_width_ft: number;
  is_main_road: boolean;
  line_geometry?: Point2D[];
}

export interface Setbacks {
  front: number;
  rear: number;
  side_left: number;
  side_right: number;
}

export interface SolarData {
  annual_solar_flux_kwh_m2: number;
  peak_sun_hours_daily: number;
  optimal_pv_tilt_deg: number;
  optimal_pv_azimuth_deg: number;
  rooftop_solar_capacity_kw: number;
}

export interface Site {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  climate_zone: string;
  elevation_meters: number;
  slope_percentage: number;
  north_angle_deg: number;
  facing_direction: string;
  boundary: BoundaryPolygon;
  roads: RoadAccess[];
  setbacks: Setbacks;
  far_fsi: number;
  ground_coverage_max_pct: number;
  maximum_height_ft: number;
  solar_data?: SolarData;
  buildable_footprint?: Point2D[];
}
