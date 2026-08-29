"""
ArchAI Studio v3 - Building Metrics, Cost & Sustainability Models
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CostItem(BaseModel):
    category: str = Field(..., description="Civil, Finishes, MEP, Doors & Windows, Structural")
    sub_item: str = Field(..., description="Itemized description")
    quantity: float = Field(..., ge=0)
    unit: str = Field(..., description="sq ft, cu ft, running ft, nos, tons")
    unit_rate_inr: float = Field(..., ge=0)
    total_amount_inr: float = Field(..., ge=0)


class CostEstimate(BaseModel):
    currency: str = Field(default="INR")
    civil_structural_total_inr: float = Field(default=0.0)
    finishes_interior_total_inr: float = Field(default=0.0)
    mep_total_inr: float = Field(default=0.0)
    doors_windows_total_inr: float = Field(default=0.0)
    contingency_and_overheads_inr: float = Field(default=0.0)
    grand_total_inr: float = Field(default=0.0)
    rate_per_sqft_inr: float = Field(default=2200.0)
    itemized_boq: List[CostItem] = Field(default_factory=list)


class SustainabilityScore(BaseModel):
    green_building_rating: str = Field(default="IGBC Platinum / GRIHA 5-Star")
    daylight_compliance_percent: float = Field(default=88.5, ge=0, le=100.0)
    natural_ventilation_score: float = Field(default=92.0, ge=0, le=100.0)
    embodied_carbon_kg_co2_sqm: float = Field(default=310.0)
    annual_operational_energy_kwh_sqm: float = Field(default=68.0)
    rainwater_harvesting_efficiency_pct: float = Field(default=94.0)
    rooftop_solar_offset_percent: float = Field(default=76.0)


class BuildingMetrics(BaseModel):
    total_built_up_area_sqft: float = Field(default=0.0, ge=0)
    carpet_area_sqft: float = Field(default=0.0, ge=0)
    ground_coverage_sqft: float = Field(default=0.0, ge=0)
    ground_coverage_percent: float = Field(default=0.0, ge=0, le=100.0)
    achieved_far_fsi: float = Field(default=0.0, ge=0)
    building_height_ft: float = Field(default=0.0, ge=0)
    room_count: int = Field(default=0, ge=0)
    bedroom_count: int = Field(default=0, ge=0)
    bathroom_count: int = Field(default=0, ge=0)
    parking_slots: int = Field(default=2, ge=0)

    cost_estimate: CostEstimate = Field(default_factory=CostEstimate)
    sustainability: SustainabilityScore = Field(default_factory=SustainabilityScore)
    structural_regularity_score: float = Field(default=0.94, ge=0, le=1.0)
    nsga2_pareto_rank: int = Field(default=1, ge=1)
    overall_fitness_score: float = Field(default=94.2, ge=0, le=100.0)
