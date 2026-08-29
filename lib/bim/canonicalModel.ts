import {
  SiteInformation,
  CandidateDesign,
  FloorPlanLayout,
  RoomPolygon,
  StructuralColumn,
  StructuralBeam,
  Point2D,
  Polygon2D,
} from '@/types/architecture';
import { calculateSiteGeometry } from '@/lib/geometrySolver';

export interface BIMPropertySet {
  name: string; // e.g. "Pset_WallCommon", "Pset_SpaceCommon"
  properties: Record<string, string | number | boolean>;
}

export interface BIMMaterial {
  id: string;
  name: string;
  category: 'Concrete' | 'Steel' | 'Masonry' | 'Glass' | 'Timber' | 'Finish' | 'Insulation';
  densityKgM3: number;
  thermalConductivityW_mK: number;
  colorHex: string;
  roughness: number;
}

export interface BIMSite {
  id: string;
  name: string;
  polygon: Polygon2D;
  areaSqFt: number;
  orientation: string;
  roadWidthFt: number;
  elevationMeters: number;
}

export interface BIMLevel {
  id: string;
  name: string;
  storeyNumber: number;
  elevationFt: number;
  heightFt: number;
  grossAreaSqFt: number;
}

export interface BIMSpace {
  id: string;
  name: string;
  levelId: string;
  roomType: string;
  areaSqFt: number;
  volumeCuFt: number;
  boundaryPolygon: Polygon2D;
  properties: BIMPropertySet[];
}

export interface BIMWall {
  id: string;
  name: string;
  levelId: string;
  isExterior: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  lengthFt: number;
  heightFt: number;
  thicknessFt: number;
  materialId: string;
  fireRatingMinutes: number;
  thermalUValue: number;
  openings: Array<{ id: string; type: 'window' | 'door'; offsetFt: number; widthFt: number; heightFt: number }>;
  properties: BIMPropertySet[];
}

export interface BIMSlab {
  id: string;
  name: string;
  levelId: string;
  type: 'ground_slab' | 'floor_slab' | 'roof_slab';
  thicknessFt: number;
  areaSqFt: number;
  polygon: Polygon2D;
  materialId: string;
  properties: BIMPropertySet[];
}

export interface BIMColumn {
  id: string;
  name: string;
  levelId: string;
  x: number;
  y: number;
  widthFt: number;
  depthFt: number;
  heightFt: number;
  materialId: string;
  rebarTonnageTons: number;
  properties: BIMPropertySet[];
}

export interface BIMBeam {
  id: string;
  name: string;
  levelId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  spanFt: number;
  widthFt: number;
  depthFt: number;
  materialId: string;
  properties: BIMPropertySet[];
}

export interface BIMDoor {
  id: string;
  name: string;
  wallId: string;
  levelId: string;
  widthFt: number;
  heightFt: number;
  materialId: string;
  fireRatingMinutes: number;
  swingDirection: 'inward_left' | 'inward_right' | 'outward';
  properties: BIMPropertySet[];
}

export interface BIMWindow {
  id: string;
  name: string;
  wallId: string;
  levelId: string;
  widthFt: number;
  heightFt: number;
  sillHeightFt: number;
  glazingType: 'Double Glazed Low-E' | 'Triple Glazed Acoustic' | 'Single Toughened';
  uValueW_m2K: number;
  properties: BIMPropertySet[];
}

export interface BIMStair {
  id: string;
  name: string;
  startLevelId: string;
  endLevelId: string;
  treadInches: number;
  riserInches: number;
  numberOfRisers: number;
  widthFt: number;
}

export interface BIMRoof {
  id: string;
  name: string;
  levelId: string;
  areaSqFt: number;
  pitchAngleDeg: number;
  parapetHeightFt: number;
  hasSolarPV: boolean;
  solarCapacityKW: number;
}

export interface BIMFurniture {
  id: string;
  name: string;
  spaceId: string;
  levelId: string;
  type: string;
  x: number;
  y: number;
  widthFt: number;
  depthFt: number;
  rotationDeg: number;
}

export interface BIMMEPElement {
  id: string;
  name: string;
  type: 'plumbing_stack' | 'electrical_panel' | 'rwh_sump' | 'hvac_unit' | 'solar_inverter';
  levelId: string;
  x: number;
  y: number;
  capacity?: string;
}

export interface BIMRelationship {
  id: string;
  type: 'IfcRelContainedInSpatialStructure' | 'IfcRelVoidsElement' | 'IfcRelFillsElement' | 'IfcRelAggregates' | 'IfcRelAssociatesMaterial';
  relatingId: string;
  relatedIds: string[];
}

export interface BIMBuilding {
  id: string;
  name: string;
  version: string;
  ifcSchema: 'IFC2X3' | 'IFC4';
  createdAt: string;
  site: BIMSite;
  levels: BIMLevel[];
  spaces: BIMSpace[];
  walls: BIMWall[];
  slabs: BIMSlab[];
  columns: BIMColumn[];
  beams: BIMBeam[];
  doors: BIMDoor[];
  windows: BIMWindow[];
  stairs: BIMStair[];
  roof: BIMRoof;
  furniture: BIMFurniture[];
  materials: BIMMaterial[];
  mep: BIMMEPElement[];
  relationships: BIMRelationship[];
}

export const STANDARD_MATERIALS: BIMMaterial[] = [
  { id: 'mat_concrete_m25', name: 'Reinforced Concrete M25', category: 'Concrete', densityKgM3: 2400, thermalConductivityW_mK: 1.4, colorHex: '#cbd5e1', roughness: 0.5 },
  { id: 'mat_rebar_fe500', name: 'High-Yield TMT Steel Fe500D', category: 'Steel', densityKgM3: 7850, thermalConductivityW_mK: 50.0, colorHex: '#0f172a', roughness: 0.2 },
  { id: 'mat_brick_masonry', name: 'AAC Masonry Blockwork', category: 'Masonry', densityKgM3: 650, thermalConductivityW_mK: 0.16, colorHex: '#f1f5f9', roughness: 0.6 },
  { id: 'mat_glass_lowe', name: 'Low-E Dual Glazing', category: 'Glass', densityKgM3: 2500, thermalConductivityW_mK: 1.0, colorHex: '#38bdf8', roughness: 0.05 },
  { id: 'mat_teak_wood', name: 'Natural Teak Hardwood', category: 'Timber', densityKgM3: 660, thermalConductivityW_mK: 0.14, colorHex: '#78350f', roughness: 0.4 },
  { id: 'mat_marble_tiles', name: 'Italian Vitrified Marble', category: 'Finish', densityKgM3: 2600, thermalConductivityW_mK: 2.1, colorHex: '#f8fafc', roughness: 0.1 },
  { id: 'mat_solar_pv', name: 'Monocrystalline Silicon PV', category: 'Finish', densityKgM3: 2330, thermalConductivityW_mK: 148.0, colorHex: '#0284c7', roughness: 0.1 },
];

/**
 * Compiles CandidateDesign and Site information into a complete Canonical BIM Graph
 */
export function compileDesignToCanonicalBIM(design: CandidateDesign, site: SiteInformation): BIMBuilding {
  const geo = calculateSiteGeometry(site);
  const buildingId = `bld_${design.id || 'canonical'}`;
  const storeyHeightFt = 10.0;

  // 1. Site
  const bimSite: BIMSite = {
    id: `site_${Math.random().toString(36).substring(2, 8)}`,
    name: `${site.locationState || 'Site'} Plot`,
    polygon: geo.plotPolygon,
    areaSqFt: geo.totalPlotArea,
    orientation: site.orientation,
    roadWidthFt: site.roadWidth,
    elevationMeters: 24,
  };

  // 2. Levels
  const levels: BIMLevel[] = design.floors.map((fl, idx) => ({
    id: `lvl_${idx}`,
    name: idx === 0 ? 'Ground Floor (Level 0)' : `Level ${idx}`,
    storeyNumber: idx,
    elevationFt: idx * storeyHeightFt,
    heightFt: storeyHeightFt,
    grossAreaSqFt: fl.totalBuiltArea,
  }));

  const spaces: BIMSpace[] = [];
  const walls: BIMWall[] = [];
  const slabs: BIMSlab[] = [];
  const doors: BIMDoor[] = [];
  const windows: BIMWindow[] = [];
  const furniture: BIMFurniture[] = [];
  const relationships: BIMRelationship[] = [];

  // 3. Compile Spaces, Walls, Doors, Windows, Slabs per floor
  design.floors.forEach((fl, fIdx) => {
    const levelId = levels[fIdx]?.id || `lvl_${fIdx}`;

    // Floor Slab
    const slabId = `slab_${fIdx}`;
    slabs.push({
      id: slabId,
      name: fIdx === 0 ? 'Ground RCC Plinth Slab' : `Floor ${fIdx} RCC Slab`,
      levelId,
      type: fIdx === 0 ? 'ground_slab' : 'floor_slab',
      thicknessFt: 0.42, // 5 inches
      areaSqFt: fl.totalBuiltArea,
      polygon: [
        { x: 0, y: 0 },
        { x: fl.width, y: 0 },
        { x: fl.width, y: fl.height },
        { x: 0, y: fl.height },
      ],
      materialId: 'mat_concrete_m25',
      properties: [
        {
          name: 'Pset_SlabCommon',
          properties: {
            LoadBearing: true,
            Thickness: 0.125,
            FireRating: 'REI 120',
          },
        },
      ],
    });

    fl.rooms.forEach((room) => {
      const spaceId = `spc_${room.id}`;
      spaces.push({
        id: spaceId,
        name: room.name,
        levelId,
        roomType: room.type,
        areaSqFt: room.area,
        volumeCuFt: Math.round(room.area * storeyHeightFt),
        boundaryPolygon: [
          { x: room.x, y: room.y },
          { x: room.x + room.width, y: room.y },
          { x: room.x + room.width, y: room.y + room.height },
          { x: room.x, y: room.y + room.height },
        ],
        properties: [
          {
            name: 'Pset_SpaceCommon',
            properties: {
              OccupancyType: room.type === 'master_bedroom' ? 'Sleeping' : 'Living',
              GrossFloorArea: room.area,
              CeilingHeight: storeyHeightFt,
              FinishesFloor: room.materialFloor,
            },
          },
        ],
      });

      // Walls for this space (North, South, East, West)
      const wallSouthId = `wall_${room.id}_S`;
      const wallNorthId = `wall_${room.id}_N`;
      const wallEastId = `wall_${room.id}_E`;
      const wallWestId = `wall_${room.id}_W`;

      const winSouth = room.windows.find((w) => w.side === 'S');
      const winNorth = room.windows.find((w) => w.side === 'N');
      const winEast = room.windows.find((w) => w.side === 'E');

      const wallSOpenings: BIMWall['openings'] = [];
      if (winSouth) {
        const winId = `win_${room.id}_S`;
        wallSOpenings.push({ id: winId, type: 'window', offsetFt: room.width * 0.25, widthFt: winSouth.width, heightFt: 4.5 });
        windows.push({
          id: winId,
          name: `Window 01 (${room.name})`,
          wallId: wallSouthId,
          levelId,
          widthFt: winSouth.width,
          heightFt: 4.5,
          sillHeightFt: 3.0,
          glazingType: 'Double Glazed Low-E',
          uValueW_m2K: 1.4,
          properties: [
            {
              name: 'Pset_WindowCommon',
              properties: { GlazingAreaFraction: 0.85, AcousticRating: 'Rw 34dB' },
            },
          ],
        });
      }

      if (room.type === 'living' || room.type === 'parking' || room.type === 'master_bedroom') {
        const doorId = `door_${room.id}_S`;
        wallSOpenings.push({ id: doorId, type: 'door', offsetFt: 2.0, widthFt: 3.5, heightFt: 7.0 });
        doors.push({
          id: doorId,
          name: `Door (${room.name})`,
          wallId: wallSouthId,
          levelId,
          widthFt: 3.5,
          heightFt: 7.0,
          materialId: 'mat_teak_wood',
          fireRatingMinutes: 60,
          swingDirection: 'inward_right',
          properties: [
            {
              name: 'Pset_DoorCommon',
              properties: { FireExit: room.type === 'living', HandOperatingForce: '15N' },
            },
          ],
        });
      }

      // South Wall
      walls.push({
        id: wallSouthId,
        name: `Wall S (${room.name})`,
        levelId,
        isExterior: room.y <= 2,
        startX: room.x,
        startY: room.y,
        endX: room.x + room.width,
        endY: room.y,
        lengthFt: room.width,
        heightFt: storeyHeightFt,
        thicknessFt: room.y <= 2 ? 0.75 : 0.38,
        materialId: 'mat_brick_masonry',
        fireRatingMinutes: 120,
        thermalUValue: 0.28,
        openings: wallSOpenings,
        properties: [
          {
            name: 'Pset_WallCommon',
            properties: { LoadBearing: true, IsExternal: room.y <= 2 },
          },
        ],
      });

      // Furniture
      room.furniture.forEach((f) => {
        furniture.push({
          id: f.id,
          name: f.name,
          spaceId,
          levelId,
          type: f.type,
          x: room.x + f.x,
          y: room.y + f.y,
          widthFt: f.width,
          depthFt: f.depth,
          rotationDeg: f.rotation,
        });
      });
    });
  });

  // 4. Columns & Beams
  const columns: BIMColumn[] = (design.columns || []).map((col, idx) => ({
    id: col.id || `col_${idx}`,
    name: col.gridLabel || `Column C${idx + 1}`,
    levelId: levels[0]?.id || 'lvl_0',
    x: col.x,
    y: col.y,
    widthFt: col.width,
    depthFt: col.depth,
    heightFt: levels.length * storeyHeightFt,
    materialId: 'mat_concrete_m25',
    rebarTonnageTons: 0.18,
    properties: [
      {
        name: 'Pset_ColumnCommon',
        properties: { LoadBearing: true, ConcreteGrade: 'M25', ReinforcementGrade: 'Fe500D' },
      },
    ],
  }));

  const beams: BIMBeam[] = (design.beams || []).map((bm, idx) => ({
    id: bm.id || `bm_${idx}`,
    name: bm.beamLabel || `Primary Beam B${idx + 1}`,
    levelId: levels[0]?.id || 'lvl_0',
    startX: bm.startX,
    startY: bm.startY,
    endX: bm.endX,
    endY: bm.endY,
    spanFt: bm.spanFeet,
    widthFt: 0.75, // 9 inches
    depthFt: 1.25, // 15 inches
    materialId: 'mat_concrete_m25',
    properties: [
      {
        name: 'Pset_BeamCommon',
        properties: { SpanLength: bm.spanFeet, Camber: 0 },
      },
    ],
  }));

  // 5. Stairs & Roof
  const stairs: BIMStair[] = [
    {
      id: 'str_core_01',
      name: 'RCC Dog-Legged Main Staircase',
      startLevelId: levels[0]?.id || 'lvl_0',
      endLevelId: levels[1]?.id || levels[0]?.id || 'lvl_0',
      treadInches: 10.0,
      riserInches: 6.5,
      numberOfRisers: 18,
      widthFt: 3.5,
    },
  ];

  const groundFl = design.floors[0];
  const roof: BIMRoof = {
    id: 'rf_main',
    name: 'Reinforced Flat Solar Terrace Roof',
    levelId: levels[levels.length - 1]?.id || 'lvl_0',
    areaSqFt: groundFl?.totalBuiltArea || 1200,
    pitchAngleDeg: 0,
    parapetHeightFt: 3.5,
    hasSolarPV: true,
    solarCapacityKW: 5.4,
  };

  // 6. MEP Elements
  const mep: BIMMEPElement[] = [
    { id: 'mep_rwh_01', name: '10,000L Underground RWH Sump', type: 'rwh_sump', levelId: 'lvl_0', x: 2, y: 2, capacity: '10,000 Liters' },
    { id: 'mep_elec_01', name: 'Main 3-Phase Electrical Distribution Panel', type: 'electrical_panel', levelId: 'lvl_0', x: 4, y: 0, capacity: '15 kVA' },
    { id: 'mep_solar_01', name: '5kW Hybrid Solar Grid-Tied Inverter', type: 'solar_inverter', levelId: levels[levels.length - 1]?.id || 'lvl_0', x: 8, y: 8, capacity: '5.4 kWp' },
  ];

  // 7. Spatial Containment Relationships
  levels.forEach((lvl) => {
    const spaceIds = spaces.filter((s) => s.levelId === lvl.id).map((s) => s.id);
    const wallIds = walls.filter((w) => w.levelId === lvl.id).map((w) => w.id);
    relationships.push({
      id: `rel_contain_${lvl.id}`,
      type: 'IfcRelContainedInSpatialStructure',
      relatingId: lvl.id,
      relatedIds: [...spaceIds, ...wallIds],
    });
  });

  return {
    id: buildingId,
    name: design.name || 'ArchAI Parametric Building',
    version: '1.0.0',
    ifcSchema: 'IFC4',
    createdAt: new Date().toISOString(),
    site: bimSite,
    levels,
    spaces,
    walls,
    slabs,
    columns,
    beams,
    doors,
    windows,
    stairs,
    roof,
    furniture,
    materials: STANDARD_MATERIALS,
    mep,
    relationships,
  };
}
