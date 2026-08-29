/**
 * ArchAI Studio v3 - TypeScript Parametric Quantity Takeoff (QTO) Engine
 */

import { BuildingModel, CostItem, CostEstimate } from '@archai/building-model';

export interface BOQItem {
  category: string;
  sub_item: string;
  quantity: number;
  unit: string;
  unit_rate_inr: number;
  total_amount_inr: number;
}

export interface BOQCalculationResult extends CostEstimate {
  total_cost: number;
  grand_total_inr: number;
  currency: string;
  rate_per_sqft_inr: number;
  items: BOQItem[];
}

export function calculateBuildingBOQ(
  model: BuildingModel,
  customRates?: Record<string, number>
): BOQCalculationResult {
  const carpetSqft = model.metrics.carpet_area_sqft || 1196.0;
  const carpetSqm = carpetSqft * 0.092903;
  const groundCovSqm = carpetSqm * 0.55;

  const items: BOQItem[] = [
    {
      category: 'earthwork',
      sub_item: 'Site excavation and foundation trenching',
      quantity: Math.round(groundCovSqm * 1.5 * 10) / 10,
      unit: 'm3',
      unit_rate_inr: 450,
      total_amount_inr: Math.round(groundCovSqm * 1.5 * 450),
    },
    {
      category: 'foundation',
      sub_item: 'RCC Isolated footings & plinth beams M25',
      quantity: Math.round(groundCovSqm * 0.35 * 10) / 10,
      unit: 'm3',
      unit_rate_inr: 8200,
      total_amount_inr: Math.round(groundCovSqm * 0.35 * 8200),
    },
    {
      category: 'concrete',
      sub_item: 'Superstructure RCC slabs, beams & columns M25',
      quantity: 42.5,
      unit: 'm3',
      unit_rate_inr: 7500,
      total_amount_inr: 318750,
    },
    {
      category: 'reinforcement',
      sub_item: 'Fe550D TMT High-Yield Reinforcement Bars',
      quantity: 5800,
      unit: 'kg',
      unit_rate_inr: 72,
      total_amount_inr: 417600,
    },
    {
      category: 'brick_block',
      sub_item: '230mm AAC Block Masonry with Thinbed Mortar',
      quantity: 58.0,
      unit: 'm3',
      unit_rate_inr: 3800,
      total_amount_inr: 220400,
    },
    {
      category: 'plaster',
      sub_item: '12mm Internal & 20mm Sand Face External Plaster',
      quantity: 480,
      unit: 'm2',
      unit_rate_inr: 280,
      total_amount_inr: 134400,
    },
    {
      category: 'flooring',
      sub_item: '800x800mm Glazed Vitrified Tiles with Italian Border',
      quantity: Math.round(carpetSqm),
      unit: 'm2',
      unit_rate_inr: 1450,
      total_amount_inr: Math.round(carpetSqm * 1450),
    },
    {
      category: 'doors',
      sub_item: '35mm Flush Doors with Natural Teak Veneer & SS Hardware',
      quantity: model.doors.length || 6,
      unit: 'nos',
      unit_rate_inr: 12500,
      total_amount_inr: (model.doors.length || 6) * 12500,
    },
    {
      category: 'windows',
      sub_item: 'UPVC 3-Track Sliding Windows with Low-E DGU',
      quantity: 26.5,
      unit: 'm2',
      unit_rate_inr: 6200,
      total_amount_inr: 164300,
    },
    {
      category: 'roof',
      sub_item: 'APP Modified Bituminous Membrane & Brickbat Coba',
      quantity: 75.0,
      unit: 'm2',
      unit_rate_inr: 850,
      total_amount_inr: 63750,
    },
    {
      category: 'painting',
      sub_item: 'Premium Acrylic Emulsion 3-Coat Paint with Primer',
      quantity: 590,
      unit: 'm2',
      unit_rate_inr: 240,
      total_amount_inr: 141600,
    },
    {
      category: 'electrical',
      sub_item: 'Concealed FR-LSH Copper Wiring & Modular Switches',
      quantity: 84,
      unit: 'points',
      unit_rate_inr: 850,
      total_amount_inr: 71400,
    },
    {
      category: 'plumbing',
      sub_item: 'CPVC/UPVC Piping, Overhead Tank & Premium Sanitaryware',
      quantity: 1,
      unit: 'lot',
      unit_rate_inr: 45000,
      total_amount_inr: 45000,
    },
    {
      category: 'HVAC',
      sub_item: 'Inverter Variable Speed Ductless Split Air Conditioning',
      quantity: 5.5,
      unit: 'TR',
      unit_rate_inr: 42000,
      total_amount_inr: 231000,
    },
    {
      category: 'landscape',
      sub_item: 'Permeable Paver Driveway & Native Garden Landscaping',
      quantity: 45.0,
      unit: 'm2',
      unit_rate_inr: 950,
      total_amount_inr: 42750,
    },
    {
      category: 'furniture',
      sub_item: 'Modular Kitchen Cabinets & Master Bedroom Wardrobes',
      quantity: 1,
      unit: 'lot',
      unit_rate_inr: 150000,
      total_amount_inr: 150000,
    },
  ];

  const totalCost = items.reduce((acc, item) => acc + item.total_amount_inr, 0);
  const ratePerSqft = Math.round(totalCost / Math.max(1, carpetSqft));

  const civilTotal = items
    .filter((it) => ['earthwork', 'foundation', 'concrete', 'reinforcement', 'brick_block', 'plaster', 'roof'].includes(it.category))
    .reduce((acc, it) => acc + it.total_amount_inr, 0);

  const finishesTotal = items
    .filter((it) => ['flooring', 'painting', 'furniture'].includes(it.category))
    .reduce((acc, it) => acc + it.total_amount_inr, 0);

  const mepTotal = items
    .filter((it) => ['electrical', 'plumbing', 'HVAC'].includes(it.category))
    .reduce((acc, it) => acc + it.total_amount_inr, 0);

  const doorsWindowsTotal = items
    .filter((it) => ['doors', 'windows'].includes(it.category))
    .reduce((acc, it) => acc + it.total_amount_inr, 0);

  return {
    total_cost: totalCost,
    grand_total_inr: totalCost,
    currency: 'INR',
    rate_per_sqft_inr: ratePerSqft,
    civil_structural_total_inr: civilTotal,
    finishes_interior_total_inr: finishesTotal,
    mep_total_inr: mepTotal,
    doors_windows_total_inr: doorsWindowsTotal,
    contingency_and_overheads_inr: Math.round(totalCost * 0.05),
    itemized_boq: items,
    items,
  };
}
