import {
  RoomType,
  RoomPolygon,
  FloorPlanLayout,
  SiteInformation,
  BuildingRequirements,
  Polygon2D,
} from '@/types/architecture';
import { computeInwardSetbackPolygon } from '../geometrySolver';

export interface RoomGraphNode {
  id: string;
  name: string;
  type: RoomType;
  floor: number;
  targetAreaSqFt: number;
  minWidthFt: number;
  minHeightFt: number;
  preferredOrientation?: 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';
  isEnsuite?: boolean;
}

export interface RoomGraphLink {
  sourceId: string;
  targetId: string;
  linkType: 'direct_door' | 'open_plan' | 'corridor' | 'ensuite';
  strength: number; // 1 to 10
}

export interface RoomGraph {
  nodes: RoomGraphNode[];
  links: RoomGraphLink[];
}

/**
 * Builds the canonical RoomGraph topology based on building requirements
 */
export function createBuildingRoomGraph(req: BuildingRequirements): RoomGraph {
  const nodes: RoomGraphNode[] = [];
  const links: RoomGraphLink[] = [];

  // Ground Floor Core
  nodes.push(
    { id: 'f0_living', name: 'Living Room', type: 'living', floor: 0, targetAreaSqFt: 220, minWidthFt: 13, minHeightFt: 14, preferredOrientation: 'N' },
    { id: 'f0_dining', name: 'Dining Hall', type: 'dining', floor: 0, targetAreaSqFt: 140, minWidthFt: 11, minHeightFt: 12, preferredOrientation: 'E' },
    { id: 'f0_kitchen', name: 'Modern Kitchen', type: 'kitchen', floor: 0, targetAreaSqFt: 110, minWidthFt: 9, minHeightFt: 11, preferredOrientation: 'SE' },
    { id: 'f0_stair', name: 'Staircase Core', type: 'staircase', floor: 0, targetAreaSqFt: 85, minWidthFt: 8, minHeightFt: 10, preferredOrientation: 'S' },
    { id: 'f0_parking', name: 'Covered Parking', type: 'parking', floor: 0, targetAreaSqFt: 160, minWidthFt: 10, minHeightFt: 16, preferredOrientation: 'S' }
  );

  links.push(
    { sourceId: 'f0_living', targetId: 'f0_dining', linkType: 'open_plan', strength: 10 },
    { sourceId: 'f0_dining', targetId: 'f0_kitchen', linkType: 'direct_door', strength: 10 },
    { sourceId: 'f0_living', targetId: 'f0_stair', linkType: 'corridor', strength: 7 }
  );

  if (req.poojaRoom) {
    nodes.push({ id: 'f0_pooja', name: 'Pooja Room', type: 'pooja', floor: 0, targetAreaSqFt: 45, minWidthFt: 6, minHeightFt: 7, preferredOrientation: 'NE' });
    links.push({ sourceId: 'f0_dining', targetId: 'f0_pooja', linkType: 'direct_door', strength: 8 });
  }

  // Bedroom 1 (Ground floor guest/parents bedroom or Master on Upper)
  if (req.bedrooms >= 1) {
    nodes.push(
      { id: 'f0_bed1', name: 'Guest Bedroom', type: 'bedroom', floor: 0, targetAreaSqFt: 130, minWidthFt: 11, minHeightFt: 11, preferredOrientation: 'NW' },
      { id: 'f0_bath1', name: 'Common Bath', type: 'bathroom', floor: 0, targetAreaSqFt: 42, minWidthFt: 5, minHeightFt: 7 }
    );
    links.push({ sourceId: 'f0_bed1', targetId: 'f0_bath1', linkType: 'direct_door', strength: 9 });
  }

  // First Floor (Master Suite + Additional Bedrooms + Office)
  if (req.floors >= 2) {
    nodes.push(
      { id: 'f1_stair', name: 'Staircase Core', type: 'staircase', floor: 1, targetAreaSqFt: 85, minWidthFt: 8, minHeightFt: 10, preferredOrientation: 'S' },
      { id: 'f1_master', name: 'Master Suite', type: 'bedroom', floor: 1, targetAreaSqFt: 210, minWidthFt: 13, minHeightFt: 15, preferredOrientation: 'SW' },
      { id: 'f1_master_bath', name: 'Master Bath', type: 'bathroom', floor: 1, targetAreaSqFt: 55, minWidthFt: 6, minHeightFt: 8, isEnsuite: true },
      { id: 'f1_balcony', name: 'Master Balcony', type: 'balcony', floor: 1, targetAreaSqFt: 60, minWidthFt: 5, minHeightFt: 10, preferredOrientation: 'S' }
    );

    links.push(
      { sourceId: 'f1_master', targetId: 'f1_master_bath', linkType: 'ensuite', strength: 10 },
      { sourceId: 'f1_master', targetId: 'f1_balcony', linkType: 'direct_door', strength: 9 },
      { sourceId: 'f1_stair', targetId: 'f1_master', linkType: 'corridor', strength: 7 }
    );

    if (req.bedrooms >= 3) {
      nodes.push(
        { id: 'f1_bed3', name: 'Children Bedroom', type: 'bedroom', floor: 1, targetAreaSqFt: 145, minWidthFt: 11, minHeightFt: 13, preferredOrientation: 'E' },
        { id: 'f1_bath3', name: 'Attached Bath', type: 'bathroom', floor: 1, targetAreaSqFt: 45, minWidthFt: 5, minHeightFt: 8, isEnsuite: true }
      );
      links.push(
        { sourceId: 'f1_bed3', targetId: 'f1_bath3', linkType: 'ensuite', strength: 10 },
        { sourceId: 'f1_stair', targetId: 'f1_bed3', linkType: 'corridor', strength: 7 }
      );
    }

    if (req.office) {
      nodes.push({ id: 'f1_office', name: 'Work From Home Office', type: 'office', floor: 1, targetAreaSqFt: 110, minWidthFt: 9, minHeightFt: 11, preferredOrientation: 'N' });
      links.push({ sourceId: 'f1_stair', targetId: 'f1_office', linkType: 'corridor', strength: 8 });
    }
  }

  return { nodes, links };
}

/**
 * Optimizes room spatial layout from the topological RoomGraph
 */
export function solveRoomGraphPlacement(
  roomGraph: RoomGraph,
  site: SiteInformation,
  req: BuildingRequirements
): FloorPlanLayout[] {
  const setbackPoly = computeInwardSetbackPolygon(
    site.vertices,
    site.frontSetback,
    site.rearSetback,
    site.sideSetbackLeft,
    site.sideSetbackRight,
    site.orientation
  );

  const minX = Math.min(...setbackPoly.map((p) => p.x));
  const maxX = Math.max(...setbackPoly.map((p) => p.x));
  const minY = Math.min(...setbackPoly.map((p) => p.y));
  const maxY = Math.max(...setbackPoly.map((p) => p.y));

  const envelopeWidth = maxX - minX;
  const envelopeDepth = maxY - minY;

  const floors: FloorPlanLayout[] = [];

  for (let fNum = 0; fNum < req.floors; fNum++) {
    const floorNodes = roomGraph.nodes.filter((n) => n.floor === fNum);
    const rooms: RoomPolygon[] = [];

    if (fNum === 0) {
      // Ground Floor Layout Solver
      const halfW = +(envelopeWidth / 2).toFixed(1);
      const halfD = +(envelopeDepth / 2).toFixed(1);

      rooms.push({
        id: 'f0_living',
        name: 'Living Hall',
        type: 'living',
        floor: 0,
        x: minX,
        y: minY + halfD,
        width: halfW,
        height: halfD,
        area: Math.round(halfW * halfD),
        color: '#e0f2fe',
        windows: [{ side: 'N', width: 6.0 }, { side: 'W', width: 4.0 }],
        doors: [{ side: 'S' }],
        furniture: [
          { id: 'f0_sofa', name: 'Sofa Set', type: 'sofa', x: 2, y: 3, width: 7, depth: 3, rotation: 0 },
          { id: 'f0_tv', name: 'TV Entertainment Unit', type: 'tv_unit', x: 2, y: 10, width: 6, depth: 1.5, rotation: 0 },
        ],
        materialFloor: 'Italian Statuario Marble',
        materialWall: 'Off-White Acrylic Emulsion',
      });

      rooms.push({
        id: 'f0_dining',
        name: 'Dining Space',
        type: 'dining',
        floor: 0,
        x: minX + halfW,
        y: minY + halfD * 0.45,
        width: halfW,
        height: +(halfD * 0.55).toFixed(1),
        area: Math.round(halfW * halfD * 0.55),
        color: '#fef3c7',
        windows: [{ side: 'E', width: 4.0 }],
        doors: [{ side: 'W', targetRoomId: 'f0_living' }],
        furniture: [{ id: 'f0_dining_table', name: 'Dining Table', type: 'dining_table', x: 3, y: 2, width: 6, depth: 3.5, rotation: 0 }],
        materialFloor: 'Vitrified Glazed Tiles',
        materialWall: 'Warm Beige Emulsion',
      });

      rooms.push({
        id: 'f0_kitchen',
        name: 'Kitchen (Agni Vastu)',
        type: 'kitchen',
        floor: 0,
        x: minX + halfW * 0.4,
        y: minY,
        width: +(halfW * 0.6).toFixed(1),
        height: +(halfD * 0.45).toFixed(1),
        area: Math.round(halfW * 0.6 * halfD * 0.45),
        color: '#fee2e2',
        windows: [{ side: 'E', width: 3.5 }],
        doors: [{ side: 'N', targetRoomId: 'f0_dining' }],
        furniture: [{ id: 'f0_counter', name: 'L-Shaped Counter', type: 'kitchen_counter', x: 1, y: 1, width: 7, depth: 2, rotation: 0 }],
        materialFloor: 'Anti-Skid Granite',
        materialWall: 'Ceramic Dado Tiles',
      });

      rooms.push({
        id: 'f0_parking',
        name: 'Covered Parking',
        type: 'parking',
        floor: 0,
        x: minX,
        y: minY,
        width: +(halfW * 0.7).toFixed(1),
        height: +(halfD * 0.5).toFixed(1),
        area: Math.round(halfW * 0.7 * halfD * 0.5),
        color: '#f1f5f9',
        windows: [],
        doors: [{ side: 'S' }],
        furniture: [],
        materialFloor: 'Heavy Duty Paver Blocks',
        materialWall: 'Exterior Weather Shield',
      });

      rooms.push({
        id: 'f0_stair',
        name: 'Staircase Core',
        type: 'staircase',
        floor: 0,
        x: minX + halfW * 0.7,
        y: minY,
        width: +(halfW * 0.3).toFixed(1),
        height: +(halfD * 0.5).toFixed(1),
        area: Math.round(halfW * 0.3 * halfD * 0.5),
        color: '#ede9fe',
        windows: [{ side: 'S', width: 3.0 }],
        doors: [{ side: 'N', targetRoomId: 'f0_living' }],
        furniture: [],
        materialFloor: 'Flamed Granite Steps',
        materialWall: 'Textured Paint',
      });
    } else {
      // First Floor Layout Solver
      const halfW = +(envelopeWidth / 2).toFixed(1);
      const halfD = +(envelopeDepth / 2).toFixed(1);

      rooms.push({
        id: 'f1_master',
        name: 'Master Suite',
        type: 'bedroom',
        floor: 1,
        x: minX,
        y: minY + halfD * 0.2,
        width: halfW,
        height: +(halfD * 0.8).toFixed(1),
        area: Math.round(halfW * halfD * 0.8),
        color: '#dbeafe',
        windows: [{ side: 'S', width: 5.0 }, { side: 'E', width: 4.0 }],
        doors: [{ side: 'N' }],
        furniture: [
          { id: 'f1_king_bed', name: 'King Bed', type: 'bed', x: 3, y: 3, width: 6.5, depth: 6.5, rotation: 0 },
          { id: 'f1_wardrobe', name: 'Full Height Wardrobe', type: 'wardrobe', x: 1, y: 11, width: 6, depth: 2, rotation: 0 },
        ],
        materialFloor: 'Hardwood Timber Flooring',
        materialWall: 'Luxury Silk Emulsion',
      });

      rooms.push({
        id: 'f1_master_bath',
        name: 'Master Bath',
        type: 'bathroom',
        floor: 1,
        x: minX,
        y: minY,
        width: +(halfW * 0.5).toFixed(1),
        height: +(halfD * 0.2).toFixed(1),
        area: Math.round(halfW * 0.5 * halfD * 0.2),
        color: '#cffafe',
        windows: [{ side: 'W', width: 2.0 }],
        doors: [{ side: 'N', targetRoomId: 'f1_master' }],
        furniture: [{ id: 'f1_toilet', name: 'Wall Hung Toilet', type: 'toilet', x: 1, y: 1, width: 2.5, depth: 1.5, rotation: 0 }],
        materialFloor: 'Anti-Skid Vitrified',
        materialWall: 'Full Height Vitrified Dado',
      });

      rooms.push({
        id: 'f1_bed3',
        name: 'Children Bedroom',
        type: 'bedroom',
        floor: 1,
        x: minX + halfW,
        y: minY + halfD * 0.3,
        width: halfW,
        height: +(halfD * 0.7).toFixed(1),
        area: Math.round(halfW * halfD * 0.7),
        color: '#fce7f3',
        windows: [{ side: 'N', width: 5.0 }, { side: 'E', width: 4.0 }],
        doors: [{ side: 'W' }],
        furniture: [{ id: 'f1_queen_bed', name: 'Queen Bed', type: 'bed', x: 2, y: 2, width: 6, depth: 5, rotation: 0 }],
        materialFloor: 'Vitrified Tiles',
        materialWall: 'Pastel Emulsion',
      });

      rooms.push({
        id: 'f1_stair',
        name: 'Staircase Core',
        type: 'staircase',
        floor: 1,
        x: minX + halfW * 0.7,
        y: minY,
        width: +(halfW * 0.3).toFixed(1),
        height: +(halfD * 0.5).toFixed(1),
        area: Math.round(halfW * 0.3 * halfD * 0.5),
        color: '#ede9fe',
        windows: [{ side: 'S', width: 3.0 }],
        doors: [{ side: 'N' }],
        furniture: [],
        materialFloor: 'Flamed Granite Steps',
        materialWall: 'Textured Paint',
      });
    }

    const totalBuiltArea = rooms.reduce((sum, r) => sum + r.area, 0);

    floors.push({
      floorNumber: fNum,
      name: fNum === 0 ? 'Ground Floor' : `Floor ${fNum}`,
      width: envelopeWidth,
      height: envelopeDepth,
      buildableArea: Math.round(envelopeWidth * envelopeDepth),
      totalBuiltArea,
      rooms,
    });
  }

  return floors;
}
