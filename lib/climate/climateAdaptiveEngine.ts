export type ClimateType = 'Hot-Humid' | 'Hot-Dry' | 'Temperate' | 'Cold-Continental';

export interface ClimateAdaptiveStrategy {
  climateType: ClimateType;
  cityContext: string;
  recommendedWwrPercent: number; // Window-to-Wall Ratio
  chajjaOverhangDepthFt: number;
  recommendedRoofType: 'Reflective Cool Flat Roof' | 'Insulated Courtyard Terrace' | 'Pitched Gable / Hip Roof' | 'Green Living Roof';
  shadingDeviceType: 'Deep Horizontal Overhangs' | 'Vertical Louvers & Jaali Screens' | 'Exterior Motorized Blinds' | 'Solar Glazing Coatings';
  wallThermalMassType: 'Ventilated Cavity Walls' | 'High Thermal Mass AAC Blockwork' | 'Heavy Cavity Insulation (R-24)' | 'Standard Plastered AAC';
  crossVentilationStrategy: string;
  passiveSolarStrategy: string;
  bioclimaticFeatures: string[];
}

/**
 * Derives climate-responsive architectural guidelines tailored to the geographic region
 */
export function getClimateAdaptiveStrategy(
  location = 'Mumbai, India',
  climateZone?: string
): ClimateAdaptiveStrategy {
  const loc = location.toLowerCase();

  if (loc.includes('dubai') || loc.includes('jaipur') || loc.includes('abu dhabi') || loc.includes('cairo') || loc.includes('phoenix') || climateZone === 'Arid') {
    return {
      climateType: 'Hot-Dry',
      cityContext: 'Arid / Desert High-Heat Zone',
      recommendedWwrPercent: 12,
      chajjaOverhangDepthFt: 2.0,
      recommendedRoofType: 'Insulated Courtyard Terrace',
      shadingDeviceType: 'Vertical Louvers & Jaali Screens',
      wallThermalMassType: 'High Thermal Mass AAC Blockwork',
      crossVentilationStrategy: 'Night-purge ventilation through central thermal-chimney courtyard',
      passiveSolarStrategy: 'Minimize East and West fenestrations; recessed windows with Low-E Solar Control glass',
      bioclimaticFeatures: [
        'Central Microclimatic Courtyard with Water Mist Fountain',
        'Thick 230mm AAC Blockwork with High Thermal Damping',
        'Terracotta Jaali Screening on South-West Facade',
        'High Albedo Reflective Rooftop (SRI > 82)',
      ],
    };
  }

  if (loc.includes('london') || loc.includes('chicago') || loc.includes('munich') || loc.includes('toronto') || climateZone === 'Continental' || climateZone === 'Temperate') {
    if (loc.includes('london') || loc.includes('chicago') || loc.includes('munich')) {
      return {
        climateType: 'Cold-Continental',
        cityContext: 'Cold Temperate / High Heating Demand',
        recommendedWwrPercent: 18,
        chajjaOverhangDepthFt: 1.5,
        recommendedRoofType: 'Pitched Gable / Hip Roof',
        shadingDeviceType: 'Solar Glazing Coatings',
        wallThermalMassType: 'Heavy Cavity Insulation (R-24)',
        crossVentilationStrategy: 'Controlled Heat Recovery Mechanical Ventilation (HRV) with airtight envelope',
        passiveSolarStrategy: 'Maximize South-facing solar aperture for passive winter space heating',
        bioclimaticFeatures: [
          'High-Pitch 30° Sloped Roof for Rapid Snow and Rain Shedding',
          'Triple-Glazed Argon Filled Low-E Fenestrations (U-factor < 0.16)',
          'Thermal-Bridge Free Continuous Envelope Insulation',
          'Airtight Air-Barrier with Controlled Heat Recovery Ventilation',
        ],
      };
    }
  }

  if (loc.includes('bengaluru') || loc.includes('bangalore') || loc.includes('san francisco') || loc.includes('pune')) {
    return {
      climateType: 'Temperate',
      cityContext: 'Mild Plateau / Moderate Year-Round Climate',
      recommendedWwrPercent: 20,
      chajjaOverhangDepthFt: 2.5,
      recommendedRoofType: 'Green Living Roof',
      shadingDeviceType: 'Deep Horizontal Overhangs',
      wallThermalMassType: 'Standard Plastered AAC',
      crossVentilationStrategy: 'Continuous natural cross ventilation across living and terrace spaces',
      passiveSolarStrategy: 'Optimized North-South glazing with indoor-outdoor landscaped transition verandas',
      bioclimaticFeatures: [
        'Large Floor-to-Ceiling Sliding Glass Doors connecting to Garden Courtyards',
        'Green Living Rooftop Garden for Urban Microclimatic Cooling',
        'Perforated Timber Screen Partitions for Breezeway Circulation',
        'Dual-Aspect Room Orientation for 100% Daylighting',
      ],
    };
  }

  // Default: Hot-Humid Coastal / Tropical (Mumbai, Chennai, Kolkata, Singapore, Miami)
  return {
    climateType: 'Hot-Humid',
    cityContext: 'Tropical Wet Coastal Marine Environment',
    recommendedWwrPercent: 24,
    chajjaOverhangDepthFt: 3.5,
    recommendedRoofType: 'Reflective Cool Flat Roof',
    shadingDeviceType: 'Deep Horizontal Overhangs',
    wallThermalMassType: 'Ventilated Cavity Walls',
    crossVentilationStrategy: 'Maximize North-South opposing wind-induced cross-ventilation flow across all habitable rooms',
    passiveSolarStrategy: 'Elongated North-South building axis with deep 3.5ft chajjas to block monsoon driving rain and harsh overhead solar radiation',
    bioclimaticFeatures: [
      'Deep 3.5ft R.C.C. Chajja Weather-Shedding Window Projections',
      'High-Ceiling 10.5ft Storeys promoting Natural Thermal Stratification',
      'Large Operable 3-Track UPVC Sliding Windows with Insect Meshes',
      'Elevated Ground Plinth (+2.5ft) protecting against Coastal Flash Flooding',
    ],
  };
}
