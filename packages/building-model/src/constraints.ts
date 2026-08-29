/**
 * ArchAI Studio v3 - Constraints Model (TypeScript)
 */

export interface AdjacencyConstraint {
  space_a_type: string;
  space_b_type: string;
  required_adjacency: 'direct' | 'adjacent' | 'separated' | 'forbidden';
  priority_weight: number;
}

export interface BuildingConstraints {
  jurisdiction_code: string;
  max_building_height_ft: number;
  max_far_fsi: number;
  max_ground_coverage_percent: number;
  min_habitable_room_area_sqft: number;
  min_habitable_room_width_ft: number;
  min_ceiling_height_ft: number;
  min_window_area_ratio: number;
  budget_cap_inr?: number;
  wheelchair_corridor_width_min_ft: number;
  adjacencies: AdjacencyConstraint[];
}
