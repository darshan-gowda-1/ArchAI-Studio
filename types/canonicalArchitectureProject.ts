/**
 * ArchAI Studio - Canonical Architectural Schema (Single Source of Truth)
 * 
 * ArchitectureProject
 * │
 * ├── metadata
 * ├── site (boundary, roads, orientation, terrain, climate, context)
 * ├── requirements
 * ├── constraints
 * ├── regulations
 * ├── design (levels, spaces, walls, doors, windows, slabs, roof, structure, stairs)
 * ├── interiors
 * ├── MEP (electrical, plumbing, drainage, HVAC, solar)
 * ├── materials
 * ├── cost (parametric BOQ, regional rates, lifecycle cost)
 * ├── sustainability (carbon, daylight, rainwater, energy score)
 * └── versions (snapshot history, provenance, visual diffs)
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// ------------------------------------------------------------------------------
// 1. METADATA
// ------------------------------------------------------------------------------
export interface ProjectMetadata {
  id: string;
  name: string;
  code: string;
  clientName?: string;
  architectName?: string;
  organization?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'in_review' | 'approved' | 'construction_ready';
  currentVersionNumber: number;
  units: 'imperial_feet' | 'metric_meters';
  notes?: string;
}

// ------------------------------------------------------------------------------
// 2. SITE CONTEXT & ENVIRONMENT
// ------------------------------------------------------------------------------
export interface SiteRoadAccess {
  id: string;
  side: 'North' | 'South' | 'East' | 'West' | 'Front' | 'Rear' | 'Left' | 'Right';
  roadWidth: number;
  isMainRoad: boolean;
  name?: string;
}

export interface SiteTreeContext {
  id: string;
  position: Point2D;
  crownRadius: number;
  height: number;
  species?: string;
  mustPreserve: boolean;
}

export interface SiteContext {
  boundary: {
    shape: 'rectangular' | 'l_shaped' | 'corner_plot' | 'trapezoidal' | 'irregular';
    length: number;
    width: number;
    vertices: Point2D[];
    totalAreaSqFt: number;
    setbacks: {
      front: number;
      rear: number;
      sideLeft: number;
      sideRight: number;
    };
    buildableFootprintPolygon: Point2D[];
  };
  roads: SiteRoadAccess[];
  orientation: {
    northAngleDegrees: number; // 0 = North, 90 = East, 180 = South, 270 = West
    facingDirection: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'South-East' | 'North-West' | 'South-West';
  };
  terrain: {
    contourElevationMeters: number;
    slopePercentage: number;
    slopeDirectionDegrees: number;
    soilType: 'Loose Sand' | 'Medium Clay' | 'Hard Murrum' | 'Dense Clay' | 'Hard Rock';
    soilBearingCapacityKPa: number;
    waterTableDepthMeters: number;
  };
  climate: {
    zone: 'Hot-Humid' | 'Hot-Dry' | 'Temperate' | 'Cold' | 'Composite';
    locationName: string;
    latitude: number;
    longitude: number;
    annualSolarRadiationKWhPerM2: number;
    annualRainfallMm: number;
    prevailingWindDirection: 'SW' | 'NE' | 'NW' | 'SE';
    averageSummerTempC: number;
    averageWinterTempC: number;
  };
  contextSurroundings: {
    adjacentBuildingHeightsFeet: { north?: number; south?: number; east?: number; west?: number };
    trees: SiteTreeContext[];
    noiseSources?: string[];
    views?: Array<{ direction: string; quality: 'prime' | 'standard' | 'blocked' }>;
  };
}

// ------------------------------------------------------------------------------
// 3. PROGRAMMATIC REQUIREMENTS
// ------------------------------------------------------------------------------
export interface SpaceProgramRequirement {
  roomType: string;
  targetCount: number;
  minAreaSqFt: number;
  preferredLevel: number;
  requiredAdjacencies?: string[];
  preferredOrientation?: string;
  naturalLightMandatory: boolean;
  attachedBath: boolean;
}

export interface ProgramRequirements {
  buildingType: 'residential' | 'commercial' | 'villa' | 'mixed_use';
  totalTargetFloors: number;
  targetBedrooms: number;
  targetBathrooms: number;
  parkingCapacity: number;
  targetBudgetINR: number;
  architecturalStyle: 'Modern Minimal' | 'Contemporary' | 'Traditional Vastu' | 'Tropical Modern' | 'Industrial';
  familySize: number;
  vastuCompliant: boolean;
  spacesList: SpaceProgramRequirement[];
}

// ------------------------------------------------------------------------------
// 4. CONSTRAINTS & DESIGN LOCKS
// ------------------------------------------------------------------------------
export interface DesignConstraints {
  maxPermissibleHeightFeet: number;
  maxFAR: number;
  maxGroundCoveragePercentage: number;
  budgetCeilingINR: number;
  locks: {
    plotBoundary: boolean;
    exteriorEnvelope: boolean;
    masterBedroomLocation: boolean;
    staircaseCore: boolean;
    kitchenLocation: boolean;
    structuralColumns: boolean;
  };
}

// ------------------------------------------------------------------------------
// 5. MUNICIPAL REGULATIONS & BUILDING CODES
// ------------------------------------------------------------------------------
export interface RegulatoryCodes {
  jurisdiction: 'NBC_INDIA' | 'IBC_USA' | 'EUROCODE' | 'DUBAI_BUILDING_CODE';
  fireSafetySprinklersRequired: boolean;
  minimumCeilingHeightFeet: number;
  minimumStairWidthFeet: number;
  minimumWindowVentilationRatio: number; // e.g. 0.10 of floor area
  wheelchairAccessibilityMandatory: boolean;
}

// ------------------------------------------------------------------------------
// 6. DETAILED 3D/BIM DESIGN
// ------------------------------------------------------------------------------
export interface DesignLevel {
  levelNumber: number;
  name: string;
  elevationFeet: number;
  clearHeightFeet: number;
  slabThicknessFeet: number;
}

export interface DesignSpace {
  id: string;
  name: string;
  type: string;
  levelNumber: number;
  polygon: Point2D[];
  areaSqFt: number;
  clearHeightFeet: number;
  boundaryWallIds: string[];
  connectedSpaceIds: string[];
  windowIds: string[];
  doorIds: string[];
  furnitureAssetIds: string[];
  colorHex: string;
  privacyLevel: 'public' | 'semi_private' | 'private';
  daylightScore: number;
  ventilationScore: number;
}

export interface DesignWall {
  id: string;
  levelNumber: number;
  startPoint: Point2D;
  endPoint: Point2D;
  heightFeet: number;
  thicknessFeet: number;
  wallType: 'exterior_cavity' | 'interior_partition' | 'shear_rcc' | 'parapet';
  material: string;
  hasPlaster: boolean;
  openings: Array<{ id: string; type: 'window' | 'door'; offsetAlongWallFeet: number }>;
}

export interface DesignDoor {
  id: string;
  wallId: string;
  doorType: 'single_swing' | 'double_swing' | 'sliding' | 'pivot';
  widthFeet: number;
  heightFeet: number;
  sillElevationFeet: number;
  isExterior: boolean;
  clearanceRadiusFeet: number;
}

export interface DesignWindow {
  id: string;
  wallId: string;
  windowType: 'casement' | 'sliding' | 'fixed' | 'louvered' | 'clerestory';
  widthFeet: number;
  heightFeet: number;
  sillHeightFeet: number;
  orientation: 'N' | 'S' | 'E' | 'W';
  uValue: number;
  shgc: number;
  hasOverhangShading: boolean;
}

export interface DesignRoof {
  roofType: 'flat_accessible_terrace' | 'sloped_gable' | 'butterfly' | 'green_roof';
  thicknessFeet: number;
  parapetHeightFeet: number;
  waterproofingType: 'membrane_brick_bat_coba' | 'polyurethane';
  drainagePointsCount: number;
  solarPanelsArray?: {
    installedCapacityKW: number;
    panelCount: number;
    tiltAngleDegrees: number;
    coverageAreaSqFt: number;
  };
}

export interface DesignStructure {
  columns: Array<{
    id: string;
    gridIntersection: string; // e.g. "A-1"
    position: Point2D;
    crossSectionMm: { width: number; depth: number };
    materialGrade: 'M25' | 'M30' | 'M35';
    isVerticalAlignedThroughAllFloors: boolean;
  }>;
  plinthBeams: Array<{
    id: string;
    startColumnId: string;
    endColumnId: string;
    crossSectionMm: { width: number; depth: number };
  }>;
  foundationFootings: Array<{
    columnId: string;
    footingType: 'isolated_pad' | 'combined' | 'raft_mat' | 'pile_cap';
    widthFeet: number;
    lengthFeet: number;
    depthFeet: number;
  }>;
}

export interface DesignStair {
  id: string;
  levelNumber: number;
  type: 'dog_legged' | 'straight' | 'open_well' | 'spiral';
  riserInches: number;
  treadInches: number;
  flightWidthFeet: number;
  landingPosition: Point2D;
  headroomClearanceFeet: number;
}

export interface ArchitecturalDesignModel {
  levels: DesignLevel[];
  spaces: DesignSpace[];
  walls: DesignWall[];
  doors: DesignDoor[];
  windows: DesignWindow[];
  roof: DesignRoof;
  structure: DesignStructure;
  stairs: DesignStair[];
  totalBuiltUpAreaSqFt: number;
  carpetAreaSqFt: number;
  efficiencyRatio: number;
}

// ------------------------------------------------------------------------------
// 7. INTERIORS & FURNITURE ASSETS
// ------------------------------------------------------------------------------
export interface InteriorAssetPlacement {
  id: string;
  assetName: string;
  category: 'seating' | 'bed' | 'storage' | 'table' | 'sanitary' | 'kitchen_cabinet';
  spaceId: string;
  position: Point3D;
  rotationEuler: Vector3D;
  dimensionsFeet: { width: number; depth: number; height: number };
  glbUrl?: string;
  materialFinish: string;
}

// ------------------------------------------------------------------------------
// 8. MEP (MECHANICAL, ELECTRICAL, PLUMBING)
// ------------------------------------------------------------------------------
export interface MEPModel {
  electrical: {
    incomingSupply: 'single_phase_5kw' | 'three_phase_15kw';
    distributionBoardPosition: Point2D;
    lightPointsCount: number;
    powerSocketPointsCount: number;
    solarInverterCapacityKW: number;
    conduitsRoute: string;
  };
  plumbing: {
    overheadTankCapacityLitres: number;
    undergroundSumpCapacityLitres: number;
    solarWaterHeaterCapacityLitres: number;
    pipeMaterial: 'CPVC' | 'UPVC';
    boosterPumpRequired: boolean;
  };
  drainage: {
    greywaterRecyclingSump: boolean;
    rainwaterHarvestingChamberCapacityLitres: number;
    septicTankOrSewerConnection: 'municipal_sewer' | 'bio_septic_tank';
  };
  hvac: {
    coolingType: 'split_inverter_units' | 'ducted_vrv';
    outdoorUnitsLocations: Point2D[];
    naturalCrossVentilationShaftsCount: number;
  };
}

// ------------------------------------------------------------------------------
// 9. PARAMETRIC BILL OF QUANTITIES & COST
// ------------------------------------------------------------------------------
export interface BOQItem {
  id: string;
  category: 'Earthwork & Foundation' | 'RCC Structure' | 'Masonry & Plaster' | 'Flooring & Finishes' | 'Doors & Windows' | 'MEP Services' | 'Painting & Exterior';
  description: string;
  quantity: number;
  unit: 'sq ft' | 'cu ft' | 'cu m' | 'tonnes' | 'nos' | 'running ft';
  unitRateINR: number;
  totalAmountINR: number;
  labourPercentage: number;
  materialPercentage: number;
}

export interface ProjectCostSummary {
  totalEstimatedCostINR: number;
  costPerSqFtINR: number;
  materialCostINR: number;
  labourCostINR: number;
  contingencyOverheadINR: number;
  gstTaxesINR: number;
  regionalPricingCity: string;
  boqItems: BOQItem[];
}

// ------------------------------------------------------------------------------
// 10. SUSTAINABILITY & PERFORMANCE SCORES
// ------------------------------------------------------------------------------
export interface SustainabilityReport {
  overallSustainabilityScore: number; // 0 - 100
  carbonEmbodiedKgCO2e: number;
  carbonOperationalKgCO2ePerYear: number;
  annualRainwaterHarvestingPotentialLitres: number;
  annualSolarEnergyGenerationKWh: number;
  averageDaylightFactorPercent: number;
  crossVentilationComplianceScore: number;
  greenBuildingRating: 'GRIHA 5-Star' | 'LEED Platinum' | 'IGBC Gold' | 'Standard Code Compliant';
}

// ------------------------------------------------------------------------------
// 11. VERSION SNAPSHOTS & HISTORY
// ------------------------------------------------------------------------------
export interface ProjectVersionSnapshot {
  versionId: string;
  versionNumber: number;
  commitMessage: string;
  author: string;
  timestamp: string;
  snapshotDataJson: string;
  diffSummary?: {
    areaDeltaSqFt: number;
    costDeltaINR: number;
    daylightScoreDelta: number;
  };
}

// ==============================================================================
// CANONICAL ROOT PROJECT SCHEMA
// ==============================================================================
export interface ArchitectureProject {
  schemaVersion: '2.4.0';
  metadata: ProjectMetadata;
  site: SiteContext;
  requirements: ProgramRequirements;
  constraints: DesignConstraints;
  regulations: RegulatoryCodes;
  design: ArchitecturalDesignModel;
  interiors: {
    assets: InteriorAssetPlacement[];
  };
  mep: MEPModel;
  cost: ProjectCostSummary;
  sustainability: SustainabilityReport;
  versions: ProjectVersionSnapshot[];
}
