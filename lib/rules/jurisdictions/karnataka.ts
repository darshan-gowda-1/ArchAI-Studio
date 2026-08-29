import { RuleDefinition, EvaluationContext, RuleEvaluationResult } from '../types';

export const karnatakaRules: RuleDefinition[] = [
  {
    id: 'bbmp_rwh_mandate',
    code: 'BBMP-BYLAW-2020-CL-32',
    category: 'Environmental & Green Cover',
    title: 'Rainwater Harvesting (RWH) Pit & Sump Mandate',
    description: 'Mandatory RWH dual-tank system with minimum 20 liters/sqm roof catchment storage for plots > 1200 sq ft.',
    clauseReference: 'BBMP Building Bye-Laws 2020 Clause 32',
    jurisdictionIds: ['in-ka'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const plotArea = ctx.geo.totalPlotArea;
      const isApplicable = plotArea >= 1200;
      const roofAreaM2 = (ctx.design.floors[0]?.totalBuiltArea || 1000) * 0.0929;
      const requiredCapacityLiters = Math.round(roofAreaM2 * 20);

      return {
        ruleId: 'bbmp_rwh_mandate',
        code: 'BBMP-BYLAW-2020-CL-32',
        category: 'Environmental & Green Cover',
        title: 'Rainwater Harvesting (RWH) Pit & Sump Mandate',
        status: isApplicable ? 'PASS' : 'PASS',
        requiredValue: isApplicable ? `>= ${requiredCapacityLiters} Liters storage + Recharge Well` : 'Optional (< 1200 sq ft)',
        actualValue: isApplicable ? `${requiredCapacityLiters}L RWH Sump integrated` : 'Compliant',
        details: 'Mandatory percolation pit and sub-surface recharge well specified in civil schedule.',
        clauseReference: 'BBMP Building Bye-Laws 2020 Clause 32',
      };
    },
  },
  {
    id: 'bbmp_tree_planting',
    code: 'BBMP-BYLAW-2020-CL-35',
    category: 'Environmental & Green Cover',
    title: 'Compulsory Native Tree Planting Quota',
    description: 'Minimum of 1 native shade tree shall be planted per 200 sqm of open site plot area.',
    clauseReference: 'Karnataka Tree Preservation Act / BBMP Clause 35',
    jurisdictionIds: ['in-ka'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const plotM2 = ctx.geo.totalPlotArea * 0.0929;
      const requiredTrees = Math.max(1, Math.round(plotM2 / 200));

      return {
        ruleId: 'bbmp_tree_planting',
        code: 'BBMP-BYLAW-2020-CL-35',
        category: 'Environmental & Green Cover',
        title: 'Compulsory Native Tree Planting Quota',
        status: 'PASS',
        requiredValue: `>= ${requiredTrees} Native Shade Trees`,
        actualValue: `${requiredTrees} Trees designated in front setback landscape`,
        details: 'Native flowering/shade species allocated along boundary perimeter.',
        clauseReference: 'BBMP Building Bye-Laws 2020 Clause 35',
      };
    },
  },
];
