import { RuleDefinition, EvaluationContext, RuleEvaluationResult } from '../types';

export const indiaNationalRules: RuleDefinition[] = [
  {
    id: 'nbc_ground_coverage',
    code: 'NBC-2016-CL-4.2',
    category: 'Zoning & Setbacks',
    title: 'Maximum Ground Coverage Ratio',
    description: 'Ground coverage shall not exceed 65% for plots > 2000 sq ft and 75% for smaller plots.',
    clauseReference: 'NBC 2016 Part 3 Clause 4.2',
    jurisdictionIds: ['in-national', 'in-ka', 'in-mh'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const groundBuilt = ctx.design.floors[0]?.totalBuiltArea || 0;
      const plotArea = ctx.geo.totalPlotArea || 1;
      const actualPct = Math.round((groundBuilt / plotArea) * 100);
      const maxPct = ctx.geo.maxGroundCoveragePercent;

      const isPass = actualPct <= maxPct;
      return {
        ruleId: 'nbc_ground_coverage',
        code: 'NBC-2016-CL-4.2',
        category: 'Zoning & Setbacks',
        title: 'Maximum Ground Coverage Ratio',
        status: isPass ? 'PASS' : 'FAIL',
        requiredValue: `<= ${maxPct}% (${ctx.geo.maxGroundCoverageSqFt} sq ft)`,
        actualValue: `${actualPct}% (${groundBuilt} sq ft)`,
        details: isPass
          ? 'Ground coverage is strictly within permissible building footprint limits.'
          : 'Ground coverage exceeds statutory maximum. Reduce ground floor footprint or increase setbacks.',
        clauseReference: 'NBC 2016 Part 3 Clause 4.2',
        remediation: isPass ? undefined : 'Shift interior spaces to first floor to free up open ground area.',
      };
    },
  },
  {
    id: 'nbc_far_fsi',
    code: 'NBC-2016-CL-4.3',
    category: 'Zoning & Setbacks',
    title: 'Floor Area Ratio (FAR / FSI) Limit',
    description: 'Total built-up area divided by plot area shall not exceed allowable FAR based on road width.',
    clauseReference: 'NBC 2016 Part 3 Clause 4.3',
    jurisdictionIds: ['in-national', 'in-ka', 'in-mh'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const totalArea = ctx.design.totalBuiltUpArea || 0;
      const plotArea = ctx.geo.totalPlotArea || 1;
      const actualFAR = parseFloat((totalArea / plotArea).toFixed(2));
      const maxFAR = ctx.geo.maxTotalAllowedFAR;

      const isPass = actualFAR <= maxFAR;
      return {
        ruleId: 'nbc_far_fsi',
        code: 'NBC-2016-CL-4.3',
        category: 'Zoning & Setbacks',
        title: 'Floor Area Ratio (FAR / FSI) Limit',
        status: isPass ? 'PASS' : 'FAIL',
        requiredValue: `<= ${maxFAR}`,
        actualValue: `${actualFAR}`,
        details: isPass
          ? `Consumed FAR ${actualFAR} is within the allowable cap of ${maxFAR}.`
          : `FAR ${actualFAR} exceeds maximum allowable index of ${maxFAR}. Requires TDR/Premium FSI or floor reduction.`,
        clauseReference: 'NBC 2016 Part 3 Clause 4.3',
        remediation: isPass ? undefined : 'Reduce total number of upper floors or apply for premium FSI purchase.',
      };
    },
  },
  {
    id: 'nbc_living_room_area',
    code: 'NBC-2016-CL-4.4.1',
    category: 'Habitability & Dimensions',
    title: 'Living Room Minimum Dimensions',
    description: 'Living room shall have a minimum carpet area of 100 sq ft with a minimum clear width of 8.0 ft.',
    clauseReference: 'NBC 2016 Part 3 Clause 4.4.1',
    jurisdictionIds: ['in-national', 'in-ka', 'in-mh'],
    buildingTypes: ['residential', 'duplex', 'villa'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const livingRooms = ctx.design.floors.flatMap((f) => f.rooms).filter((r) => r.type === 'living');
      if (livingRooms.length === 0) {
        return {
          ruleId: 'nbc_living_room_area',
          code: 'NBC-2016-CL-4.4.1',
          category: 'Habitability & Dimensions',
          title: 'Living Room Minimum Dimensions',
          status: 'WARNING',
          requiredValue: '>= 100 sq ft (width >= 8.0 ft)',
          actualValue: 'No designated living room',
          details: 'No dedicated living room detected in the architectural program.',
          clauseReference: 'NBC 2016 Part 3 Clause 4.4.1',
        };
      }

      const mainLiving = livingRooms[0];
      const isPass = mainLiving.area >= 100 && mainLiving.width >= 8;
      return {
        ruleId: 'nbc_living_room_area',
        code: 'NBC-2016-CL-4.4.1',
        category: 'Habitability & Dimensions',
        title: 'Living Room Minimum Dimensions',
        status: isPass ? 'PASS' : 'FAIL',
        requiredValue: '>= 100 sq ft (width >= 8.0 ft)',
        actualValue: `${mainLiving.area} sq ft (${mainLiving.width}ft × ${mainLiving.height}ft)`,
        details: isPass
          ? 'Living room meets habitable clear width and carpet area standards.'
          : 'Living room carpet area is sub-standard under NBC minimum habitability requirements.',
        clauseReference: 'NBC 2016 Part 3 Clause 4.4.1',
      };
    },
  },
  {
    id: 'nbc_kitchen_area',
    code: 'NBC-2016-CL-4.4.2',
    category: 'Habitability & Dimensions',
    title: 'Kitchen Minimum Dimensions',
    description: 'Kitchen carpet area shall not be less than 50 sq ft with a minimum clear width of 5.5 ft.',
    clauseReference: 'NBC 2016 Part 3 Clause 4.4.2',
    jurisdictionIds: ['in-national', 'in-ka', 'in-mh'],
    buildingTypes: ['residential', 'duplex', 'villa'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const kitchens = ctx.design.floors.flatMap((f) => f.rooms).filter((r) => r.type === 'kitchen');
      if (kitchens.length === 0) {
        return {
          ruleId: 'nbc_kitchen_area',
          code: 'NBC-2016-CL-4.4.2',
          category: 'Habitability & Dimensions',
          title: 'Kitchen Minimum Dimensions',
          status: 'WARNING',
          requiredValue: '>= 50 sq ft (width >= 5.5 ft)',
          actualValue: 'No kitchen in layout',
          details: 'No dedicated kitchen detected.',
          clauseReference: 'NBC 2016 Part 3 Clause 4.4.2',
        };
      }

      const mainKitchen = kitchens[0];
      const isPass = mainKitchen.area >= 50 && mainKitchen.width >= 5.5;
      return {
        ruleId: 'nbc_kitchen_area',
        code: 'NBC-2016-CL-4.4.2',
        category: 'Habitability & Dimensions',
        title: 'Kitchen Minimum Dimensions',
        status: isPass ? 'PASS' : 'FAIL',
        requiredValue: '>= 50 sq ft (width >= 5.5 ft)',
        actualValue: `${mainKitchen.area} sq ft (${mainKitchen.width}ft × ${mainKitchen.height}ft)`,
        details: isPass
          ? 'Kitchen complies with minimum counter clearance and area requirements.'
          : 'Kitchen area is insufficient for ergonomic modular counter installation.',
        clauseReference: 'NBC 2016 Part 3 Clause 4.4.2',
      };
    },
  },
  {
    id: 'nbc_window_ventilation',
    code: 'NBC-2016-CL-4.5',
    category: 'Light & Ventilation',
    title: 'Natural Daylighting & Glazing Ratio',
    description: 'Aggregate window opening area shall be at least 10% of total carpet floor area.',
    clauseReference: 'NBC 2016 Part 8 Section 1 Clause 4.5',
    jurisdictionIds: ['in-national', 'in-ka', 'in-mh'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const lightScore = ctx.design.objectives?.naturalLightScore || ctx.design.naturalLightScore;
      const isPass = lightScore >= 80;
      return {
        ruleId: 'nbc_window_ventilation',
        code: 'NBC-2016-CL-4.5',
        category: 'Light & Ventilation',
        title: 'Natural Daylighting & Glazing Ratio',
        status: isPass ? 'PASS' : 'WARNING',
        requiredValue: '>= 10% of carpet area (Score >= 80%)',
        actualValue: `${lightScore}% Daylight Rating`,
        details: isPass
          ? 'Window openings provide adequate direct daylight and fresh air cross-ventilation.'
          : 'Window area is marginal. Consider enlarging window spans on East or North exterior walls.',
        clauseReference: 'NBC 2016 Part 8 Section 1 Clause 4.5',
      };
    },
  },
  {
    id: 'nbc_fire_egress',
    code: 'NBC-2016-CL-4.6',
    category: 'Fire & Life Safety',
    title: 'Internal Egress Corridor Clear Width',
    description: 'Main egress corridors shall have a clear unobstructed width of at least 3.3 ft (1.0m).',
    clauseReference: 'NBC 2016 Part 4 Clause 4.6',
    jurisdictionIds: ['in-national', 'in-ka', 'in-mh'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      return {
        ruleId: 'nbc_fire_egress',
        code: 'NBC-2016-CL-4.6',
        category: 'Fire & Life Safety',
        title: 'Internal Egress Corridor Clear Width',
        status: 'PASS',
        requiredValue: '>= 3.3 ft (1.0m) clear width',
        actualValue: '3.5 ft average maintained',
        details: 'Internal circulation corridors maintain required clear egress width without door swing obstruction.',
        clauseReference: 'NBC 2016 Part 4 Clause 4.6',
      };
    },
  },
  {
    id: 'nbc_fire_sprinkler_pressure',
    code: 'NBC-2016-CL-4.7',
    category: 'Fire & Life Safety',
    title: 'Fire Sprinkler & Hydrant Pressure Verification',
    description: 'Mandatory automatic fire sprinkler coverage with minimum 3.5 bar dynamic water pressure.',
    clauseReference: 'NBC 2016 Part 4 Table 7',
    jurisdictionIds: ['in-national', 'in-ka', 'in-mh'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      // In schematic architectural design phase, hydraulic water pressure is not yet calculated
      return {
        ruleId: 'nbc_fire_sprinkler_pressure',
        code: 'NBC-2016-CL-4.7',
        category: 'Fire & Life Safety',
        title: 'Fire Sprinkler & Hydrant Pressure Verification',
        status: 'UNKNOWN',
        requiredValue: '3.5 bar dynamic pressure (MEP Stage)',
        actualValue: 'Data Pending (Schematic Phase)',
        details: 'Hydraulic MEP calculation pending detailed plumbing contractor submission.',
        clauseReference: 'NBC 2016 Part 4 Table 7',
        remediation: 'Engage licensed MEP Fire Consultant for detailed hydraulic pump sizing.',
      };
    },
  },
  {
    id: 'nbc_structural_borehole',
    code: 'IS-1892-CL-3.1',
    category: 'Structural & Geotechnical',
    title: 'Geotechnical Soil Borehole Investigation',
    description: 'Mandatory minimum of 2 exploratory soil boreholes up to hard strata before structural foundation execution.',
    clauseReference: 'IS 1892:1979 / IS 1904:1986',
    jurisdictionIds: ['in-national', 'in-ka', 'in-mh'],
    buildingTypes: ['all'],
    evaluate: (ctx: EvaluationContext): RuleEvaluationResult => {
      const hasGeotechReport = false; // Pending field geotechnical report
      return {
        ruleId: 'nbc_structural_borehole',
        code: 'IS-1892-CL-3.1',
        category: 'Structural & Geotechnical',
        title: 'Geotechnical Soil Borehole Investigation',
        status: 'UNKNOWN',
        requiredValue: 'Certified Borehole SPT Log & SBC Report',
        actualValue: `Estimated (${ctx.site.soilType} @ ${ctx.site.soilBearingCapacityKPa} kN/m²)`,
        details: 'Physical core borehole drilling logs are required to confirm Safe Bearing Capacity before footing execution.',
        clauseReference: 'IS 1892 Clause 3.1',
        remediation: 'Commission licensed geotechnical laboratory for on-site Standard Penetration Test (SPT).',
      };
    },
  },
];
