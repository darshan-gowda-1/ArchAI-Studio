import {
  Jurisdiction,
  RegulationVersion,
  RuleDefinition,
  EvaluationContext,
  RuleEvaluationResult,
} from './types';
import { indiaNationalRules } from './jurisdictions/indiaNational';
import { karnatakaRules } from './jurisdictions/karnataka';
import { maharashtraRules } from './jurisdictions/maharashtra';
import { accessibilityRules } from './accessibility/universalDesign';

export const JURISDICTIONS: Jurisdiction[] = [
  {
    id: 'in-national',
    name: 'India — NBC 2016 (National Building Code)',
    country: 'India',
    defaultRegulationVersion: 'NBC-2016-VOL1',
  },
  {
    id: 'in-ka',
    name: 'Karnataka — BBMP / BMRDA Bye-Laws 2020',
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    defaultRegulationVersion: 'BBMP-2020-REV1',
  },
  {
    id: 'in-mh',
    name: 'Maharashtra — UDCPR 2020 Unified Regs',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai / Pune',
    defaultRegulationVersion: 'UDCPR-2020-REV2',
  },
  {
    id: 'us-national',
    name: 'USA — IBC 2024 (International Building Code)',
    country: 'United States',
    defaultRegulationVersion: 'IBC-2024',
  },
  {
    id: 'uk-national',
    name: 'UK — Building Regulations 2020 (Part M / K)',
    country: 'United Kingdom',
    defaultRegulationVersion: 'UK-REGS-2020',
  },
];

const ALL_RULES: RuleDefinition[] = [
  ...indiaNationalRules,
  ...karnatakaRules,
  ...maharashtraRules,
  ...accessibilityRules,
];

/**
 * Resolves active rules for the user's jurisdiction and building type, then evaluates every rule.
 */
export function evaluateComplianceRules(context: EvaluationContext): RuleEvaluationResult[] {
  const jurisdictionId = mapJurisdictionId(context.site.buildingCodeJurisdiction, context.site.locationState);
  const buildingType = context.requirements.buildingType || 'residential';

  // Filter applicable rules
  const applicableRules = ALL_RULES.filter((rule) => {
    const matchesJurisdiction = rule.jurisdictionIds.includes('*') || rule.jurisdictionIds.includes(jurisdictionId);
    const matchesType = rule.buildingTypes.includes('all') || rule.buildingTypes.includes(buildingType as any);
    return matchesJurisdiction && matchesType;
  });

  // Evaluate each rule against geometry context
  return applicableRules.map((rule) => {
    try {
      return rule.evaluate(context);
    } catch (err) {
      return {
        ruleId: rule.id,
        code: rule.code,
        category: rule.category,
        title: rule.title,
        status: 'UNKNOWN',
        requiredValue: 'Evaluation Error',
        actualValue: 'N/A',
        details: `Rule evaluation encountered an unexpected condition: ${String(err)}`,
        clauseReference: rule.clauseReference,
      };
    }
  });
}

function mapJurisdictionId(code: string, locationState?: string): string {
  const loc = (locationState || '').toLowerCase();
  if (loc.includes('bengaluru') || loc.includes('karnataka') || loc.includes('bangalore')) {
    return 'in-ka';
  }
  if (loc.includes('mumbai') || loc.includes('maharashtra') || loc.includes('pune')) {
    return 'in-mh';
  }
  if (code === 'IBC_USA' || loc.includes('austin') || loc.includes('usa') || loc.includes('united states')) {
    return 'us-national';
  }
  if (code === 'UK_BUILDING_REGS' || loc.includes('london') || loc.includes('uk')) {
    return 'uk-national';
  }
  return 'in-national';
}
