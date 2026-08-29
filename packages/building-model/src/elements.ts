/**
 * ArchAI Studio v3 - Building Elements (TypeScript)
 */

import { Point2D } from './site';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type SpaceType =
  | 'living_room'
  | 'master_bedroom'
  | 'bedroom'
  | 'kitchen'
  | 'dining'
  | 'bathroom'
  | 'powder_room'
  | 'home_office'
  | 'balcony'
  | 'terrace'
  | 'corridor'
  | 'foyer'
  | 'utility'
  | 'parking_garage'
  | 'staircase'
  | 'storage'
  | 'other';

export interface Level {
  id: string;
  name: string;
  level_index: number;
  elevation_ft: number;
  floor_to_floor_height_ft: number;
  slab_id?: string;
}

export interface SpaceFinishes {
  flooring_material: string;
  wall_finish: string;
  ceiling_finish: string;
  skirting_height_inches: number;
}

export interface Space {
  id: string;
  name: string;
  type: SpaceType;
  level_index: number;
  polygon_2d: Point2D[];
  area_sqft: number;
  ceiling_height_ft: number;
  target_area_sqft?: number;
  finishes: SpaceFinishes;
  requires_ventilation: boolean;
  daylight_factor_target: number;
  furniture_ids: string[];
}

export interface Wall {
  id: string;
  level_index: number;
  start_point: Point2D;
  end_point: Point2D;
  thickness_inches: number;
  height_ft: number;
  is_exterior: boolean;
  is_load_bearing: boolean;
  material: string;
  opening_ids: string[];
}

export type OpeningType = 'door' | 'window' | 'ventilator' | 'arch';

export interface Opening {
  id: string;
  wall_id: string;
  level_index: number;
  opening_type: OpeningType;
  offset_along_wall_ft: number;
  width_ft: number;
  height_ft: number;
  sill_height_ft: number;
  lintel_height_ft: number;
}

export interface Door extends Opening {
  opening_type: 'door';
  door_style: string;
  swing_direction: string;
  fire_rating_minutes: number;
}

export interface Window extends Opening {
  opening_type: 'window';
  window_style: string;
  glazing_type: string;
  u_value: number;
  shgc: number;
}

export interface Column {
  id: string;
  level_index: number;
  position: Point2D;
  width_inches: number;
  depth_inches: number;
  height_ft: number;
  material: string;
  is_structural_grid_aligned: boolean;
}

export interface Slab {
  id: string;
  level_index: number;
  boundary: Point2D[];
  thickness_inches: number;
  elevation_ft: number;
  slab_type: string;
  openings: Point2D[][];
}

export type RoofType = 'flat_terrace' | 'gable' | 'hip' | 'monoslope' | 'parapet';

export interface Roof {
  id: string;
  roof_type: RoofType;
  boundary: Point2D[];
  pitch_slope_degrees: number;
  overhang_ft: number;
  parapet_height_ft: number;
  waterproofing_system: string;
  solar_pv_panel_count: number;
}

export interface Furniture {
  id: string;
  name: string;
  category: string;
  level_index: number;
  position: Point3D;
  rotation_yaw_deg: number;
  width_ft: number;
  depth_ft: number;
  height_ft: number;
  clearance_radius_ft: number;
  asset_uri?: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit_cost_usd: number;
  embodied_carbon_kg_co2_unit: number;
  density_kg_m3: number;
  texture_url?: string;
}

export interface BuildingSystems {
  mep_electrical_capacity_kw: number;
  plumbing_water_tank_capacity_liters: number;
  rainwater_harvesting_tank_liters: number;
  hvac_cooling_tonnage: number;
  solar_pv_kw: number;
}
