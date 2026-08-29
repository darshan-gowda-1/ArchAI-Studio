/**
 * ArchAI Studio v3 - Building Metrics, Cost & Sustainability (TypeScript)
 */

export interface CostItem {
  category: string;
  sub_item: string;
  quantity: number;
  unit: string;
  unit_rate_inr: number;
  total_amount_inr: number;
}

export interface CostEstimate {
  currency: string;
  civil_structural_total_inr: number;
  finishes_interior_total_inr: number;
  mep_total_inr: number;
  doors_windows_total_inr: number;
  contingency_and_overheads_inr: number;
  grand_total_inr: number;
  rate_per_sqft_inr: number;
  itemized_boq: CostItem[];
}

export interface SustainabilityScore {
  green_building_rating: string;
  daylight_compliance_percent: number;
  natural_ventilation_score: number;
  embodied_carbon_kg_co2_sqm: number;
  annual_operational_energy_kwh_sqm: number;
  rainwater_harvesting_efficiency_pct: number;
  rooftop_solar_offset_percent: number;
}

export interface BuildingMetrics {
  total_built_up_area_sqft: number;
  carpet_area_sqft: number;
  ground_coverage_sqft: number;
  ground_coverage_percent: number;
  achieved_far_fsi: number;
  building_height_ft: number;
  room_count: int;
  bedroom_count: int;
  bathroom_count: int;
  parking_slots: number;
  cost_estimate: CostEstimate;
  sustainability: SustainabilityScore;
  structural_regularity_score: number;
  nsga2_pareto_rank: number;
  overall_fitness_score: number;
}

type int = number;
