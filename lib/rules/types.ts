import { SiteInformation, CandidateDesign, BuildingRequirements } from '@/types/architecture';
import { BuildableBoundary } from '@/lib/geometrySolver';
import { GeotechnicalAnalysis } from '@/lib/api/elevationApi';

export type ComplianceStatus = 'PASS' | 'FAIL' | 'WARNING' | 'UNKNOWN';

export type RuleCategory =
  | 'Zoning & Setbacks'
  | 'Habitability & Dimensions'
  | 'Fire & Life Safety'
  | 'Light & Ventilation'
  | 'Accessibility (Universal Design)'
  | 'Structural & Geotechnical'
  | 'Environmental & Green Cover';

export interface Jurisdiction {
  id: string;
  name: string;
  country: string;
  state?: string;
  city?: string;
  defaultRegulationVersion: string;
}

export interface RegulationVersion {
  id: string;
  jurisdictionId: string;
  code: string;
  title: string;
  effectiveDate: string;
  status: 'active' | 'superseded' | 'draft';
}

export interface RuleEvaluationResult {
  ruleId: string;
  code: string;
  category: RuleCategory;
  title: string;
  status: ComplianceStatus;
  requiredValue: string;
  actualValue: string;
  details: string;
  clauseReference: string;
  remediation?: string;
}

export interface EvaluationContext {
  site: SiteInformation;
  design: CandidateDesign;
  requirements: BuildingRequirements;
  geo: BuildableBoundary;
  geotech?: GeotechnicalAnalysis | null;
}

export interface RuleDefinition {
  id: string;
  code: string;
  category: RuleCategory;
  title: string;
  description: string;
  clauseReference: string;
  jurisdictionIds: string[]; // ['*'] for all, or specific jurisdiction IDs
  buildingTypes: Array<'residential' | 'commercial' | 'duplex' | 'villa' | 'all'>;
  evaluate: (ctx: EvaluationContext) => RuleEvaluationResult;
}
