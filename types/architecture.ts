export type Point2D = { x: number; y: number };
export type Polygon2D = Point2D[];

export * from './canonicalArchitectureProject';

export type PlotShape = 'rectangular' | 'l_shaped' | 'corner_plot' | 'trapezoidal' | 'irregular';
export type Orientation = 'North' | 'South' | 'East' | 'West';
export type ArchitecturalStyle = 'Modern Minimal' | 'Contemporary' | 'Traditional Vastu' | 'Tropical Modern' | 'Industrial';
export type BuildingCodeJurisdiction = 'NBC_INDIA' | 'IBC_USA' | 'UK_BUILDING_REGS' | 'GENERIC_MUNICIPAL';
export type SoilType = 'Medium Clay' | 'Dense Sand / Gravel' | 'Hard Rock / Strata' | 'Soft Marine Clay / Silt';

export interface RoadBoundary {
  side: 'North' | 'South' | 'East' | 'West' | 'Front' | 'Rear' | 'Left' | 'Right';
  roadWidth: number; // in feet
  isMainRoad: boolean;
}

export interface SiteEasement {
  id: string;
  name: string;
  type: 'tree_preservation' | 'setback_buffer' | 'utility_easement' | 'existing_structure';
  polygon: Polygon2D;
}

export interface SiteInformation {
  length: number; // in feet (bounding box length)
  width: number;  // in feet (bounding box width)
  shape: PlotShape;
  vertices: Polygon2D; // exact polygon boundary
  orientation: Orientation; // Road side
  roads: RoadBoundary[];
  roadWidth: number; // in feet
  frontSetback: number; // calculated or user override
  rearSetback: number;
  sideSetbackLeft: number;
  sideSetbackRight: number;
  easements?: SiteEasement[];
  locationState?: string;
  buildingCodeJurisdiction: BuildingCodeJurisdiction;
  soilType: SoilType;
  soilBearingCapacityKPa: number; // SBC in kN/m2 (e.g. 150 to 300)
}

export interface BuildingRequirements {
  floors: number; // 1, 2, 3, 4, 5
  buildingType: 'residential' | 'commercial' | 'duplex' | 'villa';
  bedrooms: number;
  bathrooms: number;
  parkingCapacity: number; // cars
  livingRoom: boolean;
  diningRoom: boolean;
  kitchen: boolean;
  balcony: boolean;
  poojaRoom: boolean;
  office: boolean;
  garden: boolean;
  lift: boolean;
  utility: boolean;
  staircase: boolean;
  targetBudget: number; // in local currency (e.g. ₹ INR or $ USD)
  style: ArchitecturalStyle;
  familySize: number;
  vastuCompliant: boolean;
  optimizationPreference?: 'balanced' | 'space_efficiency' | 'daylight_luxury' | 'cost_optimized' | 'vastu_priority';
}

export type RoomType = 
  | 'living' 
  | 'dining' 
  | 'kitchen' 
  | 'master_bedroom' 
  | 'bedroom' 
  | 'bathroom' 
  | 'office' 
  | 'pooja' 
  | 'parking' 
  | 'balcony' 
  | 'staircase' 
  | 'corridor' 
  | 'foyer'
  | 'lift_core'
  | 'utility';

export interface FurnitureItem {
  id: string;
  name: string;
  type: 'bed' | 'sofa' | 'tv_unit' | 'dining_table' | 'kitchen_counter' | 'toilet' | 'basin' | 'desk' | 'wardrobe';
  x: number; // relative room offset
  y: number;
  width: number;
  depth: number;
  rotation: number; // degrees
}

export interface RoomPolygon {
  id: string;
  name: string;
  type: RoomType;
  floor: number;
  x: number;
  y: number;
  width: number;
  height: number;
  area: number; // sq ft
  color: string;
  windows: Array<{ side: 'N' | 'S' | 'E' | 'W'; width: number }>;
  doors: Array<{ side: 'N' | 'S' | 'E' | 'W'; targetRoomId?: string }>;
  furniture: FurnitureItem[];
  materialFloor: string;
  materialWall: string;
}

export interface FloorPlanLayout {
  floorNumber: number;
  name: string;
  width: number;
  height: number;
  buildableArea: number;
  totalBuiltArea: number;
  rooms: RoomPolygon[];
}

export interface StructuralColumn {
  id: string;
  x: number; // relative to buildable origin
  y: number;
  width: number; // in feet (e.g. 0.75ft = 9 inches)
  depth: number; // in feet (e.g. 1.0ft = 12 inches)
  gridLabel: string; // e.g. "C1-A"
}

export interface StructuralBeam {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  spanFeet: number;
  beamLabel: string;
}

export interface ParetoObjectives {
  spaceEfficiencyScore: number; // 0 - 100
  naturalLightScore: number;    // 0 - 100
  ventilationScore: number;     // 0 - 100
  privacyScore: number;         // 0 - 100
  adjacencyScore: number;       // 0 - 100
  vastuScore: number;           // 0 - 100
  structuralSimplicityScore: number; // 0 - 100
  plumbingClusteringScore: number;   // 0 - 100 (wet areas stacked & clustered)
  corridorWastePercentage: number;   // 0 - 30% (lower is better)
  estimatedCost: number;
  costPerSqFt: number;
  totalBuiltUpArea: number;
}

export type DesignArchetype = 
  | 'space_max' 
  | 'premium_daylight' 
  | 'budget_optimized' 
  | 'vastu_master' 
  | 'balanced';

export interface CandidateDesign {
  id: string;
  name: string;
  subtitle: string;
  archetype: DesignArchetype;
  variant?: string; // backwards compatibility
  paretoRank: number;
  crowdingDistance: number;
  objectives: ParetoObjectives;
  floors: FloorPlanLayout[];
  columns: StructuralColumn[];
  beams: StructuralBeam[];
  totalBuiltUpArea: number; // sq ft
  spaceEfficiencyScore: number;
  naturalLightScore: number;
  ventilationScore: number;
  privacyScore: number;
  adjacencyScore: number;
  overallScore: number;
  estimatedCost: number;
  costPerSqFt: number;
  keyFeatures: string[];
  generation?: number;
  provenance?: DesignProvenanceMetadata;
}

export interface DesignProvenanceMetadata {
  designId: string;
  modelVersion: string;
  ruleVersion: string;
  optimizerVersion: string;
  costDbVersion: string;
  geometryEngineVersion: string;
  timestamp: string;
}

export interface BOQItem {
  category: 'Civil Work' | 'Structure' | 'Flooring' | 'Doors & Windows' | 'Electrical' | 'Plumbing' | 'Finishing';
  item: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface ComplianceCheck {
  title: string;
  category: string;
  status: 'passed' | 'warning' | 'failed';
  requiredValue: string;
  actualValue: string;
  details: string;
}

export interface SunlightSimulationState {
  timeOfDay: number; // 0 to 24 hours
  azimuth: number;   // angle in degrees
  elevation: number; // sun height in degrees
  illuminatedRooms: string[];
}

export interface DesignLocks {
  plot: boolean;
  exteriorEnvelope: boolean;
  masterBedroom: boolean;
  staircase: boolean;
  kitchen: boolean;
  budget: boolean;
  structuralGrid: boolean;
}

export type ConstraintRelationType =
  | 'close_to'
  | 'near'
  | 'away_from'
  | 'window_exterior'
  | 'avoid'
  | 'plumbing_adjacent'
  | 'vertical_aligned';

export interface ConstraintEdge {
  sourceRoomType: RoomType;
  targetRoomType: RoomType;
  relation: ConstraintRelationType;
  weight: number; // 1 to 10
  description: string;
}

export interface ArchitecturalConstraintGraph {
  nodes: RoomType[];
  edges: ConstraintEdge[];
}

