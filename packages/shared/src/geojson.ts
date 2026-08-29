/**
 * ArchAI Studio v3 - Shared GeoJSON Converters
 */

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export function pointsToGeoJSONPolygon(points: { x: number; y: number }[]): GeoJSONPolygon {
  const coords: [number, number][] = points.map((p) => [p.x, p.y]);
  if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
    coords.push([coords[0][0], coords[0][1]]);
  }
  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}
