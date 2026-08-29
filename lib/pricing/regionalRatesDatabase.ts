/**
 * Regional Construction Pricing Database
 * Tracks material unit rates, labour wages, equipment costs, waste factors,
 * and contractor overhead across Indian metropolitan regions and international markets.
 * Sources: CPWD Delhi Schedule of Rates (DSR 2023), CREDAI State Cost Index 2024.
 */

export interface RegionalRateDataset {
  regionId: string;
  cityName: string;
  stateName: string;
  currency: 'INR' | 'USD';
  currencySymbol: string;
  effectiveDate: string;
  source: string;
  averageCostPerSqFt: number;
  materials: {
    cementPerBag50kg: number; // e.g. ₹380
    steelFe500DPerKg: number; // e.g. ₹72
    sandPerCuFt: number; // e.g. ₹55
    aggregate20mmPerCuFt: number; // e.g. ₹42
    aacBlock9InchPerSqFt: number; // e.g. ₹68
    concreteM25PerM3: number; // e.g. ₹5,800
    vitrifiedTilesPerSqFt: number; // e.g. ₹85
    italianMarblePerSqFt: number; // e.g. ₹380
    upvcGlazedWindowPerSqFt: number; // e.g. ₹780
    teakWoodDoorUnit: number; // e.g. ₹18,500
    plasterMortarPerSqFt: number; // e.g. ₹24
    paint2CoatEmulsionPerSqFt: number; // e.g. ₹30
    plumbingFixturesPerBathroom: number; // e.g. ₹28,000
    electricalWiringPerSqFt: number; // e.g. ₹130
  };
  labour: {
    masonPerDay: number;
    carpenterPerDay: number;
    barBenderPerDay: number;
    painterPerDay: number;
    unskilledLabourPerDay: number;
  };
  wasteFactors: {
    steelLapAndCuttingPercent: number; // 8%
    tileCuttingWastePercent: number; // 10%
    brickBreakagePercent: number; // 5%
    concreteSpillagePercent: number; // 3%
  };
  overheads: {
    contractorProfitAndOverheadPercent: number; // 10%
    gstTaxPercent: number; // 18%
    contingencyPercent: number; // 3%
  };
}

export const REGIONAL_RATES_DATABASE: Record<string, RegionalRateDataset> = {
  bengaluru: {
    regionId: 'bengaluru',
    cityName: 'Bengaluru',
    stateName: 'Karnataka',
    currency: 'INR',
    currencySymbol: '₹',
    effectiveDate: 'Q3 2024',
    source: 'KPWD Schedule of Rates 2024 & CREDAI Bengaluru Index',
    averageCostPerSqFt: 2150,
    materials: {
      cementPerBag50kg: 390,
      steelFe500DPerKg: 74,
      sandPerCuFt: 58,
      aggregate20mmPerCuFt: 44,
      aacBlock9InchPerSqFt: 72,
      concreteM25PerM3: 6100,
      vitrifiedTilesPerSqFt: 95,
      italianMarblePerSqFt: 420,
      upvcGlazedWindowPerSqFt: 820,
      teakWoodDoorUnit: 19500,
      plasterMortarPerSqFt: 26,
      paint2CoatEmulsionPerSqFt: 32,
      plumbingFixturesPerBathroom: 32000,
      electricalWiringPerSqFt: 145,
    },
    labour: {
      masonPerDay: 1050,
      carpenterPerDay: 1150,
      barBenderPerDay: 1000,
      painterPerDay: 950,
      unskilledLabourPerDay: 750,
    },
    wasteFactors: {
      steelLapAndCuttingPercent: 8,
      tileCuttingWastePercent: 10,
      brickBreakagePercent: 5,
      concreteSpillagePercent: 3,
    },
    overheads: {
      contractorProfitAndOverheadPercent: 10,
      gstTaxPercent: 18,
      contingencyPercent: 3,
    },
  },

  mumbai: {
    regionId: 'mumbai',
    cityName: 'Mumbai',
    stateName: 'Maharashtra',
    currency: 'INR',
    currencySymbol: '₹',
    effectiveDate: 'Q3 2024',
    source: 'MCGM DSR 2024 & CREDAI-MCHI Mumbai Cost Dataset',
    averageCostPerSqFt: 2450,
    materials: {
      cementPerBag50kg: 420,
      steelFe500DPerKg: 78,
      sandPerCuFt: 68,
      aggregate20mmPerCuFt: 52,
      aacBlock9InchPerSqFt: 80,
      concreteM25PerM3: 6600,
      vitrifiedTilesPerSqFt: 110,
      italianMarblePerSqFt: 480,
      upvcGlazedWindowPerSqFt: 920,
      teakWoodDoorUnit: 22000,
      plasterMortarPerSqFt: 30,
      paint2CoatEmulsionPerSqFt: 36,
      plumbingFixturesPerBathroom: 36000,
      electricalWiringPerSqFt: 160,
    },
    labour: {
      masonPerDay: 1200,
      carpenterPerDay: 1300,
      barBenderPerDay: 1150,
      painterPerDay: 1050,
      unskilledLabourPerDay: 850,
    },
    wasteFactors: {
      steelLapAndCuttingPercent: 8,
      tileCuttingWastePercent: 10,
      brickBreakagePercent: 5,
      concreteSpillagePercent: 3,
    },
    overheads: {
      contractorProfitAndOverheadPercent: 12,
      gstTaxPercent: 18,
      contingencyPercent: 3,
    },
  },

  delhi_ncr: {
    regionId: 'delhi_ncr',
    cityName: 'Delhi-NCR',
    stateName: 'Delhi / Haryana / UP',
    currency: 'INR',
    currencySymbol: '₹',
    effectiveDate: 'Q3 2024',
    source: 'CPWD DSR 2023 + Cost Index Escalation',
    averageCostPerSqFt: 2100,
    materials: {
      cementPerBag50kg: 375,
      steelFe500DPerKg: 71,
      sandPerCuFt: 52,
      aggregate20mmPerCuFt: 40,
      aacBlock9InchPerSqFt: 66,
      concreteM25PerM3: 5900,
      vitrifiedTilesPerSqFt: 90,
      italianMarblePerSqFt: 390,
      upvcGlazedWindowPerSqFt: 780,
      teakWoodDoorUnit: 18500,
      plasterMortarPerSqFt: 24,
      paint2CoatEmulsionPerSqFt: 30,
      plumbingFixturesPerBathroom: 30000,
      electricalWiringPerSqFt: 135,
    },
    labour: {
      masonPerDay: 980,
      carpenterPerDay: 1050,
      barBenderPerDay: 950,
      painterPerDay: 900,
      unskilledLabourPerDay: 700,
    },
    wasteFactors: {
      steelLapAndCuttingPercent: 8,
      tileCuttingWastePercent: 10,
      brickBreakagePercent: 5,
      concreteSpillagePercent: 3,
    },
    overheads: {
      contractorProfitAndOverheadPercent: 10,
      gstTaxPercent: 18,
      contingencyPercent: 3,
    },
  },

  hyderabad: {
    regionId: 'hyderabad',
    cityName: 'Hyderabad',
    stateName: 'Telangana',
    currency: 'INR',
    currencySymbol: '₹',
    effectiveDate: 'Q3 2024',
    source: 'GHMC Schedule of Rates 2024',
    averageCostPerSqFt: 1980,
    materials: {
      cementPerBag50kg: 360,
      steelFe500DPerKg: 69,
      sandPerCuFt: 48,
      aggregate20mmPerCuFt: 38,
      aacBlock9InchPerSqFt: 64,
      concreteM25PerM3: 5600,
      vitrifiedTilesPerSqFt: 85,
      italianMarblePerSqFt: 360,
      upvcGlazedWindowPerSqFt: 740,
      teakWoodDoorUnit: 17500,
      plasterMortarPerSqFt: 22,
      paint2CoatEmulsionPerSqFt: 28,
      plumbingFixturesPerBathroom: 28000,
      electricalWiringPerSqFt: 125,
    },
    labour: {
      masonPerDay: 920,
      carpenterPerDay: 1000,
      barBenderPerDay: 900,
      painterPerDay: 850,
      unskilledLabourPerDay: 650,
    },
    wasteFactors: {
      steelLapAndCuttingPercent: 8,
      tileCuttingWastePercent: 10,
      brickBreakagePercent: 5,
      concreteSpillagePercent: 3,
    },
    overheads: {
      contractorProfitAndOverheadPercent: 10,
      gstTaxPercent: 18,
      contingencyPercent: 3,
    },
  },

  tier2_india: {
    regionId: 'tier2_india',
    cityName: 'Tier-2 Cities (Indore / Coimbatore / Jaipur)',
    stateName: 'National Average',
    currency: 'INR',
    currencySymbol: '₹',
    effectiveDate: 'Q3 2024',
    source: 'National Building Organization (NBO) Cost Index 2024',
    averageCostPerSqFt: 1750,
    materials: {
      cementPerBag50kg: 345,
      steelFe500DPerKg: 66,
      sandPerCuFt: 42,
      aggregate20mmPerCuFt: 34,
      aacBlock9InchPerSqFt: 58,
      concreteM25PerM3: 5100,
      vitrifiedTilesPerSqFt: 75,
      italianMarblePerSqFt: 320,
      upvcGlazedWindowPerSqFt: 680,
      teakWoodDoorUnit: 15500,
      plasterMortarPerSqFt: 20,
      paint2CoatEmulsionPerSqFt: 25,
      plumbingFixturesPerBathroom: 24000,
      electricalWiringPerSqFt: 110,
    },
    labour: {
      masonPerDay: 800,
      carpenterPerDay: 880,
      barBenderPerDay: 780,
      painterPerDay: 720,
      unskilledLabourPerDay: 550,
    },
    wasteFactors: {
      steelLapAndCuttingPercent: 8,
      tileCuttingWastePercent: 10,
      brickBreakagePercent: 5,
      concreteSpillagePercent: 3,
    },
    overheads: {
      contractorProfitAndOverheadPercent: 10,
      gstTaxPercent: 18,
      contingencyPercent: 3,
    },
  },
};

export function getRegionalPricingDataset(regionId = 'mumbai'): RegionalRateDataset {
  return REGIONAL_RATES_DATABASE[regionId] || REGIONAL_RATES_DATABASE['mumbai'];
}
