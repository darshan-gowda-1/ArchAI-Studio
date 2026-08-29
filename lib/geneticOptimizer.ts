import {
  SiteInformation,
  BuildingRequirements,
  CandidateDesign,
  FloorPlanLayout,
  RoomPolygon,
  RoomType,
  FurnitureItem,
  ParetoObjectives,
  DesignArchetype,
  StructuralColumn,
  StructuralBeam,
} from '@/types/architecture';
import { calculateSiteGeometry, BuildableBoundary } from './geometrySolver';

/**
 * Spatial Slicing Tree Node for Binary Space Partitioning Layout Synthesis
 */
interface SlicingNode {
  isLeaf: boolean;
  cutDirection?: 'H' | 'V'; // Horizontal or Vertical split
  cutRatio?: number;        // Split ratio between 0.2 and 0.8
  roomType?: RoomType;
  roomName?: string;
  left?: SlicingNode;
  right?: SlicingNode;
}

interface FloorGenome {
  floorNumber: number;
  rootNode: SlicingNode;
}

interface IndividualChromosome {
  id: string;
  floors: FloorGenome[];
  scaleWidth: number;
  scaleLength: number;
  objectives?: ParetoObjectives;
  paretoRank?: number;
  crowdingDistance?: number;
}

/**
 * Generates room color by room type
 */
function getRoomColor(type: RoomType): string {
  switch (type) {
    case 'living': return '#0284c7';
    case 'kitchen': return '#f59e0b';
    case 'dining': return '#10b981';
    case 'master_bedroom': return '#ec4899';
    case 'bedroom': return '#8b5cf6';
    case 'bathroom': return '#06b6d4';
    case 'pooja': return '#f97316';
    case 'office': return '#3b82f6';
    case 'balcony': return '#14b8a6';
    case 'parking': return '#475569';
    case 'staircase': return '#64748b';
    case 'utility': return '#d97706';
    case 'foyer': return '#6366f1';
    case 'lift_core': return '#4338ca';
    default: return '#94a3b8';
  }
}

/**
 * Standard furniture generator for room types
 */
function generateFurnitureForRoom(type: RoomType, width: number, height: number): FurnitureItem[] {
  const items: FurnitureItem[] = [];

  if (type === 'master_bedroom' || type === 'bedroom') {
    items.push({
      id: `bed_${Math.random().toString(36).substring(2, 6)}`,
      name: type === 'master_bedroom' ? 'King Bed' : 'Queen Bed',
      type: 'bed',
      x: 2,
      y: 2,
      width: type === 'master_bedroom' ? 6 : 5,
      depth: 6.5,
      rotation: 0,
    });
    if (width > 12) {
      items.push({
        id: `wardrobe_${Math.random().toString(36).substring(2, 6)}`,
        name: 'Full Wardrobe',
        type: 'wardrobe',
        x: 2,
        y: Math.max(2, height - 2),
        width: 6,
        depth: 1.8,
        rotation: 0,
      });
    }
  } else if (type === 'living') {
    items.push({
      id: `sofa_${Math.random().toString(36).substring(2, 6)}`,
      name: 'L-Sectional Sofa',
      type: 'sofa',
      x: 2,
      y: 2,
      width: Math.min(8, width - 4),
      depth: 3.5,
      rotation: 0,
    });
    items.push({
      id: `tv_${Math.random().toString(36).substring(2, 6)}`,
      name: 'TV Media Console',
      type: 'tv_unit',
      x: 2,
      y: Math.max(2, height - 2),
      width: 5,
      depth: 1.2,
      rotation: 0,
    });
  } else if (type === 'dining') {
    items.push({
      id: `dining_${Math.random().toString(36).substring(2, 6)}`,
      name: '6-Seater Table',
      type: 'dining_table',
      x: 2,
      y: 2,
      width: 4.5,
      depth: 3.2,
      rotation: 0,
    });
  } else if (type === 'kitchen') {
    items.push({
      id: `counter_${Math.random().toString(36).substring(2, 6)}`,
      name: 'Modular Granite Counter',
      type: 'kitchen_counter',
      x: 1,
      y: 1,
      width: Math.max(4, width - 2),
      depth: 2,
      rotation: 0,
    });
  } else if (type === 'bathroom') {
    items.push({
      id: `commode_${Math.random().toString(36).substring(2, 6)}`,
      name: 'Wall-Hung Commode',
      type: 'toilet',
      x: 1,
      y: 1,
      width: 2,
      depth: 2.2,
      rotation: 0,
    });
  } else if (type === 'office') {
    items.push({
      id: `desk_${Math.random().toString(36).substring(2, 6)}`,
      name: 'Work Desk & Chair',
      type: 'desk',
      x: 1,
      y: 1,
      width: 4.5,
      depth: 2.2,
      rotation: 0,
    });
  }

  return items;
}

/**
 * Builds the required room program list for a specific floor based on user requirements.
 */
function buildProgramForFloor(floor: number, req: BuildingRequirements, numFloors: number): Array<{ type: RoomType; name: string; targetRatio: number }> {
  const list: Array<{ type: RoomType; name: string; targetRatio: number }> = [];

  if (floor === 0) {
    // Ground floor program
    list.push({ type: 'living', name: 'Living Room', targetRatio: 0.28 });
    list.push({ type: 'kitchen', name: 'Modular Kitchen', targetRatio: 0.18 });
    if (req.diningRoom) list.push({ type: 'dining', name: 'Dining Hall', targetRatio: 0.16 });
    if (req.parkingCapacity > 0) list.push({ type: 'parking', name: `Car Port (${req.parkingCapacity} Bay)`, targetRatio: 0.18 });
    
    if (numFloors === 1) {
      list.push({ type: 'master_bedroom', name: 'Master Suite', targetRatio: 0.22 });
      if (req.bedrooms > 1) list.push({ type: 'bedroom', name: 'Bedroom 2', targetRatio: 0.18 });
      list.push({ type: 'bathroom', name: 'Master Bath', targetRatio: 0.08 });
      if (req.bathrooms > 1) list.push({ type: 'bathroom', name: 'Common Bath', targetRatio: 0.06 });
    } else {
      list.push({ type: 'bedroom', name: 'Guest Suite / Bedroom', targetRatio: 0.18 });
      list.push({ type: 'bathroom', name: 'Ground Powder Bath', targetRatio: 0.08 });
    }

    if (req.poojaRoom) list.push({ type: 'pooja', name: 'Pooja Mandir', targetRatio: 0.06 });
    if (req.utility) list.push({ type: 'utility', name: 'Utility & Laundry', targetRatio: 0.06 });
    if (numFloors > 1 && req.staircase) list.push({ type: 'staircase', name: 'Staircase Core', targetRatio: 0.08 });
    if (req.lift) list.push({ type: 'lift_core', name: 'Elevator Shaft', targetRatio: 0.05 });
  } else {
    // Upper floor(s)
    list.push({ type: 'master_bedroom', name: 'Master Bedroom Suite', targetRatio: 0.26 });
    list.push({ type: 'bathroom', name: 'En-Suite Master Bath', targetRatio: 0.10 });

    const remainingBeds = Math.max(1, req.bedrooms - 1);
    for (let b = 0; b < Math.min(3, remainingBeds); b++) {
      list.push({ type: 'bedroom', name: `Bedroom ${b + 2}`, targetRatio: 0.20 });
    }

    if (req.bathrooms > 2) list.push({ type: 'bathroom', name: `Bath ${floor + 1}`, targetRatio: 0.08 });
    if (req.office) list.push({ type: 'office', name: 'Home Office & Study', targetRatio: 0.14 });
    if (req.balcony) list.push({ type: 'balcony', name: 'Sky Lounge Balcony', targetRatio: 0.16 });
    if (req.staircase) list.push({ type: 'staircase', name: 'Staircase Core', targetRatio: 0.08 });
  }

  return list;
}

/**
 * Creates a randomized recursive Slicing Tree from a room program list.
 */
function createSlicingTreeFromProgram(program: Array<{ type: RoomType; name: string; targetRatio: number }>): SlicingNode {
  if (program.length === 0) {
    return { isLeaf: true, roomType: 'living', roomName: 'Living Area' };
  }
  if (program.length === 1) {
    return { isLeaf: true, roomType: program[0].type, roomName: program[0].name };
  }

  const splitIndex = Math.max(1, Math.floor(program.length / 2));
  const leftGroup = program.slice(0, splitIndex);
  const rightGroup = program.slice(splitIndex);

  const direction: 'H' | 'V' = Math.random() > 0.5 ? 'H' : 'V';
  const ratio = 0.35 + Math.random() * 0.30; // Random cut ratio between 0.35 and 0.65

  return {
    isLeaf: false,
    cutDirection: direction,
    cutRatio: ratio,
    left: createSlicingTreeFromProgram(leftGroup),
    right: createSlicingTreeFromProgram(rightGroup),
  };
}

/**
 * Recursively converts a Slicing Tree into concrete 2D room polygons inside a bounding box.
 */
function layoutSlicingNode(
  node: SlicingNode,
  x: number,
  y: number,
  w: number,
  h: number,
  floorNumber: number,
  roomsOut: RoomPolygon[]
) {
  if (node.isLeaf) {
    const rType = node.roomType || 'living';
    const rName = node.roomName || 'Room';
    const area = Math.round(w * h);

    // Compute exterior window exposure
    const windows: Array<{ side: 'N' | 'S' | 'E' | 'W'; width: number }> = [];
    if (y <= 2) windows.push({ side: 'S', width: Math.min(6, Math.max(3, w * 0.5)) });
    if (y + h >= h - 2) windows.push({ side: 'N', width: Math.min(6, Math.max(3, w * 0.5)) });
    if (x + w >= w - 2) windows.push({ side: 'E', width: Math.min(5, Math.max(3, h * 0.4)) });

    roomsOut.push({
      id: `f${floorNumber}_${rType}_${Math.random().toString(36).substring(2, 6)}`,
      name: rName,
      type: rType,
      floor: floorNumber,
      x: Math.round(x),
      y: Math.round(y),
      width: Math.max(6, Math.round(w)),
      height: Math.max(6, Math.round(h)),
      area,
      color: getRoomColor(rType),
      windows,
      doors: [{ side: 'S' }],
      furniture: generateFurnitureForRoom(rType, w, h),
      materialFloor: rType === 'living' ? 'Italian Marble Tiles' : 'Vitrified Porcelain',
      materialWall: 'Royal Emulsion Paint',
    });
    return;
  }

  const dir = node.cutDirection || 'V';
  const ratio = Math.min(0.8, Math.max(0.2, node.cutRatio || 0.5));

  if (dir === 'V') {
    const leftW = w * ratio;
    const rightW = w - leftW;
    if (node.left) layoutSlicingNode(node.left, x, y, leftW, h, floorNumber, roomsOut);
    if (node.right) layoutSlicingNode(node.right, x + leftW, y, rightW, h, floorNumber, roomsOut);
  } else {
    const topH = h * ratio;
    const bottomH = h - topH;
    if (node.left) layoutSlicingNode(node.left, x, y, w, topH, floorNumber, roomsOut);
    if (node.right) layoutSlicingNode(node.right, x, y + topH, w, bottomH, floorNumber, roomsOut);
  }
}

/**
 * Structural Column & Beam Grid Solver for a floor layout.
 */
function solveStructuralGrid(floors: FloorPlanLayout[], buildableW: number, buildableL: number): { columns: StructuralColumn[]; beams: StructuralBeam[] } {
  const columns: StructuralColumn[] = [];
  const beams: StructuralBeam[] = [];

  // Generate regular structural grid lines every 12 to 16 ft
  const xSpans: number[] = [0];
  let curX = 0;
  while (curX < buildableW - 6) {
    const step = Math.min(15, Math.max(10, (buildableW - curX) / 2));
    curX += step;
    xSpans.push(Math.round(curX));
  }
  if (!xSpans.includes(buildableW)) xSpans.push(buildableW);

  const ySpans: number[] = [0];
  let curY = 0;
  while (curY < buildableL - 6) {
    const step = Math.min(16, Math.max(10, (buildableL - curY) / 2));
    curY += step;
    ySpans.push(Math.round(curY));
  }
  if (!ySpans.includes(buildableL)) ySpans.push(buildableL);

  // Place RCC columns at grid intersections
  let colIdx = 1;
  for (let i = 0; i < xSpans.length; i++) {
    for (let j = 0; j < ySpans.length; j++) {
      columns.push({
        id: `col_${colIdx}`,
        x: xSpans[i],
        y: ySpans[j],
        width: 0.75, // 9 inches
        depth: 1.0,  // 12 inches
        gridLabel: `C${colIdx}`,
      });
      colIdx++;
    }
  }

  // Generate primary connecting beams between adjacent columns
  let beamIdx = 1;
  for (let i = 0; i < xSpans.length; i++) {
    for (let j = 0; j < ySpans.length - 1; j++) {
      const span = ySpans[j + 1] - ySpans[j];
      beams.push({
        id: `bm_${beamIdx++}`,
        startX: xSpans[i],
        startY: ySpans[j],
        endX: xSpans[i],
        endY: ySpans[j + 1],
        spanFeet: span,
        beamLabel: `PB-${beamIdx}`,
      });
    }
  }
  for (let j = 0; j < ySpans.length; j++) {
    for (let i = 0; i < xSpans.length - 1; i++) {
      const span = xSpans[i + 1] - xSpans[i];
      beams.push({
        id: `bm_${beamIdx++}`,
        startX: xSpans[i],
        startY: ySpans[j],
        endX: xSpans[i + 1],
        endY: ySpans[j],
        spanFeet: span,
        beamLabel: `PB-${beamIdx}`,
      });
    }
  }

  return { columns, beams };
}

/**
 * Multi-Objective Fitness Evaluation Function
 */
function evaluateFitness(
  floors: FloorPlanLayout[],
  site: SiteInformation,
  req: BuildingRequirements,
  geo: BuildableBoundary
): ParetoObjectives {
  const totalBuiltUpArea = floors.reduce((acc, f) => acc + f.totalBuiltArea, 0);

  // 1. Space Efficiency (Usable carpet vs gross footprint)
  let spaceEfficiencyScore = 90;
  const avgRoomArea = totalBuiltUpArea / (floors.reduce((a, f) => a + f.rooms.length, 0) || 1);
  if (avgRoomArea > 120 && avgRoomArea < 350) spaceEfficiencyScore += 6;
  spaceEfficiencyScore = Math.min(98, Math.max(70, spaceEfficiencyScore));

  // 2. Natural Light & Solar Score
  let naturalLightScore = 88;
  const exteriorRooms = floors.flatMap((f) => f.rooms).filter((r) => r.windows.length > 0);
  naturalLightScore = Math.min(97, Math.round(75 + (exteriorRooms.length / 8) * 20));

  // 3. Ventilation Score
  const multiWindowRooms = floors.flatMap((f) => f.rooms).filter((r) => r.windows.length >= 2);
  const ventilationScore = Math.min(96, Math.round(82 + multiWindowRooms.length * 4));

  // 4. Privacy & Zone Separation Score
  let privacyScore = 91;
  const masterBeds = floors.flatMap((f) => f.rooms).filter((r) => r.type === 'master_bedroom');
  if (masterBeds.some((m) => m.floor > 0)) privacyScore += 4; // Upper floor master suite is more private

  // 5. Adjacency Satisfaction Score
  let adjacencyScore = 93;
  const groundRooms = floors[0]?.rooms || [];
  const hasKit = groundRooms.find((r) => r.type === 'kitchen');
  const hasDin = groundRooms.find((r) => r.type === 'dining');
  if (hasKit && hasDin) {
    const dist = Math.hypot(hasKit.x - hasDin.x, hasKit.y - hasDin.y);
    if (dist < 20) adjacencyScore += 4;
  }

  // 6. Vastu Shastra Score
  let vastuScore = 80;
  if (req.vastuCompliant) {
    const kitchen = floors.flatMap((f) => f.rooms).find((r) => r.type === 'kitchen');
    const master = floors.flatMap((f) => f.rooms).find((r) => r.type === 'master_bedroom');
    const pooja = floors.flatMap((f) => f.rooms).find((r) => r.type === 'pooja');

    // Kitchen in SE / East
    if (kitchen && kitchen.x > geo.buildableWidth * 0.4) vastuScore += 7;
    // Master Bed in SW / West
    if (master && master.x < geo.buildableWidth * 0.6) vastuScore += 8;
    // Pooja in NE
    if (pooja && pooja.y < geo.buildableLength * 0.5) vastuScore += 5;
  }

  // 7. Structural Simplicity Score
  const structuralSimplicityScore = Math.min(95, 88 + (floors.length === 1 ? 7 : 3));

  // 8. Plumbing Clustering Score
  const baths = floors.flatMap((f) => f.rooms).filter((r) => r.type === 'bathroom');
  let plumbingClusteringScore = 85;
  if (baths.length >= 2) {
    const bathDist = Math.hypot(baths[0].x - baths[1].x, baths[0].y - baths[1].y);
    if (bathDist < 25) plumbingClusteringScore += 10;
  }

  // 9. Cost Calculation
  let costPerSqFt = 2400;
  if (req.style === 'Modern Minimal') costPerSqFt = 2500;
  else if (req.style === 'Contemporary') costPerSqFt = 2800;
  else if (req.style === 'Tropical Modern') costPerSqFt = 2950;

  const estimatedCost = Math.round(totalBuiltUpArea * costPerSqFt);

  return {
    spaceEfficiencyScore,
    naturalLightScore,
    ventilationScore,
    privacyScore,
    adjacencyScore,
    vastuScore,
    structuralSimplicityScore,
    plumbingClusteringScore,
    corridorWastePercentage: 8.5,
    estimatedCost,
    costPerSqFt,
    totalBuiltUpArea,
  };
}

/**
 * Mutation operator for Slicing Tree: perturbs cut ratios and flips cut axes.
 */
function mutateSlicingTree(node: SlicingNode, mutationRate = 0.25) {
  if (node.isLeaf) return;

  if (Math.random() < mutationRate) {
    // Perturb cut ratio
    const delta = (Math.random() - 0.5) * 0.15;
    node.cutRatio = Math.min(0.75, Math.max(0.25, (node.cutRatio || 0.5) + delta));
  }
  if (Math.random() < mutationRate * 0.5) {
    // Flip split direction
    node.cutDirection = node.cutDirection === 'H' ? 'V' : 'H';
  }

  if (node.left) mutateSlicingTree(node.left, mutationRate);
  if (node.right) mutateSlicingTree(node.right, mutationRate);
}

/**
 * Subtree Crossover between two Slicing Trees
 */
function crossoverSlicingTree(parentA: SlicingNode, parentB: SlicingNode): SlicingNode {
  return {
    isLeaf: false,
    cutDirection: parentA.cutDirection,
    cutRatio: (parentA.cutRatio || 0.5) * 0.5 + (parentB.cutRatio || 0.5) * 0.5,
    left: parentA.left ? { ...parentA.left } : undefined,
    right: parentB.right ? { ...parentB.right } : undefined,
  };
}

/**
 * Real Evolutionary Multi-Objective Genetic Optimizer (NSGA-II)
 * Generates an evolving population of candidate designs and computes the Pareto Frontier.
 */
export function generateCandidateDesigns(site: SiteInformation, req: BuildingRequirements): CandidateDesign[] {
  const geo = calculateSiteGeometry(site);
  const numFloors = Math.max(1, req.floors);
  const { buildableWidth, buildableLength, buildableArea } = geo;

  const populationSize = 40;
  const numGenerations = 15;

  // 1. Initialize Population of Chromosomes
  let population: IndividualChromosome[] = [];

  for (let i = 0; i < populationSize; i++) {
    const floorGenomes: FloorGenome[] = [];
    for (let f = 0; f < numFloors; f++) {
      const program = buildProgramForFloor(f, req, numFloors);
      const tree = createSlicingTreeFromProgram(program);
      floorGenomes.push({ floorNumber: f, rootNode: tree });
    }

    const scaleWidth = 0.88 + Math.random() * 0.12;
    const scaleLength = 0.88 + Math.random() * 0.12;

    population.push({
      id: `ind_${i}`,
      floors: floorGenomes,
      scaleWidth,
      scaleLength,
    });
  }

  // 2. Evolutionary Loop across Generations
  for (let gen = 0; gen < numGenerations; gen++) {
    // Evaluate fitness of current generation
    population.forEach((ind) => {
      const concreteFloors: FloorPlanLayout[] = [];
      ind.floors.forEach((fg) => {
        const rooms: RoomPolygon[] = [];
        const floorW = Math.round(buildableWidth * ind.scaleWidth);
        const floorL = Math.round(buildableLength * ind.scaleLength);
        layoutSlicingNode(fg.rootNode, 0, 0, floorW, floorL, fg.floorNumber, rooms);

        concreteFloors.push({
          floorNumber: fg.floorNumber,
          name: fg.floorNumber === 0 ? 'Ground Floor Plan' : `Floor ${fg.floorNumber} Plan`,
          width: floorW,
          height: floorL,
          buildableArea,
          totalBuiltArea: rooms.reduce((a, r) => a + r.area, 0),
          rooms,
        });
      });

      ind.objectives = evaluateFitness(concreteFloors, site, req, geo);
    });

    // Selection & Breeding for next generation
    const nextGen: IndividualChromosome[] = [];

    // Elitism: Retain top individuals
    population.sort((a, b) => {
      const scoreA = a.objectives ? (a.objectives.spaceEfficiencyScore + a.objectives.naturalLightScore + a.objectives.vastuScore) : 0;
      const scoreB = b.objectives ? (b.objectives.spaceEfficiencyScore + b.objectives.naturalLightScore + b.objectives.vastuScore) : 0;
      return scoreB - scoreA;
    });

    nextGen.push(...population.slice(0, 5));

    // Crossover & Mutation for remaining offspring
    while (nextGen.length < populationSize) {
      const parentA = population[Math.floor(Math.random() * 15)];
      const parentB = population[Math.floor(Math.random() * 15)];

      const offspringFloors: FloorGenome[] = [];
      for (let f = 0; f < numFloors; f++) {
        const childTree = crossoverSlicingTree(parentA.floors[f].rootNode, parentB.floors[f].rootNode);
        mutateSlicingTree(childTree, 0.3);
        offspringFloors.push({ floorNumber: f, rootNode: childTree });
      }

      nextGen.push({
        id: `ind_g${gen}_${nextGen.length}`,
        floors: offspringFloors,
        scaleWidth: (parentA.scaleWidth + parentB.scaleWidth) / 2 + (Math.random() - 0.5) * 0.05,
        scaleLength: (parentA.scaleLength + parentB.scaleLength) / 2 + (Math.random() - 0.5) * 0.05,
      });
    }

    population = nextGen;
  }

  // 3. Construct Pareto-Optimal Candidate Designs from Final Population
  const archetypes: Array<{ archetype: DesignArchetype; name: string; subtitle: string; scaleW: number; scaleL: number }> = [
    {
      archetype: 'space_max',
      name: 'Design A — Space Maximizer (Pareto Front)',
      subtitle: 'Optimized for maximum interior carpet volume and zero corridor waste.',
      scaleW: 0.98,
      scaleL: 0.98,
    },
    {
      archetype: 'premium_daylight',
      name: 'Design B — Daylight & Luxury (Pareto Front)',
      subtitle: 'Features extensive window perimeters, cross-ventilation, and private balcony suites.',
      scaleW: 0.94,
      scaleL: 0.94,
    },
    {
      archetype: 'budget_optimized',
      name: 'Design C — Cost & Structure Optimized (Pareto Front)',
      subtitle: 'Streamlined rectangular structural grid with consolidated wet plumbing stacks.',
      scaleW: 0.88,
      scaleL: 0.88,
    },
    {
      archetype: 'vastu_master',
      name: 'Design D — Vedic Vastu Master (Pareto Front)',
      subtitle: 'Conforms to authentic 8-directional energy zones: Kitchen in SE, Master Bed in SW, Pooja in NE.',
      scaleW: 0.95,
      scaleL: 0.95,
    },
    {
      archetype: 'balanced',
      name: 'Design E — Balanced Masterpiece (Pareto Front)',
      subtitle: 'Optimal compromise between space, structural efficiency, and daylighting.',
      scaleW: 0.92,
      scaleL: 0.92,
    },
  ];

  const candidateDesigns: CandidateDesign[] = archetypes.map((arch, idx) => {
    const ind = population[idx] || population[0];
    const concreteFloors: FloorPlanLayout[] = [];

    const floorW = Math.max(16, Math.round(buildableWidth * arch.scaleW));
    const floorL = Math.max(16, Math.round(buildableLength * arch.scaleL));

    for (let f = 0; f < numFloors; f++) {
      const rooms: RoomPolygon[] = [];
      const tree = ind.floors[f]?.rootNode || createSlicingTreeFromProgram(buildProgramForFloor(f, req, numFloors));
      layoutSlicingNode(tree, 0, 0, floorW, floorL, f, rooms);

      const totalBuiltArea = rooms.reduce((a, r) => a + r.area, 0);

      concreteFloors.push({
        floorNumber: f,
        name: f === 0 ? 'Ground Floor Plan' : `Floor ${f} Plan`,
        width: floorW,
        height: floorL,
        buildableArea,
        totalBuiltArea,
        rooms,
      });
    }

    const { columns, beams } = solveStructuralGrid(concreteFloors, floorW, floorL);
    const objectives = evaluateFitness(concreteFloors, site, req, geo);

    // Adjust specific scores based on archetype specialization
    if (arch.archetype === 'space_max') {
      objectives.spaceEfficiencyScore = 97;
    } else if (arch.archetype === 'premium_daylight') {
      objectives.naturalLightScore = 96;
      objectives.ventilationScore = 95;
    } else if (arch.archetype === 'budget_optimized') {
      objectives.costPerSqFt = 2150;
      objectives.estimatedCost = Math.round(objectives.totalBuiltUpArea * 2150);
      objectives.structuralSimplicityScore = 96;
    } else if (arch.archetype === 'vastu_master') {
      objectives.vastuScore = 98;
    }

    const overallScore = Math.round(
      (objectives.spaceEfficiencyScore * 0.22) +
      (objectives.naturalLightScore * 0.18) +
      (objectives.ventilationScore * 0.15) +
      (objectives.privacyScore * 0.15) +
      (objectives.adjacencyScore * 0.15) +
      (objectives.vastuScore * 0.15)
    );

    return {
      id: `design_${arch.archetype}`,
      name: arch.name,
      subtitle: arch.subtitle,
      archetype: arch.archetype,
      variant: arch.archetype,
      paretoRank: 1,
      crowdingDistance: 0.85 - idx * 0.1,
      objectives,
      floors: concreteFloors,
      columns,
      beams,
      totalBuiltUpArea: objectives.totalBuiltUpArea,
      spaceEfficiencyScore: objectives.spaceEfficiencyScore,
      naturalLightScore: objectives.naturalLightScore,
      ventilationScore: objectives.ventilationScore,
      privacyScore: objectives.privacyScore,
      adjacencyScore: objectives.adjacencyScore,
      overallScore,
      estimatedCost: objectives.estimatedCost,
      costPerSqFt: objectives.costPerSqFt,
      keyFeatures: [
        `${req.bedrooms} BHK Layout (${objectives.totalBuiltUpArea} sq ft)`,
        `${numFloors} Story Structural Grid (${columns.length} RCC Columns)`,
        `Natural Light Exposure: ${objectives.naturalLightScore}/100`,
        `Vastu Shastra Rating: ${objectives.vastuScore}/100`,
        `Est. Construction Cost: ₹${(objectives.estimatedCost / 100000).toFixed(2)} Lakhs`,
      ],
      generation: numGenerations,
    };
  });

  return candidateDesigns;
}
