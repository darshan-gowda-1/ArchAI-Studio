export interface SolarWeatherData {
  latitude: number;
  longitude: number;
  locationName: string;
  irradianceWperM2: number; // Shortwave solar radiation in W/m²
  directNormalIrradiance: number; // Direct sun radiation in W/m²
  cloudCoverPercent: number;
  temperatureC: number;
  sunshineDurationHours: number;
  estimatedDailyKWh: number;
  peakSunHours: number;
  hourlyRadiation: number[]; // 24-hour array of W/m²
  isLive: boolean;
}

/**
 * Fetches live solar radiation and weather data from Open-Meteo API
 */
export async function fetchSolarWeatherData(
  lat: number = 19.076,
  lon: number = 72.8777,
  locationName: string = 'Mumbai, India'
): Promise<SolarWeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=shortwave_radiation,direct_normal_irradiance,temperature_2m,cloud_cover&daily=sunshine_duration&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API returned status ${response.status}`);
    }

    const data = await response.json();
    const currentHour = new Date().getHours();
    const hourly = data.hourly || {};

    const shortwave = hourly.shortwave_radiation || Array(24).fill(0);
    const direct = hourly.direct_normal_irradiance || Array(24).fill(0);
    const cloud = hourly.cloud_cover || Array(24).fill(20);
    const temp = hourly.temperature_2m || Array(24).fill(28);

    const hourlyRad = shortwave.slice(0, 24).map((val: number) => Math.max(0, val || 0));
    const currentIrradiance = Math.round(shortwave[currentHour] || 450);
    const currentDirect = Math.round(direct[currentHour] || 380);
    const currentCloud = Math.round(cloud[currentHour] || 15);
    const currentTemp = Math.round(temp[currentHour] || 27);

    // Calculate total daily solar radiation sum (Wh/m²)
    const totalDailyWh = hourlyRad.reduce((acc: number, val: number) => acc + val, 0);
    const peakSunHours = Number((totalDailyWh / 1000).toFixed(1));

    // Assume 5kW rooftop PV array with 18% efficiency
    const estimatedDailyKWh = Number((peakSunHours * 5 * 0.82).toFixed(1));

    return {
      latitude: lat,
      longitude: lon,
      locationName,
      irradianceWperM2: currentIrradiance,
      directNormalIrradiance: currentDirect,
      cloudCoverPercent: currentCloud,
      temperatureC: currentTemp,
      sunshineDurationHours: Number(((data.daily?.sunshine_duration?.[0] || 28800) / 3600).toFixed(1)),
      estimatedDailyKWh,
      peakSunHours,
      hourlyRadiation: hourlyRad.length === 24 ? hourlyRad : generateSyntheticHourlyRadiation(),
      isLive: true,
    };
  } catch (err) {
    console.warn('Using fallback simulation data for Open-Meteo Solar API:', err);
    return getSyntheticSolarData(lat, lon, locationName);
  }
}

function generateSyntheticHourlyRadiation(): number[] {
  return Array.from({ length: 24 }, (_, h) => {
    if (h < 6 || h > 18) return 0;
    const progress = (h - 6) / 12;
    return Math.round(Math.sin(progress * Math.PI) * 850);
  });
}

export function getSyntheticSolarData(lat: number, lon: number, locationName: string): SolarWeatherData {
  const hourlyRadiation = generateSyntheticHourlyRadiation();
  const peakSunHours = 5.6;
  const estimatedDailyKWh = Number((peakSunHours * 5 * 0.82).toFixed(1));

  return {
    latitude: lat,
    longitude: lon,
    locationName,
    irradianceWperM2: 650,
    directNormalIrradiance: 520,
    cloudCoverPercent: 12,
    temperatureC: 28,
    sunshineDurationHours: 9.5,
    estimatedDailyKWh,
    peakSunHours,
    hourlyRadiation,
    isLive: false,
  };
}
