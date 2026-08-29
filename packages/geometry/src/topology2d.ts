/**
 * ArchAI Studio v3 - 2D Topology & Computational Geometry Engine
 */

import { Point2D, Space, Wall, Setbacks } from '@archai/building-model';

/**
 * Computes polygon area using Green's theorem (Shoelace formula).
 */
export function calculatePolygonArea(polygon: Point2D[]): number {
  if (!polygon || polygon.length < 3) return 0;
  let area = 0;
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Computes the geometric centroid of a polygon.
 */
export function calculatePolygonCentroid(polygon: Point2D[]): Point2D {
  if (!polygon || polygon.length === 0) return { x: 0, y: 0 };
  if (polygon.length === 1) return polygon[0];
  if (polygon.length === 2) return { x: (polygon[0].x + polygon[1].x) / 2, y: (polygon[0].y + polygon[1].y) / 2 };

  let cx = 0;
  let cy = 0;
  let signedArea = 0;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const p0 = polygon[i];
    const p1 = polygon[(i + 1) % n];
    const cross = p0.x * p1.y - p1.x * p0.y;
    signedArea += cross;
    cx += (p0.x + p1.x) * cross;
    cy += (p0.y + p1.y) * cross;
  }

  signedArea *= 0.5;
  if (Math.abs(signedArea) < 1e-6) {
    const avgX = polygon.reduce((sum, p) => sum + p.x, 0) / n;
    const avgY = polygon.reduce((sum, p) => sum + p.y, 0) / n;
    return { x: avgX, y: avgY };
  }

  return {
    x: Math.round((cx / (6 * signedArea)) * 100) / 100,
    y: Math.round((cy / (6 * signedArea)) * 100) / 100,
  };
}

/**
 * Computes Euclidean distance between two points.
 */
export function distanceBetweenPoints(p1: Point2D, p2: Point2D): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Checks if two segments overlap or are collinear adjacent.
 */
export function areEdgesCollinearAdjacent(
  a1: Point2D,
  a2: Point2D,
  b1: Point2D,
  b2: Point2D,
  tolerance = 0.5
): boolean {
  const d1 = distanceBetweenPoints(a1, b1) + distanceBetweenPoints(a2, b2);
  const d2 = distanceBetweenPoints(a1, b2) + distanceBetweenPoints(a2, b1);
  return d1 < tolerance || d2 < tolerance;
}

/**
 * Derives unique wall centerlines from a set of space polygons.
 */
export function deriveWallsFromSpaces(spaces: Space[], levelIndex: number): Wall[] {
  const edges: { p1: Point2D; p2: Point2D; spaceId: string }[] = [];
  
  spaces
    .filter((s) => s.level_index === levelIndex)
    .forEach((space) => {
      const poly = space.polygon_2d;
      const n = poly.length;
      for (let i = 0; i < n; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % n];
        edges.push({ p1, p2, spaceId: space.id });
      }
    });

  const uniqueWalls: Wall[] = [];
  const edgeCount = edges.length;
  const visited = new Set<number>();

  for (let i = 0; i < edgeCount; i++) {
    if (visited.has(i)) continue;
    const e1 = edges[i];
    let shared = false;

    for (let j = i + 1; j < edgeCount; j++) {
      if (visited.has(j)) continue;
      const e2 = edges[j];
      if (areEdgesCollinearAdjacent(e1.p1, e1.p2, e2.p1, e2.p2)) {
        visited.add(j);
        shared = true;
        break;
      }
    }

    visited.add(i);

    const length = distanceBetweenPoints(e1.p1, e1.p2);
    if (length > 1.0) {
      uniqueWalls.push({
        id: `wall_lvl${levelIndex}_${uniqueWalls.length + 1}`,
        level_index: levelIndex,
        start_point: e1.p1,
        end_point: e1.p2,
        thickness_inches: shared ? 4.5 : 9.0,
        height_ft: 10.0,
        is_exterior: !shared,
        is_load_bearing: !shared,
        material: shared ? 'AAC Partition Block' : 'AAC Block Masonry',
        opening_ids: [],
      });
    }
  }

  return uniqueWalls;
}

/**
 * Computes buildable envelope polygon from boundary and setbacks.
 */
export function computeBuildableEnvelope(
  boundary: Point2D[],
  setbacks: Setbacks
): Point2D[] {
  if (!boundary || boundary.length < 3) return [];
  
  const minX = Math.min(...boundary.map((p) => p.x));
  const maxX = Math.max(...boundary.map((p) => p.x));
  const minY = Math.min(...boundary.map((p) => p.y));
  const maxY = Math.max(...boundary.map((p) => p.y));

  const bx1 = minX + setbacks.side_left;
  const bx2 = maxX - setbacks.side_right;
  const by1 = minY + setbacks.front;
  const by2 = maxY - setbacks.rear;

  if (bx2 <= bx1 || by2 <= by1) {
    return boundary; // fallback if plot too small
  }

  return [
    { x: bx1, y: by1 },
    { x: bx2, y: by1 },
    { x: bx2, y: by2 },
    { x: bx1, y: by2 },
  ];
}
