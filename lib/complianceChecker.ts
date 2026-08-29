import { SiteInformation, CandidateDesign, BuildingRequirements } from '@/types/architecture';
import { calculateSiteGeometry } from './geometrySolver';
import { evaluateComplianceRules } from './rules/engine';
import { RuleEvaluationResult } from './rules/types';

export function runComplianceChecks(
  site: SiteInformation,
  design: CandidateDesign,
  requirements?: BuildingRequirements
): RuleEvaluationResult[] {
  const geo = calculateSiteGeometry(site);
  const req: BuildingRequirements = requirements || {
    floors: design.floors.length || 2,
    buildingType: 'residential',
    bedrooms: 3,
    bathrooms: 3,
    parkingCapacity: 2,
    livingRoom: true,
    diningRoom: true,
    kitchen: true,
    balcony: true,
    poojaRoom: true,
    office: true,
    garden: true,
    lift: false,
    utility: true,
    staircase: true,
    targetBudget: 4500000,
    style: 'Modern Minimal',
    familySize: 4,
    vastuCompliant: true,
  };

  return evaluateComplianceRules({
    site,
    design,
    requirements: req,
    geo,
  });
}
