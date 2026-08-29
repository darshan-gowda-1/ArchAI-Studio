import { Orientation } from '@/types/architecture';

export interface GeocodingResult {
  displayName: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  boundingBox?: [number, number, number, number]; // [minLat, maxLat, minLon, maxLon]
  climateZone: 'Tropical' | 'Subtropical' | 'Temperate' | 'Arid' | 'Continental';
}

/**
 * Searches global locations using OpenStreetMap Nominatim Geocoding API
 * NOTE: Road orientation is NEVER inferred from latitude/hemisphere.
 * Road orientation is selected by the user or computed directly from site polygon geometry.
 */
export async function searchLocation(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'User-Agent': 'ArchAIStudio/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API returned ${response.status}`);
    }

    const data = await response.json();
    return data.map((item: any) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      const displayName = item.display_name;
      const parts = displayName.split(',');
      const city = parts[0].trim();
      const country = parts[parts.length - 1]?.trim() || '';

      // Determine approximate climate zone by absolute latitude
      const absLat = Math.abs(lat);
      let climateZone: GeocodingResult['climateZone'] = 'Subtropical';
      if (absLat < 23.5) climateZone = 'Tropical';
      else if (absLat < 35) climateZone = 'Subtropical';
      else if (absLat < 50) climateZone = 'Temperate';
      else climateZone = 'Continental';

      const bbox: [number, number, number, number] | undefined = item.boundingbox
        ? [parseFloat(item.boundingbox[0]), parseFloat(item.boundingbox[1]), parseFloat(item.boundingbox[2]), parseFloat(item.boundingbox[3])]
        : undefined;

      return {
        displayName,
        city,
        country,
        lat,
        lon,
        boundingBox: bbox,
        climateZone,
      };
    });
  } catch (err) {
    console.warn('Geocoding search failed, returning preset suggestions:', err);
    return getPresetLocations().filter((loc) =>
      loc.displayName.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export function getPresetLocations(): GeocodingResult[] {
  return [
    {
      displayName: 'Mumbai, Maharashtra, India',
      city: 'Mumbai',
      country: 'India',
      lat: 19.076,
      lon: 72.8777,
      climateZone: 'Tropical',
    },
    {
      displayName: 'Bengaluru, Karnataka, India',
      city: 'Bengaluru',
      country: 'India',
      lat: 12.9716,
      lon: 77.5946,
      climateZone: 'Tropical',
    },
    {
      displayName: 'Austin, Texas, United States',
      city: 'Austin',
      country: 'United States',
      lat: 30.2672,
      lon: -97.7431,
      climateZone: 'Subtropical',
    },
    {
      displayName: 'London, England, United Kingdom',
      city: 'London',
      country: 'United Kingdom',
      lat: 51.5074,
      lon: -0.1278,
      climateZone: 'Temperate',
    },
    {
      displayName: 'Dubai, United Arab Emirates',
      city: 'Dubai',
      country: 'United Arab Emirates',
      lat: 25.2048,
      lon: 55.2708,
      climateZone: 'Arid',
    },
  ];
}
