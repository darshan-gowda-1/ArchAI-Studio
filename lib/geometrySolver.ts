import { SiteInformation, Point2D, Polygon2D, PlotShape, Orientation } from '@/types/architecture';

export interface BuildableBoundary {
  plotLength: number;
  plotWidth: number;
  totalPlotArea: number;
  plotPolygon: Polygon2D;
  buildableLength: number;
  buildableWidth: number;
  buildableArea: number;
  buildableOriginX: number;
  buildableOriginY: number;
  buildablePolygon: Polygon2D;
  setbackFront: number;
  setbackRear: number;
  setbackLeft: number;
  setbackRight: number;
  maxGroundCoverageSqFt: number;
  maxGroundCoveragePercent: number;
  maxTotalAllowedFAR: number;
  centroid: Point2D;
}

/**
 * Computes polygon area using the Shoelace Formula (Green's Theorem).
 */
export function calculatePolygonArea(polygon: Polygon2D): number {
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
 * Computes the geometric centroid of a 2D polygon.
 */
export function calculatePolygonCentroid(polygon: Polygon2D): Point2D {
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
    const cross = (p0.x * p1.y - p1.x * p0.y);
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
 * Raycasting test for point-in-polygon containment (Jordan Curve Theorem).
 */
export function isPointInPolygon(point: Point2D, polygon: Polygon2D): boolean {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  const { x, y } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Generates canonical polygon vertices based on shape configuration and dimensions.
 */
export function generateSitePolygon(shape: PlotShape, width: number, length: number): Polygon2D {
  switch (shape) {
    case 'l_shaped': {
      const cutW = Math.round(width * 0.45);
      const cutL = Math.round(length * 0.45);
      return [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: length - cutL },
        { x: width - cutW, y: length - cutL },
        { x: width - cutW, y: length },
        { x: 0, y: length },
      ];
    }
    case 'trapezoidal': {
      const offset = Math.round(width * 0.15);
      return [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width - offset, y: length },
        { x: offset, y: length },
      ];
    }
    case 'corner_plot':
    case 'rectangular':
    default:
      return [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: length },
        { x: 0, y: length },
      ];
  }
}

/**
 * Line-Line intersection helper for offsetting edges.
 */
function lineIntersection(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): Point2D | null {
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(d) < 1e-6) return null;

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
  return {
    x: Math.round((p1.x + t * (p2.x - p1.x)) * 100) / 100,
    y: Math.round((p1.y + t * (p2.y - p1.y)) * 100) / 100,
  };
}

/**
 * Inward polygon buffering / setback offset solver for arbitrary polygons.
 */
export function computeInwardSetbackPolygon(
  polygon: Polygon2D,
  setbackFront: number,
  setbackRear: number,
  setbackLeft: number,
  setbackRight: number,
  orientation: Orientation
): Polygon2D {
  if (polygon.length < 3) return polygon;

  // For standard rectangular & L-shaped geometries, compute exact inward coordinate shifts
  const xs = polygon.map((p) => p.x);
  const ys = polygon.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const safeLeft = Math.min(setbackLeft, (maxX - minX) * 0.35);
  const safeRight = Math.min(setbackRight, (maxX - minX) * 0.35);
  const safeFront = Math.min(setbackFront, (maxY - minY) * 0.35);
  const safeRear = Math.min(setbackRear, (maxY - minY) * 0.35);

  const insetMinX = minX + safeLeft;
  const insetMaxX = maxX - safeRight;
  const insetMinY = minY + safeFront;
  const insetMaxY = maxY - safeRear;

  if (insetMaxX <= insetMinX + 8 || insetMaxY <= insetMinY + 8) {
    // Fallback minimal buildable core
    return [
      { x: minX + 3, y: minY + 3 },
      { x: maxX - 3, y: minY + 3 },
      { x: maxX - 3, y: maxY - 3 },
      { x: minX + 3, y: maxY - 3 },
    ];
  }

  if (polygon.length === 4) {
    return [
      { x: insetMinX, y: insetMinY },
      { x: insetMaxX, y: insetMinY },
      { x: insetMaxX, y: insetMaxY },
      { x: insetMinX, y: insetMaxY },
    ];
  }

  // Generalized arbitrary polygon shrink toward centroid
  const centroid = calculatePolygonCentroid(polygon);
  const scaleX = Math.max(0.4, 1 - (safeLeft + safeRight) / (maxX - minX));
  const scaleY = Math.max(0.4, 1 - (safeFront + safeRear) / (maxY - minY));

  return polygon.map((p) => ({
    x: Math.round((centroid.x + (p.x - centroid.x) * scaleX) * 100) / 100,
    y: Math.round((centroid.y + (p.y - centroid.y) * scaleY) * 100) / 100,
  }));
}

/**
 * Calculates complete site geometry, setbacks, FAR, ground coverage, and buildable envelope.
 */
export function calculateSiteGeometry(site: SiteInformation): BuildableBoundary {
  const width = site.width || 30;
  const length = site.length || 40;
  const shape = site.shape || 'rectangular';
  const orientation = site.orientation || 'South';

  // Obtain or generate polygon boundary vertices
  const plotPolygon = site.vertices && site.vertices.length >= 3
    ? site.vertices
    : generateSitePolygon(shape, width, length);

  const totalPlotArea = calculatePolygonArea(plotPolygon);
  const centroid = calculatePolygonCentroid(plotPolygon);

  // Regulatory setback calculation based on plot dimensions and road width
  let setbackFront = site.frontSetback || (length > 50 ? 8 : 6);
  let setbackRear = site.rearSetback || (length > 50 ? 6 : 4);
  let setbackLeft = site.sideSetbackLeft || (width > 40 ? 5 : 3.5);
  let setbackRight = site.sideSetbackRight || (width > 40 ? 5 : 3.5);

  // Corner plots: extra clearance on secondary road side
  if (shape === 'corner_plot') {
    setbackLeft = Math.max(setbackLeft, 5);
  }

  // Adjust for orientation
  if (orientation === 'South') {
    setbackRear = Math.max(setbackRear, 5);
  } else if (orientation === 'North') {
    setbackFront = Math.max(setbackFront, 7);
  }

  // Compute exact buildable polygon envelope
  const buildablePolygon = computeInwardSetbackPolygon(
    plotPolygon,
    setbackFront,
    setbackRear,
    setbackLeft,
    setbackRight,
    orientation
  );

  const bXs = buildablePolygon.map((p) => p.x);
  const bYs = buildablePolygon.map((p) => p.y);
  const buildableOriginX = Math.min(...bXs);
  const buildableOriginY = Math.min(...bYs);
  const buildableWidth = Math.max(10, Math.max(...bXs) - buildableOriginX);
  const buildableLength = Math.max(10, Math.max(...bYs) - buildableOriginY);
  const buildableArea = calculatePolygonArea(buildablePolygon);

  // Coverage & FAR regulations
  const maxGroundCoveragePercent = totalPlotArea > 2000 ? 65 : 75;
  const maxGroundCoverageSqFt = Math.round((totalPlotArea * maxGroundCoveragePercent) / 100);
  const maxTotalAllowedFAR = site.buildingCodeJurisdiction === 'IBC_USA' ? 2.5 : 2.25;

  return {
    plotLength: length,
    plotWidth: width,
    totalPlotArea: Math.round(totalPlotArea),
    plotPolygon,
    buildableLength: Math.round(buildableLength),
    buildableWidth: Math.round(buildableWidth),
    buildableArea: Math.round(buildableArea),
    buildableOriginX,
    buildableOriginY,
    buildablePolygon,
    setbackFront,
    setbackRear,
    setbackLeft,
    setbackRight,
    maxGroundCoverageSqFt,
    maxGroundCoveragePercent,
    maxTotalAllowedFAR,
    centroid,
  };
}
