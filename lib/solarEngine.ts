import { SunlightSimulationState, Orientation } from '@/types/architecture';

export function calculateSunPosition(hourOfDay: number, roadOrientation: Orientation): SunlightSimulationState {
  // Solar hour 6 AM to 6 PM (6.0 to 18.0)
  const isDaytime = hourOfDay >= 6.0 && hourOfDay <= 18.0;

  // Normalized time 0 at 6am, 1 at 18pm
  const progress = (hourOfDay - 6) / 12;
  const azimuth = Math.round(progress * 180); // 0 (East) -> 90 (South) -> 180 (West)
  const elevation = isDaytime ? Math.round(Math.sin(progress * Math.PI) * 75) : 0;

  const illuminatedRooms: string[] = [];

  if (isDaytime) {
    if (azimuth < 60) {
      illuminatedRooms.push('f0_kitchen', 'f0_dining', 'f1_office'); // East light
    } else if (azimuth <= 120) {
      illuminatedRooms.push('f0_living', 'f1_master', 'f1_balcony'); // South / Overhead light
    } else {
      illuminatedRooms.push('f0_bedroom', 'f1_balcony'); // West light
    }
  }

  return {
    timeOfDay: hourOfDay,
    azimuth,
    elevation,
    illuminatedRooms,
  };
}
