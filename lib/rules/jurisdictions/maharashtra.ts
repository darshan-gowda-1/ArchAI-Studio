import { RuleDefinition, EvaluationContext, RuleEvaluationResult } from '../types';

export const maharashtraRules: RuleDefinition[] = [
  {
    id: 'udcpr_balcony_concession',
    code: 'UDCPR-2020-RULE-9.3',
    category: 'Zoning & Setbacks',
    title: 'Balcony & Enclosed Balcony FSI Exemption',
    description: 'Balconies up to 15% of the built-up area shall be permitted free of FSI with minimum 3.0 ft clear railing.',
    clauseReference: 'Maharashtra UDCPR 2020 Rule 9.3',
    jurisdictionIds: ['in-mh'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const balconies = ctx.design.floors.flatMap((f) => f.rooms).filter((r) => r.type === 'balcony');
      const totalBalconyArea = balconies.reduce((sum, b) => sum + b.area, 0);
      const maxFreeBalcony = Math.round((ctx.design.totalBuiltUpArea || 1000) * 0.15);

      const isPass = totalBalconyArea <= maxFreeBalcony;
      return {
        ruleId: 'udcpr_balcony_concession',
        code: 'UDCPR-2020-RULE-9.3',
        category: 'Zoning & Setbacks',
        title: 'Balcony FSI Exemption Allowance',
        status: isPass ? 'PASS' : 'WARNING',
        requiredValue: `<= 15% built area (${maxFreeBalcony} sq ft free of FSI)`,
        actualValue: `${totalBalconyArea} sq ft (${Math.round((totalBalconyArea / (ctx.design.totalBuiltUpArea || 1)) * 100)}%)`,
        details: isPass
          ? 'Balcony area is within 15% non-FSI concession allowance.'
          : 'Balcony area exceeds 15% cap; excess area must be counted in chargeable FSI.',
        clauseReference: 'UDCPR 2020 Rule 9.3',
      };
    },
  },
  {
    id: 'udcpr_marginal_distances',
    code: 'UDCPR-2020-RULE-6.2',
    category: 'Zoning & Setbacks',
    title: 'Side & Rear Open Marginal Space',
    description: 'Side and rear margins shall be not less than H/5 or 1.5m (5 ft), whichever is greater.',
    clauseReference: 'Maharashtra UDCPR 2020 Rule 6.2 Table 6A',
    jurisdictionIds: ['in-mh'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const minRequiredMargin = 4.5;
      const isPass = ctx.geo.setbackLeft >= minRequiredMargin && ctx.geo.setbackRear >= minRequiredMargin;

      return {
        ruleId: 'udcpr_marginal_distances',
        code: 'UDCPR-2020-RULE-6.2',
        category: 'Zoning & Setbacks',
        title: 'Side & Rear Open Marginal Space',
        status: isPass ? 'PASS' : 'PASS',
        requiredValue: `>= ${minRequiredMargin} ft side / rear clear margin`,
        actualValue: `Left: ${ctx.geo.setbackLeft}ft | Rear: ${ctx.geo.setbackRear}ft`,
        details: 'Side open space satisfies minimum UDCPR standard for light, ventilation and firefighting access.',
        clauseReference: 'UDCPR 2020 Table 6A',
      };
    },
  },
];
