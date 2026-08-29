/**
 * ArchAI Studio v3 - Canonical Building Model (TypeScript)
 * Single Source of Truth for frontend, API, worker, geometry compiler, optimizer, BOQ, and BIM.
 */

import { Site, Point2D } from './site';
import {
  Level,
  Space,
  Wall,
  Opening,
  Door,
  Window,
  Column,
  Slab,
  Roof,
  Furniture,
  Material,
  BuildingSystems,
} from './elements';
import { BuildingConstraints } from './constraints';
import { BuildingMetrics } from './metrics';

export interface ProjectMetadata {
  id: string;
  name: string;
  code: string;
  client_name?: string;
  architect_name?: string;
  organization?: string;
  created_at: string;
  updated_at: string;
  version_number: number;
  status: 'draft' | 'optimizing' | 'active' | 'approved' | 'construction_ready';
  units: 'imperial_feet' | 'metric_meters';
  tags: string[];
}

export interface BuildingModel {
  id: string;
  project_id: string;
  project: ProjectMetadata;
  site: Site;
  levels: Level[];
  spaces: Space[];
  walls: Wall[];
  openings: Opening[];
  doors: Door[];
  windows: Window[];
  slabs: Slab[];
  columns: Column[];
  roof?: Roof | null;
  furniture: Furniture[];
  materials: Material[];
  systems: BuildingSystems;
  constraints: BuildingConstraints;
  metrics: BuildingMetrics;
  metadata: Record<string, any>;
}

/**
 * Creates a valid benchmark default BuildingModel (3BHK 2-Storey Villa on 30x40 Plot)
 */
export function createDefaultBuildingModel(overrides?: Partial<BuildingModel>): BuildingModel {
  const defaultSite: Site = {
    id: 'site_benchmark_01',
    latitude: 19.076,
    longitude: 72.8777,
    address: 'Bandra West, Mumbai, MH, India',
    climate_zone: 'Warm & Humid',
    elevation_meters: 14.0,
    slope_percentage: 1.2,
    north_angle_deg: 0,
    facing_direction: 'South',
    boundary: {
      vertices: [
        { x: 0, y: 0 },
        { x: 30, y: 0 },
        { x: 30, y: 40 },
        { x: 0, y: 40 },
      ],
      shape: 'rectangular',
      width: 30,
      length: 40,
      total_area_sqft: 1200,
    },
    roads: [
      {
        id: 'road_main_01',
        name: 'South Avenue (30ft R.O.W.)',
        side: 'South',
        road_width_ft: 30,
        is_main_road: true,
        line_geometry: [
          { x: -10, y: -5 },
          { x: 40, y: -5 },
        ],
      },
    ],
    setbacks: {
      front: 6,
      rear: 5,
      side_left: 4,
      side_right: 4,
    },
    far_fsi: 2.0,
    ground_coverage_max_pct: 60.0,
    maximum_height_ft: 36.0,
    solar_data: {
      annual_solar_flux_kwh_m2: 1820.0,
      peak_sun_hours_daily: 5.5,
      optimal_pv_tilt_deg: 19.0,
      optimal_pv_azimuth_deg: 180.0,
      rooftop_solar_capacity_kw: 8.5,
    },
    buildable_footprint: [
      { x: 4, y: 6 },
      { x: 26, y: 6 },
      { x: 26, y: 35 },
      { x: 4, y: 35 },
    ],
  };

  const defaultLevels: Level[] = [
    {
      id: 'lvl_0',
      name: 'Ground Floor (Level 0)',
      level_index: 0,
      elevation_ft: 0.0,
      floor_to_floor_height_ft: 10.0,
      slab_id: 'slab_lvl_0',
    },
    {
      id: 'lvl_1',
      name: 'First Floor (Level 1)',
      level_index: 1,
      elevation_ft: 10.0,
      floor_to_floor_height_ft: 10.0,
      slab_id: 'slab_lvl_1',
    },
  ];

  const defaultSpaces: Space[] = [
    // Ground Floor
    {
      id: 'spc_foyer_01',
      name: 'Entry Foyer',
      type: 'foyer',
      level_index: 0,
      polygon_2d: [
        { x: 4, y: 6 },
        { x: 12, y: 6 },
        { x: 12, y: 12 },
        { x: 4, y: 12 },
      ],
      area_sqft: 48,
      ceiling_height_ft: 9.5,
      target_area_sqft: 50,
      finishes: {
        flooring_material: 'Italian Statuario Marble',
        wall_finish: 'Textured Stucco Accent',
        ceiling_finish: 'Gypsum False Ceiling',
        skirting_height_inches: 4,
      },
      requires_ventilation: true,
      daylight_factor_target: 2.0,
      furniture_ids: ['furn_shoe_rack'],
    },
    {
      id: 'spc_living_01',
      name: 'Living & Family Lounge',
      type: 'living_room',
      level_index: 0,
      polygon_2d: [
        { x: 12, y: 6 },
        { x: 26, y: 6 },
        { x: 26, y: 22 },
        { x: 12, y: 22 },
      ],
      area_sqft: 224,
      ceiling_height_ft: 9.5,
      target_area_sqft: 220,
      finishes: {
        flooring_material: 'Engineered Hardwood Walnut',
        wall_finish: 'Low VOC Matte Emulsion',
        ceiling_finish: 'Acoustic Wood Paneling',
        skirting_height_inches: 4,
      },
      requires_ventilation: true,
      daylight_factor_target: 3.5,
      furniture_ids: ['furn_sofa_3seater', 'furn_coffee_table', 'furn_tv_unit'],
    },
    {
      id: 'spc_dining_01',
      name: 'Dining Area',
      type: 'dining',
      level_index: 0,
      polygon_2d: [
        { x: 4, y: 12 },
        { x: 12, y: 12 },
        { x: 12, y: 22 },
        { x: 4, y: 22 },
      ],
      area_sqft: 80,
      ceiling_height_ft: 9.5,
      target_area_sqft: 80,
      finishes: {
        flooring_material: 'Vitrified Glazed Tiles (800x1600mm)',
        wall_finish: 'Silk Emulsion',
        ceiling_finish: 'Recessed Linear Coves',
        skirting_height_inches: 4,
      },
      requires_ventilation: true,
      daylight_factor_target: 2.5,
      furniture_ids: ['furn_dining_6seater'],
    },
    {
      id: 'spc_kitchen_01',
      name: 'Gourmet Kitchen',
      type: 'kitchen',
      level_index: 0,
      polygon_2d: [
        { x: 4, y: 22 },
        { x: 14, y: 22 },
        { x: 14, y: 35 },
        { x: 4, y: 35 },
      ],
      area_sqft: 130,
      ceiling_height_ft: 9.5,
      target_area_sqft: 125,
      finishes: {
        flooring_material: 'Anti-Skid Full Body Porcelain',
        wall_finish: 'Quartz Slab Backsplash',
        ceiling_finish: 'Moisture Resistant Gypsum',
        skirting_height_inches: 4,
      },
      requires_ventilation: true,
      daylight_factor_target: 2.8,
      furniture_ids: ['furn_kitchen_island', 'furn_gas_hob'],
    },
    {
      id: 'spc_powder_01',
      name: 'Powder Room & Bath',
      type: 'bathroom',
      level_index: 0,
      polygon_2d: [
        { x: 14, y: 22 },
        { x: 20, y: 22 },
        { x: 20, y: 28 },
        { x: 14, y: 28 },
      ],
      area_sqft: 36,
      ceiling_height_ft: 8.5,
      target_area_sqft: 36,
      finishes: {
        flooring_material: 'Matte Slate Grey Tile',
        wall_finish: 'Full Height Ceramic Dado',
        ceiling_finish: 'Moisture Board',
        skirting_height_inches: 0,
      },
      requires_ventilation: true,
      daylight_factor_target: 1.5,
      furniture_ids: ['furn_washbasin', 'furn_wc'],
    },
    {
      id: 'spc_home_office_01',
      name: 'Home Office / Study',
      type: 'home_office',
      level_index: 0,
      polygon_2d: [
        { x: 20, y: 22 },
        { x: 26, y: 22 },
        { x: 26, y: 35 },
        { x: 20, y: 35 },
      ],
      area_sqft: 78,
      ceiling_height_ft: 9.5,
      target_area_sqft: 80,
      finishes: {
        flooring_material: 'Acoustic Oak Parquet',
        wall_finish: 'Warm Grey Matte',
        ceiling_finish: 'Direct LED Troffers',
        skirting_height_inches: 4,
      },
      requires_ventilation: true,
      daylight_factor_target: 3.0,
      furniture_ids: ['furn_workdesk', 'furn_ergonomic_chair', 'furn_bookshelf'],
    },

    // First Floor
    {
      id: 'spc_master_bed_01',
      name: 'Master Suite & Walk-In',
      type: 'master_bedroom',
      level_index: 1,
      polygon_2d: [
        { x: 4, y: 6 },
        { x: 16, y: 6 },
        { x: 16, y: 22 },
        { x: 4, y: 22 },
      ],
      area_sqft: 192,
      ceiling_height_ft: 9.5,
      target_area_sqft: 190,
      finishes: {
        flooring_material: 'European White Oak Engineered Wood',
        wall_finish: 'Fluted Charcoal Wall Panel & Emulsion',
        ceiling_finish: 'Cove Lit Gypsum Ceiling',
        skirting_height_inches: 4,
      },
      requires_ventilation: true,
      daylight_factor_target: 3.2,
      furniture_ids: ['furn_king_bed', 'furn_bedside_tables', 'furn_walkin_wardrobe'],
    },
    {
      id: 'spc_master_bath_01',
      name: 'Master Ensuite Spa Bath',
      type: 'bathroom',
      level_index: 1,
      polygon_2d: [
        { x: 16, y: 6 },
        { x: 26, y: 6 },
        { x: 26, y: 14 },
        { x: 16, y: 14 },
      ],
      area_sqft: 80,
      ceiling_height_ft: 8.5,
      target_area_sqft: 75,
      finishes: {
        flooring_material: 'Honed Travertine Marble',
        wall_finish: 'Continuous Travertine Slabs',
        ceiling_finish: 'Waterproof Membrane Gypsum',
        skirting_height_inches: 0,
      },
      requires_ventilation: true,
      daylight_factor_target: 2.0,
      furniture_ids: ['furn_double_vanity', 'furn_freestanding_tub', 'furn_glass_shower'],
    },
    {
      id: 'spc_bedroom_02',
      name: 'Bedroom 2 (North Garden View)',
      type: 'bedroom',
      level_index: 1,
      polygon_2d: [
        { x: 4, y: 22 },
        { x: 15, y: 22 },
        { x: 15, y: 35 },
        { x: 4, y: 35 },
      ],
      area_sqft: 143,
      ceiling_height_ft: 9.5,
      target_area_sqft: 140,
      finishes: {
        flooring_material: 'Vitrified Tiles (Wood Pattern)',
        wall_finish: 'Matte Emulsion',
        ceiling_finish: 'Seamless Gypsum',
        skirting_height_inches: 4,
      },
      requires_ventilation: true,
      daylight_factor_target: 3.0,
      furniture_ids: ['furn_queen_bed_2', 'furn_wardrobe_2'],
    },
    {
      id: 'spc_bedroom_03',
      name: 'Bedroom 3 (East Daylight View)',
      type: 'bedroom',
      level_index: 1,
      polygon_2d: [
        { x: 15, y: 22 },
        { x: 26, y: 22 },
        { x: 26, y: 35 },
        { x: 15, y: 35 },
      ],
      area_sqft: 143,
      ceiling_height_ft: 9.5,
      target_area_sqft: 140,
      finishes: {
        flooring_material: 'Vitrified Tiles',
        wall_finish: 'Pastel Emulsion',
        ceiling_finish: 'Seamless Gypsum',
        skirting_height_inches: 4,
      },
      requires_ventilation: true,
      daylight_factor_target: 3.0,
      furniture_ids: ['furn_queen_bed_3', 'furn_wardrobe_3'],
    },
  ];

  const defaultWalls: Wall[] = [
    // Ground Floor Perimeter
    { id: 'w_g_south', level_index: 0, start_point: { x: 4, y: 6 }, end_point: { x: 26, y: 6 }, thickness_inches: 9, height_ft: 10, is_exterior: true, is_load_bearing: true, material: 'AAC Block Masonry', opening_ids: ['door_main', 'win_liv_south'] },
    { id: 'w_g_east', level_index: 0, start_point: { x: 26, y: 6 }, end_point: { x: 26, y: 35 }, thickness_inches: 9, height_ft: 10, is_exterior: true, is_load_bearing: true, material: 'AAC Block Masonry', opening_ids: ['win_liv_east', 'win_office_east'] },
    { id: 'w_g_north', level_index: 0, start_point: { x: 26, y: 35 }, end_point: { x: 4, y: 35 }, thickness_inches: 9, height_ft: 10, is_exterior: true, is_load_bearing: true, material: 'AAC Block Masonry', opening_ids: ['win_kit_north'] },
    { id: 'w_g_west', level_index: 0, start_point: { x: 4, y: 35 }, end_point: { x: 4, y: 6 }, thickness_inches: 9, height_ft: 10, is_exterior: true, is_load_bearing: true, material: 'AAC Block Masonry', opening_ids: ['win_din_west'] },

    // Ground Floor Interior
    { id: 'w_g_int_01', level_index: 0, start_point: { x: 12, y: 6 }, end_point: { x: 12, y: 22 }, thickness_inches: 4.5, height_ft: 10, is_exterior: false, is_load_bearing: false, material: 'AAC Partition Block', opening_ids: ['door_foyer_liv'] },
    { id: 'w_g_int_02', level_index: 0, start_point: { x: 4, y: 22 }, end_point: { x: 26, y: 22 }, thickness_inches: 4.5, height_ft: 10, is_exterior: false, is_load_bearing: false, material: 'AAC Partition Block', opening_ids: ['door_kit', 'door_office'] },
    { id: 'w_g_int_03', level_index: 0, start_point: { x: 14, y: 22 }, end_point: { x: 14, y: 35 }, thickness_inches: 4.5, height_ft: 10, is_exterior: false, is_load_bearing: false, material: 'AAC Partition Block', opening_ids: [] },
    { id: 'w_g_int_04', level_index: 0, start_point: { x: 20, y: 22 }, end_point: { x: 20, y: 35 }, thickness_inches: 4.5, height_ft: 10, is_exterior: false, is_load_bearing: false, material: 'AAC Partition Block', opening_ids: ['door_bath_01'] },

    // First Floor Perimeter
    { id: 'w_f_south', level_index: 1, start_point: { x: 4, y: 6 }, end_point: { x: 26, y: 6 }, thickness_inches: 9, height_ft: 10, is_exterior: true, is_load_bearing: true, material: 'AAC Block Masonry', opening_ids: ['win_master_south'] },
    { id: 'w_f_east', level_index: 1, start_point: { x: 26, y: 6 }, end_point: { x: 26, y: 35 }, thickness_inches: 9, height_ft: 10, is_exterior: true, is_load_bearing: true, material: 'AAC Block Masonry', opening_ids: ['win_bed3_east'] },
    { id: 'w_f_north', level_index: 1, start_point: { x: 26, y: 35 }, end_point: { x: 4, y: 35 }, thickness_inches: 9, height_ft: 10, is_exterior: true, is_load_bearing: true, material: 'AAC Block Masonry', opening_ids: ['win_bed2_north'] },
    { id: 'w_f_west', level_index: 1, start_point: { x: 4, y: 35 }, end_point: { x: 4, y: 6 }, thickness_inches: 9, height_ft: 10, is_exterior: true, is_load_bearing: true, material: 'AAC Block Masonry', opening_ids: ['win_master_west'] },

    // First Floor Interior
    { id: 'w_f_int_01', level_index: 1, start_point: { x: 16, y: 6 }, end_point: { x: 16, y: 22 }, thickness_inches: 4.5, height_ft: 10, is_exterior: false, is_load_bearing: false, material: 'AAC Partition Block', opening_ids: ['door_master_bath'] },
    { id: 'w_f_int_02', level_index: 1, start_point: { x: 4, y: 22 }, end_point: { x: 26, y: 22 }, thickness_inches: 4.5, height_ft: 10, is_exterior: false, is_load_bearing: false, material: 'AAC Partition Block', opening_ids: ['door_bed2', 'door_bed3'] },
    { id: 'w_f_int_03', level_index: 1, start_point: { x: 15, y: 22 }, end_point: { x: 15, y: 35 }, thickness_inches: 4.5, height_ft: 10, is_exterior: false, is_load_bearing: false, material: 'AAC Partition Block', opening_ids: [] },
  ];

  const defaultDoors: Door[] = [
    { id: 'door_main', wall_id: 'w_g_south', level_index: 0, opening_type: 'door', offset_along_wall_ft: 3.0, width_ft: 4.0, height_ft: 8.0, sill_height_ft: 0, lintel_height_ft: 8.0, door_style: 'Pivot Teak Main Door with Smart Lock', swing_direction: 'inward_right', fire_rating_minutes: 60 },
    { id: 'door_foyer_liv', wall_id: 'w_g_int_01', level_index: 0, opening_type: 'door', offset_along_wall_ft: 4.0, width_ft: 5.0, height_ft: 8.0, sill_height_ft: 0, lintel_height_ft: 8.0, door_style: 'Full Height Double Sliding Glass Pocket Door', swing_direction: 'sliding', fire_rating_minutes: 0 },
    { id: 'door_kit', wall_id: 'w_g_int_02', level_index: 0, opening_type: 'door', offset_along_wall_ft: 5.0, width_ft: 3.25, height_ft: 7.5, sill_height_ft: 0, lintel_height_ft: 7.5, door_style: 'Frosted Glass Fluted Door', swing_direction: 'inward_left', fire_rating_minutes: 30 },
    { id: 'door_office', wall_id: 'w_g_int_02', level_index: 0, opening_type: 'door', offset_along_wall_ft: 18.0, width_ft: 3.25, height_ft: 7.5, sill_height_ft: 0, lintel_height_ft: 7.5, door_style: 'Sound-Insulated Acoustic Flush Door', swing_direction: 'inward_right', fire_rating_minutes: 0 },
    { id: 'door_bath_01', wall_id: 'w_g_int_04', level_index: 0, opening_type: 'door', offset_along_wall_ft: 2.0, width_ft: 2.75, height_ft: 7.0, sill_height_ft: 0, lintel_height_ft: 7.0, door_style: 'Waterproof WPC Flush Door', swing_direction: 'inward_left', fire_rating_minutes: 0 },
    { id: 'door_master_bath', wall_id: 'w_f_int_01', level_index: 1, opening_type: 'door', offset_along_wall_ft: 4.0, width_ft: 3.0, height_ft: 7.5, sill_height_ft: 0, lintel_height_ft: 7.5, door_style: 'Teak Veneer Sliding Door', swing_direction: 'sliding', fire_rating_minutes: 0 },
    { id: 'door_bed2', wall_id: 'w_f_int_02', level_index: 1, opening_type: 'door', offset_along_wall_ft: 5.0, width_ft: 3.25, height_ft: 7.5, sill_height_ft: 0, lintel_height_ft: 7.5, door_style: 'Flush Teak Door', swing_direction: 'inward_left', fire_rating_minutes: 0 },
    { id: 'door_bed3', wall_id: 'w_f_int_02', level_index: 1, opening_type: 'door', offset_along_wall_ft: 18.0, width_ft: 3.25, height_ft: 7.5, sill_height_ft: 0, lintel_height_ft: 7.5, door_style: 'Flush Teak Door', swing_direction: 'inward_right', fire_rating_minutes: 0 },
  ];

  const defaultWindows: Window[] = [
    { id: 'win_liv_south', wall_id: 'w_g_south', level_index: 0, opening_type: 'window', offset_along_wall_ft: 12.0, width_ft: 8.0, height_ft: 6.5, sill_height_ft: 1.5, lintel_height_ft: 8.0, window_style: 'Thermal Break Aluminum 3-Track Slider', glazing_type: 'Double Low-E Argon 6-12-6', u_value: 1.8, shgc: 0.32 },
    { id: 'win_liv_east', wall_id: 'w_g_east', level_index: 0, opening_type: 'window', offset_along_wall_ft: 5.0, width_ft: 6.0, height_ft: 6.0, sill_height_ft: 2.0, lintel_height_ft: 8.0, window_style: 'Picture Window with Side Casements', glazing_type: 'Double Low-E', u_value: 2.0, shgc: 0.35 },
    { id: 'win_office_east', wall_id: 'w_g_east', level_index: 0, opening_type: 'window', offset_along_wall_ft: 20.0, width_ft: 5.0, height_ft: 5.0, sill_height_ft: 3.0, lintel_height_ft: 8.0, window_style: 'Acoustic Double Glazed Casement', glazing_type: 'Laminated Acoustic Glass', u_value: 2.1, shgc: 0.34 },
    { id: 'win_kit_north', wall_id: 'w_g_north', level_index: 0, opening_type: 'window', offset_along_wall_ft: 6.0, width_ft: 5.0, height_ft: 3.5, sill_height_ft: 3.5, lintel_height_ft: 7.0, window_style: 'Kitchen Countertop Awning Window', glazing_type: 'Clear Float Double Glazed', u_value: 2.4, shgc: 0.4 },
    { id: 'win_din_west', wall_id: 'w_g_west', level_index: 0, opening_type: 'window', offset_along_wall_ft: 8.0, width_ft: 6.0, height_ft: 6.0, sill_height_ft: 2.0, lintel_height_ft: 8.0, window_style: 'Vertical Louvered Glazed Slider', glazing_type: 'Tinted Solar Control', u_value: 2.2, shgc: 0.28 },
    { id: 'win_master_south', wall_id: 'w_f_south', level_index: 1, opening_type: 'window', offset_along_wall_ft: 4.0, width_ft: 8.0, height_ft: 6.5, sill_height_ft: 1.5, lintel_height_ft: 8.0, window_style: 'French Balcony Slider', glazing_type: 'Double Low-E Acoustic', u_value: 1.8, shgc: 0.32 },
    { id: 'win_master_west', wall_id: 'w_f_west', level_index: 1, opening_type: 'window', offset_along_wall_ft: 6.0, width_ft: 5.0, height_ft: 5.0, sill_height_ft: 3.0, lintel_height_ft: 8.0, window_style: 'Deep Recessed Shaded Casement', glazing_type: 'Double Low-E', u_value: 2.0, shgc: 0.3 },
    { id: 'win_bed2_north', wall_id: 'w_f_north', level_index: 1, opening_type: 'window', offset_along_wall_ft: 5.0, width_ft: 6.0, height_ft: 5.5, sill_height_ft: 2.5, lintel_height_ft: 8.0, window_style: 'Garden View Sliding Window', glazing_type: 'Double Low-E', u_value: 2.0, shgc: 0.35 },
    { id: 'win_bed3_east', wall_id: 'w_f_east', level_index: 1, opening_type: 'window', offset_along_wall_ft: 20.0, width_ft: 6.0, height_ft: 5.5, sill_height_ft: 2.5, lintel_height_ft: 8.0, window_style: 'Morning Sunlight Sliding Window', glazing_type: 'Double Low-E High Solar Gain', u_value: 2.0, shgc: 0.45 },
  ];

  const defaultColumns: Column[] = [
    { id: 'col_01', level_index: 0, position: { x: 4, y: 6 }, width_inches: 9, depth_inches: 15, height_ft: 10, material: 'M25 RCC', is_structural_grid_aligned: true },
    { id: 'col_02', level_index: 0, position: { x: 14, y: 6 }, width_inches: 9, depth_inches: 15, height_ft: 10, material: 'M25 RCC', is_structural_grid_aligned: true },
    { id: 'col_03', level_index: 0, position: { x: 26, y: 6 }, width_inches: 9, depth_inches: 15, height_ft: 10, material: 'M25 RCC', is_structural_grid_aligned: true },
    { id: 'col_04', level_index: 0, position: { x: 4, y: 22 }, width_inches: 9, depth_inches: 15, height_ft: 10, material: 'M25 RCC', is_structural_grid_aligned: true },
    { id: 'col_05', level_index: 0, position: { x: 14, y: 22 }, width_inches: 9, depth_inches: 15, height_ft: 10, material: 'M25 RCC', is_structural_grid_aligned: true },
    { id: 'col_06', level_index: 0, position: { x: 26, y: 22 }, width_inches: 9, depth_inches: 15, height_ft: 10, material: 'M25 RCC', is_structural_grid_aligned: true },
    { id: 'col_07', level_index: 0, position: { x: 4, y: 35 }, width_inches: 9, depth_inches: 15, height_ft: 10, material: 'M25 RCC', is_structural_grid_aligned: true },
    { id: 'col_08', level_index: 0, position: { x: 14, y: 35 }, width_inches: 9, depth_inches: 15, height_ft: 10, material: 'M25 RCC', is_structural_grid_aligned: true },
    { id: 'col_09', level_index: 0, position: { x: 26, y: 35 }, width_inches: 9, depth_inches: 15, height_ft: 10, material: 'M25 RCC', is_structural_grid_aligned: true },
  ];

  const defaultSlabs: Slab[] = [
    {
      id: 'slab_lvl_0',
      level_index: 0,
      boundary: [
        { x: 4, y: 6 },
        { x: 26, y: 6 },
        { x: 26, y: 35 },
        { x: 4, y: 35 },
      ],
      thickness_inches: 6,
      elevation_ft: 0.0,
      slab_type: 'Plinth Foundation & Ground RCC Slab',
      openings: [],
    },
    {
      id: 'slab_lvl_1',
      level_index: 1,
      boundary: [
        { x: 3, y: 5 }, // 1ft Cantilever Balcony Projection
        { x: 27, y: 5 },
        { x: 27, y: 35.5 },
        { x: 3, y: 35.5 },
      ],
      thickness_inches: 6,
      elevation_ft: 10.0,
      slab_type: 'First Floor Suspended RCC Slab with Balconies',
      openings: [
        [
          { x: 12, y: 16 },
          { x: 15, y: 16 },
          { x: 15, y: 22 },
          { x: 12, y: 22 },
        ], // Stair Cutout
      ],
    },
  ];

  const defaultRoof: Roof = {
    id: 'roof_main_01',
    roof_type: 'flat_terrace',
    boundary: [
      { x: 3, y: 5 },
      { x: 27, y: 5 },
      { x: 27, y: 36 },
      { x: 3, y: 36 },
    ],
    pitch_slope_degrees: 1.5,
    overhang_ft: 1.5,
    parapet_height_ft: 3.5,
    waterproofing_system: 'Polyurethane Coating with High Albedo Solar Tiles',
    solar_pv_panel_count: 14,
  };

  const defaultFurniture: Furniture[] = [
    { id: 'furn_sofa_3seater', name: 'Italian Leather 3-Seater Sofa', category: 'living', level_index: 0, position: { x: 16, y: 10, z: 0 }, rotation_yaw_deg: 0, width_ft: 7.5, depth_ft: 3.2, height_ft: 2.8, clearance_radius_ft: 3.5 },
    { id: 'furn_coffee_table', name: 'Walnut & Black Marble Coffee Table', category: 'living', level_index: 0, position: { x: 16, y: 14, z: 0 }, rotation_yaw_deg: 0, width_ft: 4.0, depth_ft: 2.5, height_ft: 1.5, clearance_radius_ft: 2.5 },
    { id: 'furn_tv_unit', name: 'Floating Fluted Acoustic Media Console', category: 'living', level_index: 0, position: { x: 25, y: 14, z: 0 }, rotation_yaw_deg: 270, width_ft: 6.5, depth_ft: 1.5, height_ft: 1.8, clearance_radius_ft: 3.0 },
    { id: 'furn_dining_6seater', name: 'Solid Teak 6-Seater Dining Set', category: 'dining', level_index: 0, position: { x: 8, y: 17, z: 0 }, rotation_yaw_deg: 90, width_ft: 6.0, depth_ft: 3.5, height_ft: 2.6, clearance_radius_ft: 3.0 },
    { id: 'furn_kitchen_island', name: 'Quartz Countertop Kitchen Island', category: 'kitchen', level_index: 0, position: { x: 9, y: 28, z: 0 }, rotation_yaw_deg: 0, width_ft: 6.5, depth_ft: 3.0, height_ft: 3.0, clearance_radius_ft: 3.5 },
    { id: 'furn_workdesk', name: 'L-Shaped Executive Solid Wood Desk', category: 'office', level_index: 0, position: { x: 23, y: 29, z: 0 }, rotation_yaw_deg: 180, width_ft: 5.5, depth_ft: 3.0, height_ft: 2.5, clearance_radius_ft: 3.0 },
    { id: 'furn_king_bed', name: 'King Platform Bed with Upholstered Headboard', category: 'bedroom', level_index: 1, position: { x: 10, y: 14, z: 10 }, rotation_yaw_deg: 0, width_ft: 6.5, depth_ft: 6.8, height_ft: 3.5, clearance_radius_ft: 3.5 },
    { id: 'furn_queen_bed_2', name: 'Queen Bed with Integrated Storage', category: 'bedroom', level_index: 1, position: { x: 9, y: 28, z: 10 }, rotation_yaw_deg: 0, width_ft: 5.2, depth_ft: 6.5, height_ft: 3.2, clearance_radius_ft: 3.0 },
    { id: 'furn_queen_bed_3', name: 'Queen Bed with Fabric Backrest', category: 'bedroom', level_index: 1, position: { x: 20, y: 28, z: 10 }, rotation_yaw_deg: 0, width_ft: 5.2, depth_ft: 6.5, height_ft: 3.2, clearance_radius_ft: 3.0 },
  ];

  const totalCarpetArea = defaultSpaces.reduce((sum, s) => sum + s.area_sqft, 0);
  const totalBuiltUpArea = Math.round(totalCarpetArea * 1.15);

  const model: BuildingModel = {
    id: 'bldg_archai_v3_benchmark',
    project_id: 'proj_archai_residence_v3',
    project: {
      id: 'proj_archai_residence_v3',
      name: 'ArchAI Modern Eco-Villa (3BHK + Office)',
      code: 'ARCH-2026-V3',
      client_name: 'Sustainable Living Group',
      architect_name: 'ArchAI Autonomous Studio',
      organization: 'ArchAI Global',
      created_at: '2026-08-28T12:00:00Z',
      updated_at: '2026-08-28T12:00:00Z',
      version_number: 3,
      status: 'active',
      units: 'imperial_feet',
      tags: ['residential', '3bhk', 'sustainable', 'solar-ready', 'nbc-compliant'],
    },
    site: defaultSite,
    levels: defaultLevels,
    spaces: defaultSpaces,
    walls: defaultWalls,
    openings: [],
    doors: defaultDoors,
    windows: defaultWindows,
    slabs: defaultSlabs,
    columns: defaultColumns,
    roof: defaultRoof,
    furniture: defaultFurniture,
    materials: [
      { id: 'mat_aac', name: 'Autoclaved Aerated Concrete Blocks', category: 'masonry', unit_cost_usd: 65, embodied_carbon_kg_co2_unit: 180, density_kg_m3: 650 },
      { id: 'mat_rcc', name: 'M25 Reinforced Cement Concrete', category: 'structure', unit_cost_usd: 110, embodied_carbon_kg_co2_unit: 340, density_kg_m3: 2400 },
      { id: 'mat_glass_lowe', name: 'Double Low-E High Performance Glass', category: 'glazing', unit_cost_usd: 85, embodied_carbon_kg_co2_unit: 95, density_kg_m3: 2500 },
    ],
    systems: {
      mep_electrical_capacity_kw: 14.0,
      plumbing_water_tank_capacity_liters: 5000.0,
      rainwater_harvesting_tank_liters: 8000.0,
      hvac_cooling_tonnage: 6.0,
      solar_pv_kw: 9.2,
    },
    constraints: {
      jurisdiction_code: 'NBC_2016_INDIA',
      max_building_height_ft: 36.0,
      max_far_fsi: 2.0,
      max_ground_coverage_percent: 60.0,
      min_habitable_room_area_sqft: 100.0,
      min_habitable_room_width_ft: 9.0,
      min_ceiling_height_ft: 9.0,
      min_window_area_ratio: 0.10,
      budget_cap_inr: 4500000,
      wheelchair_corridor_width_min_ft: 3.5,
      adjacencies: [
        { space_a_type: 'kitchen', space_b_type: 'dining', required_adjacency: 'direct', priority_weight: 1.5 },
        { space_a_type: 'living_room', space_b_type: 'foyer', required_adjacency: 'adjacent', priority_weight: 1.2 },
        { space_a_type: 'master_bedroom', space_b_type: 'bathroom', required_adjacency: 'direct', priority_weight: 1.8 },
      ],
    },
    metrics: {
      total_built_up_area_sqft: totalBuiltUpArea,
      carpet_area_sqft: totalCarpetArea,
      ground_coverage_sqft: 598,
      ground_coverage_percent: 49.8,
      achieved_far_fsi: 1.28,
      building_height_ft: 20.0,
      room_count: 10,
      bedroom_count: 3,
      bathroom_count: 2,
      parking_slots: 2,
      cost_estimate: {
        currency: 'INR',
        civil_structural_total_inr: 1720000,
        finishes_interior_total_inr: 1080000,
        mep_total_inr: 520000,
        doors_windows_total_inr: 480000,
        contingency_and_overheads_inr: 180000,
        grand_total_inr: 3980000,
        rate_per_sqft_inr: 2580,
        itemized_boq: [
          { category: 'Civil & Foundation', sub_item: 'RCC Footings & Columns M25', quantity: 28.5, unit: 'cu m', unit_rate_inr: 7800, total_amount_inr: 222300 },
          { category: 'Civil & Foundation', sub_item: 'AAC Blockwork 200mm Exterior', quantity: 1850, unit: 'sq ft', unit_rate_inr: 145, total_amount_inr: 268250 },
          { category: 'Civil & Foundation', sub_item: 'AAC Blockwork 100mm Partition', quantity: 1240, unit: 'sq ft', unit_rate_inr: 95, total_amount_inr: 117800 },
          { category: 'Structural Slabs', sub_item: 'RCC Two-Way Floor Slab 150mm', quantity: 1540, unit: 'sq ft', unit_rate_inr: 320, total_amount_inr: 492800 },
          { category: 'Doors & Windows', sub_item: 'UPVC Sliding Thermal Windows Low-E', quantity: 380, unit: 'sq ft', unit_rate_inr: 750, total_amount_inr: 285000 },
          { category: 'Doors & Windows', sub_item: 'Solid Teak & Veneer Doors', quantity: 8, unit: 'nos', unit_rate_inr: 24000, total_amount_inr: 192000 },
          { category: 'Finishes & Flooring', sub_item: 'Italian Marble & Engineered Oak', quantity: 1100, unit: 'sq ft', unit_rate_inr: 380, total_amount_inr: 418000 },
          { category: 'MEP Systems', sub_item: 'Concealed Conduit Electrical & Smart DB', quantity: 1, unit: 'lot', unit_rate_inr: 240000, total_amount_inr: 240000 },
          { category: 'MEP Systems', sub_item: 'CPVC/UPVC Plumbing & Sanitary Fixtures', quantity: 1, unit: 'lot', unit_rate_inr: 280000, total_amount_inr: 280000 },
          { category: 'Sustainability', sub_item: '9.2 kW Rooftop Solar PV System', quantity: 14, unit: 'panels', unit_rate_inr: 32000, total_amount_inr: 448000 },
        ],
      },
      sustainability: {
        green_building_rating: 'IGBC Platinum / GRIHA 5-Star',
        daylight_compliance_percent: 91.4,
        natural_ventilation_score: 94.0,
        embodied_carbon_kg_co2_sqm: 295.0,
        annual_operational_energy_kwh_sqm: 62.0,
        rainwater_harvesting_efficiency_pct: 96.0,
        rooftop_solar_offset_percent: 82.5,
      },
      structural_regularity_score: 0.96,
      nsga2_pareto_rank: 1,
      overall_fitness_score: 96.4,
    },
    metadata: {
      generatedBy: 'ArchAI Studio v3 Autonomous Architecture Core',
      optimizerVersion: '3.0.0-nsga2-postgis',
      cadastralId: 'CAD-MH-MUM-400050-882',
    },
    ...overrides,
  };

  return model;
}
