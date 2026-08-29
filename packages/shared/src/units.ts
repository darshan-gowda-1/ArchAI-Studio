/**
 * ArchAI Studio v3 - Shared Unit Conversion Utilities
 */

export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}

export function metersToFeet(meters: number): number {
  return meters / 0.3048;
}

export function sqFtToSqM(sqFt: number): number {
  return sqFt * 0.092903;
}

export function sqMToSqFt(sqM: number): number {
  return sqM / 0.092903;
}

export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
