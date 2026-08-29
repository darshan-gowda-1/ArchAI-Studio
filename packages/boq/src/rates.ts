/**
 * ArchAI Studio v3 - Regional Schedule of Rates (SOR)
 */

export interface ScheduleOfRates {
  region: string;
  currency: string;
  rccConcretePerCuM: number;       // INR / cu.m
  aacBlockMasonry200PerSqFt: number; // INR / sq.ft
  aacBlockMasonry100PerSqFt: number; // INR / sq.ft
  rccSlab150mmPerSqFt: number;      // INR / sq.ft
  marbleFlooringPerSqFt: number;    // INR / sq.ft
  vitrifiedTilePerSqFt: number;     // INR / sq.ft
  upvcGlazedWindowPerSqFt: number;  // INR / sq.ft
  solidTeakDoorPerUnit: number;     // INR / unit
  flushDoorPerUnit: number;         // INR / unit
  plumbingPerBathroom: number;      // INR / bathroom
  electricalPerSqFt: number;        // INR / sq.ft
  solarPVPerKW: number;             // INR / kW
}

export const MUMBAI_METRO_RATES_2026: ScheduleOfRates = {
  region: 'Mumbai Metropolitan Region (MMR)',
  currency: 'INR',
  rccConcretePerCuM: 7800,
  aacBlockMasonry200PerSqFt: 145,
  aacBlockMasonry100PerSqFt: 95,
  rccSlab150mmPerSqFt: 320,
  marbleFlooringPerSqFt: 380,
  vitrifiedTilePerSqFt: 180,
  upvcGlazedWindowPerSqFt: 750,
  solidTeakDoorPerUnit: 24000,
  flushDoorPerUnit: 14000,
  plumbingPerBathroom: 95000,
  electricalPerSqFt: 160,
  solarPVPerKW: 48000,
};
