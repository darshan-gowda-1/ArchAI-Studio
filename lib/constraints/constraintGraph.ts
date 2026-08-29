import {
  ArchitecturalConstraintGraph,
  ConstraintEdge,
  CandidateDesign,
  RoomType,
  RoomPolygon,
} from '@/types/architecture';

/**
 * Canonical Architectural Semantic Constraint Graph
 * Encodes fundamental architectural spatial rules, acoustic separation,
 * plumbing cluster efficiencies, and daylight requirements.
 */
export function getCanonicalConstraintGraph(): ArchitecturalConstraintGraph {
  const nodes: RoomType[] = [
    'living',
    'dining',
    'kitchen',
    'bedroom',
    'bathroom',
    'balcony',
    'staircase',
    'parking',
    'office',
    'pooja',
    'utility',
    'corridor',
  ];

  const edges: ConstraintEdge[] = [
    {
      sourceRoomType: 'kitchen',
      targetRoomType: 'dining',
      relation: 'close_to',
      weight: 10,
      description: 'Kitchen must be directly adjacent or connected to Dining for serving efficiency.',
    },
    {
      sourceRoomType: 'kitchen',
      targetRoomType: 'utility',
      relation: 'near',
      weight: 8,
      description: 'Utility / wet washing area should be immediately accessible from Kitchen.',
    },
    {
      sourceRoomType: 'kitchen',
      targetRoomType: 'bedroom',
      relation: 'avoid',
      weight: 7,
      description: 'Kitchen cooking odors and heat should be buffered from sleeping quarters.',
    },
    {
      sourceRoomType: 'bedroom',
      targetRoomType: 'bathroom',
      relation: 'close_to',
      weight: 10,
      description: 'En-suite or direct private access from Bedroom to Bathroom.',
    },
    {
      sourceRoomType: 'bedroom',
      targetRoomType: 'living',
      relation: 'away_from',
      weight: 8,
      description: 'Acoustic privacy: Master bedroom should be isolated from living entertainment noise.',
    },
    {
      sourceRoomType: 'pooja',
      targetRoomType: 'bathroom',
      relation: 'avoid',
      weight: 10,
      description: 'Vedic Sanctity: Pooja room must never share a common wall or drain with a Bathroom.',
    },
    {
      sourceRoomType: 'bathroom',
      targetRoomType: 'bathroom',
      relation: 'plumbing_adjacent',
      weight: 9,
      description: 'Back-to-back bathroom plumbing clusters reduce CPVC piping runs and leakage risks.',
    },
    {
      sourceRoomType: 'bathroom',
      targetRoomType: 'bathroom',
      relation: 'vertical_aligned',
      weight: 10,
      description: 'Vertical stack alignment: Upper-floor bathrooms directly over ground-floor bathrooms.',
    },
    {
      sourceRoomType: 'staircase',
      targetRoomType: 'staircase',
      relation: 'vertical_aligned',
      weight: 10,
      description: 'Structural core alignment: Stairs must align exactly on identical (x, y) coordinates across all floors.',
    },
  ];

  return { nodes, edges };
}

/**
 * Calculates euclidean distance between two room centroids
 */
function getRoomCentroidDistance(r1: RoomPolygon, r2: RoomPolygon): number {
  const c1x = r1.x + r1.width / 2;
  const c1y = r1.y + r1.height / 2;
  const c2x = r2.x + r2.width / 2;
  const c2y = r2.y + r2.height / 2;
  return Math.hypot(c1x - c2x, c1y - c2y);
}

/**
 * Evaluates a design candidate against the Architectural Constraint Graph
 */
export function evaluateDesignAdjacencies(
  design: CandidateDesign,
  graph: ArchitecturalConstraintGraph = getCanonicalConstraintGraph()
): {
  totalScore: number; // 0 - 100
  violations: string[];
  satisfied: string[];
} {
  let earnedScore = 0;
  let maxPossibleScore = 0;
  const violations: string[] = [];
  const satisfied: string[] = [];

  const allRooms = design.floors.flatMap((f) => f.rooms);

  graph.edges.forEach((edge) => {
    maxPossibleScore += edge.weight;

    const sources = allRooms.filter((r) => r.type === edge.sourceRoomType);
    const targets = allRooms.filter((r) => r.type === edge.targetRoomType);

    if (sources.length === 0 || targets.length === 0) {
      earnedScore += edge.weight; // Neutral if room type is not in requirements
      return;
    }

    if (edge.relation === 'close_to' || edge.relation === 'near') {
      let isClose = false;
      for (const s of sources) {
        for (const t of targets) {
          if (s.floor === t.floor && getRoomCentroidDistance(s, t) <= 16) {
            isClose = true;
            break;
          }
        }
        if (isClose) break;
      }

      if (isClose) {
        earnedScore += edge.weight;
        satisfied.push(`${edge.sourceRoomType.toUpperCase()} is adjacent to ${edge.targetRoomType.toUpperCase()}`);
      } else {
        violations.push(`${edge.sourceRoomType.toUpperCase()} is separated too far from ${edge.targetRoomType.toUpperCase()}`);
      }
    } else if (edge.relation === 'away_from' || edge.relation === 'avoid') {
      let hasConflict = false;
      for (const s of sources) {
        for (const t of targets) {
          if (s.floor === t.floor && getRoomCentroidDistance(s, t) < 10) {
            hasConflict = true;
            break;
          }
        }
        if (hasConflict) break;
      }

      if (!hasConflict) {
        earnedScore += edge.weight;
        satisfied.push(`${edge.sourceRoomType.toUpperCase()} is properly isolated from ${edge.targetRoomType.toUpperCase()}`);
      } else {
        violations.push(`${edge.sourceRoomType.toUpperCase()} is in close conflict with ${edge.targetRoomType.toUpperCase()}`);
      }
    } else if (edge.relation === 'vertical_aligned') {
      let isAligned = true;
      if (design.floors.length > 1) {
        const f0Rooms = design.floors[0]?.rooms.filter((r) => r.type === edge.sourceRoomType) || [];
        const f1Rooms = design.floors[1]?.rooms.filter((r) => r.type === edge.targetRoomType) || [];

        if (f0Rooms.length > 0 && f1Rooms.length > 0) {
          const dist = getRoomCentroidDistance(f0Rooms[0], f1Rooms[0]);
          if (dist > 6) {
            isAligned = false;
          }
        }
      }

      if (isAligned) {
        earnedScore += edge.weight;
        satisfied.push(`Vertical MEP/Structural Alignment: ${edge.sourceRoomType.toUpperCase()} aligns between floors`);
      } else {
        violations.push(`Vertical Misalignment: ${edge.sourceRoomType.toUpperCase()} does not align over lower floor`);
      }
    } else {
      earnedScore += edge.weight;
    }
  });

  const totalScore = Math.round((earnedScore / Math.max(1, maxPossibleScore)) * 100);

  return {
    totalScore,
    violations,
    satisfied,
  };
}
