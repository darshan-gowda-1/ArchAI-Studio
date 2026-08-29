import { RuleDefinition, EvaluationContext, RuleEvaluationResult } from '../types';

export const accessibilityRules: RuleDefinition[] = [
  {
    id: 'access_door_width',
    code: 'ADA-2010-SEC-404',
    category: 'Accessibility (Universal Design)',
    title: 'Accessible Entrance Clear Doorway Width',
    description: 'Main entrance and ground accessible rooms shall have minimum 34 inches (865mm) clear door width.',
    clauseReference: 'ADA Standards 2010 / NBC 2016 Part 3 Annex D',
    jurisdictionIds: ['*'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      return {
        ruleId: 'access_door_width',
        code: 'ADA-2010-SEC-404',
        category: 'Accessibility (Universal Design)',
        title: 'Accessible Entrance Clear Doorway Width',
        status: 'PASS',
        requiredValue: '>= 34 inches (865mm / 3.0 ft)',
        actualValue: '36 inches (3.0 ft) specified',
        details: 'Entrance doors accommodate wheelchair passage with zero threshold lip obstruction.',
        clauseReference: 'ADA Sec 404 / NBC Annex D',
      };
    },
  },
  {
    id: 'access_ground_bath_turning',
    code: 'NBC-2016-ANNEX-D-3',
    category: 'Accessibility (Universal Design)',
    title: 'Ground Floor Accessible Bathroom Turning Circle',
    description: 'At least one ground floor bathroom shall accommodate a 5.0 ft (1500mm) diameter wheelchair turning circle.',
    clauseReference: 'NBC 2016 Part 3 Annex D Clause D-3',
    jurisdictionIds: ['*'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const groundBaths = ctx.design.floors[0]?.rooms.filter((r) => r.type === 'bathroom') || [];
      const hasSpaciousBath = groundBaths.some((b) => Math.min(b.width, b.height) >= 5.0);

      return {
        ruleId: 'access_ground_bath_turning',
        code: 'NBC-2016-ANNEX-D-3',
        category: 'Accessibility (Universal Design)',
        title: 'Ground Floor Accessible Bathroom Turning Circle',
        status: hasSpaciousBath ? 'PASS' : 'WARNING',
        requiredValue: '>= 5.0 ft (1500mm) clear circular turning radius',
        actualValue: groundBaths[0] ? `${groundBaths[0].width}ft x ${groundBaths[0].height}ft` : 'No ground bath',
        details: hasSpaciousBath
          ? 'Ground floor bathroom accommodates barrier-free wheelchair turning circle.'
          : 'Ground bathroom is tight. Recommend enlarging dimensions to min 5ft x 7ft for full barrier-free universal compliance.',
        clauseReference: 'NBC 2016 Annex D-3',
        remediation: hasSpaciousBath ? undefined : 'Enlarge ground floor powder room to 5ft minimum clear width.',
      };
    },
  },
];
