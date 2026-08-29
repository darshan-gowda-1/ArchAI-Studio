import { CandidateDesign, BOQItem, SiteInformation } from '@/types/architecture';
import { calculateParametricBOQ, ParametricBOQResult } from './boq/parametricQTOEngine';

export function calculateBOQ(
  design: CandidateDesign,
  site?: SiteInformation,
  regionId = 'mumbai'
): { items: BOQItem[]; totalCost: number; qto: ParametricBOQResult } {
  const result = calculateParametricBOQ(design, site, regionId);
  return {
    items: result.items,
    totalCost: result.totalEstimatedCost,
    qto: result,
  };
}
