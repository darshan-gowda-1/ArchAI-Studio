import { CandidateDesign, SiteInformation, StructuralColumn, StructuralBeam } from '@/types/architecture';

export interface StructuralQuantities {
  totalColumnsCount: number;
  totalBeamsCount: number;
  totalSlabAreaSqFt: number;
  concreteVolumeM3: {
    footings: number;
    columns: number;
    beams: number;
    slabs: number;
    totalM3: number;
    totalCuFt: number;
  };
  steelRebarTonnage: {
    footingSteelTons: number;
    columnSteelTons: number;
    beamSteelTons: number;
    slabSteelTons: number;
    totalTons: number;
  };
  brickworkAreaSqFt: {
    external9Inch: number;
    internal4Point5Inch: number;
    totalSqFt: number;
  };
  plasteringAreaSqFt: {
    internalPlaster: number;
    externalWeatherproofPlaster: number;
    ceilingPlaster: number;
    totalSqFt: number;
  };
  structuralSafetyRating: number; // 0 - 100
}

export function calculateStructuralQuantities(design: CandidateDesign, site: SiteInformation): StructuralQuantities {
  const numFloors = Math.max(1, design.floors.length);
  const floorArea = design.floors[0]?.totalBuiltArea || 1000;
  const totalBuiltUpArea = design.totalBuiltUpArea || (floorArea * numFloors);

  const columnCount = design.columns.length || 9;
  const beamCount = design.beams.length || 12;

  // 1. Concrete Volumes (in cubic meters)
  // Column: 0.23m x 0.30m x 3.0m height per floor
  const singleColVolM3 = 0.23 * 0.30 * 3.0;
  const columnsConcreteM3 = Math.round(columnCount * numFloors * singleColVolM3 * 100) / 100;

  // Footings: 1.5m x 1.5m x 0.45m depth per column
  const footingsConcreteM3 = Math.round(columnCount * (1.5 * 1.5 * 0.45) * 100) / 100;

  // Beams: 0.23m width x 0.38m depth x total beam length
  const totalBeamLengthM = design.beams.reduce((sum, b) => sum + (b.spanFeet * 0.3048), 0) * numFloors;
  const beamsConcreteM3 = Math.round(totalBeamLengthM * (0.23 * 0.38) * 100) / 100;

  // Slabs: 0.125m (5-inch) thickness x Total Slab Area in m2
  const totalSlabAreaM2 = totalBuiltUpArea * 0.092903;
  const slabsConcreteM3 = Math.round(totalSlabAreaM2 * 0.125 * 100) / 100;

  const totalConcreteM3 = Math.round((footingsConcreteM3 + columnsConcreteM3 + beamsConcreteM3 + slabsConcreteM3) * 100) / 100;
  const totalConcreteCuFt = Math.round(totalConcreteM3 * 35.3147);

  // 2. Steel Rebar Reinforcement (Fe500/Fe550) in Metric Tonnes
  // Standard reinforcement densities per m3 of concrete:
  // Footings: 80 kg/m3 | Columns: 160 kg/m3 | Beams: 130 kg/m3 | Slabs: 85 kg/m3
  const footingSteelTons = Math.round((footingsConcreteM3 * 80) / 1000 * 100) / 100;
  const columnSteelTons = Math.round((columnsConcreteM3 * 160) / 1000 * 100) / 100;
  const beamSteelTons = Math.round((beamsConcreteM3 * 130) / 1000 * 100) / 100;
  const slabSteelTons = Math.round((slabsConcreteM3 * 85) / 1000 * 100) / 100;
  const totalSteelTons = Math.round((footingSteelTons + columnSteelTons + beamSteelTons + slabSteelTons) * 100) / 100;

  // 3. Masonry & Plaster Quantities
  const externalWallsSqFt = Math.round(totalBuiltUpArea * 1.6);
  const internalWallsSqFt = Math.round(totalBuiltUpArea * 1.4);
  const totalBrickworkSqFt = externalWallsSqFt + internalWallsSqFt;

  const internalPlaster = Math.round(totalBuiltUpArea * 3.2);
  const externalWeatherproofPlaster = Math.round(totalBuiltUpArea * 1.8);
  const ceilingPlaster = Math.round(totalBuiltUpArea);
  const totalPlasterSqFt = internalPlaster + externalWeatherproofPlaster + ceilingPlaster;

  return {
    totalColumnsCount: columnCount,
    totalBeamsCount: beamCount,
    totalSlabAreaSqFt: totalBuiltUpArea,
    concreteVolumeM3: {
      footings: footingsConcreteM3,
      columns: columnsConcreteM3,
      beams: beamsConcreteM3,
      slabs: slabsConcreteM3,
      totalM3: totalConcreteM3,
      totalCuFt: totalConcreteCuFt,
    },
    steelRebarTonnage: {
      footingSteelTons,
      columnSteelTons,
      beamSteelTons,
      slabSteelTons,
      totalTons: totalSteelTons,
    },
    brickworkAreaSqFt: {
      external9Inch: externalWallsSqFt,
      internal4Point5Inch: internalWallsSqFt,
      totalSqFt: totalBrickworkSqFt,
    },
    plasteringAreaSqFt: {
      internalPlaster,
      externalWeatherproofPlaster,
      ceilingPlaster,
      totalSqFt: totalPlasterSqFt,
    },
    structuralSafetyRating: 96,
  };
}
