import {
  CandidateDesign,
  SiteInformation,
  BuildingRequirements,
  RoomPolygon,
} from '@/types/architecture';

export interface ArchitecturalSheet {
  sheetNumber: string; // e.g. "A-101"
  sheetTitle: string;  // e.g. "GROUND FLOOR ARCHITECTURAL PLAN"
  scale: string;       // e.g. "1:100 (Metric)"
  category: 'Plans' | 'Elevations' | 'Sections' | 'Site' | 'Schedules';
  svgContent: string;
}

export interface DoorScheduleItem {
  tag: string;
  roomServed: string;
  widthFt: number;
  heightFt: number;
  sillHeightFt: number;
  lintelHeightFt: number;
  material: string;
  count: number;
}

export interface WindowScheduleItem {
  tag: string;
  roomServed: string;
  widthFt: number;
  heightFt: number;
  sillHeightFt: number;
  lintelHeightFt: number;
  glazingType: string;
  count: number;
}

export interface AreaStatementReport {
  plotAreaSqFt: number;
  groundCoverageSqFt: number;
  groundCoveragePercent: number;
  totalCarpetAreaSqFt: number;
  totalBuiltUpAreaSqFt: number;
  totalSuperBuiltUpAreaSqFt: number;
  permissibleFar: number;
  achievedFar: number;
  openSpacePercent: number;
}

export interface ArchitecturalDrawingSet {
  projectTitle: string;
  clientName: string;
  jurisdiction: string;
  date: string;
  sheets: ArchitecturalSheet[];
  doorSchedule: DoorScheduleItem[];
  windowSchedule: WindowScheduleItem[];
  areaStatement: AreaStatementReport;
}

/**
 * Generates a complete professional set of Architectural Construction Drawings & Schedules
 */
export function generateArchitecturalDrawingSet(
  design: CandidateDesign,
  site: SiteInformation,
  req: BuildingRequirements
): ArchitecturalDrawingSet {
  const plotArea = site.length * site.width;
  const groundFloor = design.floors.find((f) => f.floorNumber === 0);
  const groundCoverage = groundFloor ? groundFloor.totalBuiltArea : Math.round(plotArea * 0.45);
  const totalCarpet = Math.round(design.totalBuiltUpArea * 0.82);
  const totalBuiltUp = design.totalBuiltUpArea;
  const totalSuperBuiltUp = Math.round(design.totalBuiltUpArea * 1.25);
  const permissibleFar = site.buildingCodeJurisdiction === 'NBC_INDIA' ? 2.0 : 1.75;
  const achievedFar = +(totalBuiltUp / Math.max(1, plotArea)).toFixed(2);

  // 1. Door & Window Schedules
  const doorSchedule: DoorScheduleItem[] = [
    { tag: 'D1', roomServed: 'Main Entrance Foyer', widthFt: 3.5, heightFt: 7.5, sillHeightFt: 0.0, lintelHeightFt: 7.5, material: 'Teakwood Panel Door with Brass Mortise Lock', count: 1 },
    { tag: 'D2', roomServed: 'Bedrooms & Kitchen', widthFt: 3.0, heightFt: 7.0, sillHeightFt: 0.0, lintelHeightFt: 7.0, material: 'Heavy Laminated Solid Flush Door', count: req.bedrooms + 2 },
    { tag: 'D3', roomServed: 'Bathrooms & Utility', widthFt: 2.5, heightFt: 7.0, sillHeightFt: 0.0, lintelHeightFt: 7.0, material: 'Waterproof FRP / PVC Door', count: req.bathrooms + 1 },
  ];

  const windowSchedule: WindowScheduleItem[] = [
    { tag: 'W1', roomServed: 'Living & Master Suite', widthFt: 6.0, heightFt: 5.0, sillHeightFt: 2.5, lintelHeightFt: 7.5, glazingType: 'UPVC 3-Track Sliding with Low-E Double Glazing', count: 3 },
    { tag: 'W2', roomServed: 'Bedrooms & Dining', widthFt: 4.5, heightFt: 4.5, sillHeightFt: 3.0, lintelHeightFt: 7.5, glazingType: 'UPVC 2-Track Sliding with Clear Toughened Glass', count: req.bedrooms + 1 },
    { tag: 'V1', roomServed: 'Bathrooms (Ventilator)', widthFt: 2.0, heightFt: 2.0, sillHeightFt: 5.5, lintelHeightFt: 7.5, glazingType: 'Frosted Glass Louvers with Exhaust Port', count: req.bathrooms },
  ];

  const areaStatement: AreaStatementReport = {
    plotAreaSqFt: plotArea,
    groundCoverageSqFt: groundCoverage,
    groundCoveragePercent: Math.round((groundCoverage / plotArea) * 100),
    totalCarpetAreaSqFt: totalCarpet,
    totalBuiltUpAreaSqFt: totalBuiltUp,
    totalSuperBuiltUpAreaSqFt: totalSuperBuiltUp,
    permissibleFar,
    achievedFar,
    openSpacePercent: 100 - Math.round((groundCoverage / plotArea) * 100),
  };

  const sheets: ArchitecturalSheet[] = [];

  // Sheet A-101: Ground Floor Plan
  sheets.push({
    sheetNumber: 'A-101',
    sheetTitle: 'GROUND FLOOR ARCHITECTURAL PLAN',
    scale: '1:100 @ A1',
    category: 'Plans',
    svgContent: `<svg viewBox="0 0 800 500" class="w-full h-full bg-white text-slate-900 font-sans">
      <rect x="20" y="20" width="760" height="460" fill="none" stroke="#0f172a" stroke-width="2"/>
      <line x1="20" y1="420" x2="780" y2="420" stroke="#0f172a" stroke-width="1.5"/>
      <line x1="560" y1="420" x2="560" y2="480" stroke="#0f172a" stroke-width="1.5"/>
      <text x="40" y="445" font-size="14" font-weight="bold" fill="#0f172a">PROJECT: ARCHAI RESIDENCE</text>
      <text x="40" y="465" font-size="11" fill="#475569">LOCATION: ${site.locationState || 'MUMBAI, INDIA'} • CODE: ${site.buildingCodeJurisdiction}</text>
      <text x="580" y="445" font-size="12" font-weight="bold" fill="#0f172a">SHEET A-101</text>
      <text x="580" y="465" font-size="10" fill="#475569">GROUND FLOOR PLAN (1:100)</text>
      <rect x="180" y="70" width="420" height="310" fill="#f8fafc" stroke="#0f172a" stroke-width="3"/>
      <rect x="200" y="90" width="180" height="150" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
      <text x="290" y="165" font-size="12" font-weight="bold" fill="#0369a1" text-anchor="middle">LIVING HALL</text>
      <text x="290" y="182" font-size="10" fill="#0284c7" text-anchor="middle">14'-0" × 16'-0" • ±0.00 LVL</text>
      <rect x="400" y="90" width="180" height="130" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
      <text x="490" y="155" font-size="12" font-weight="bold" fill="#b45309" text-anchor="middle">DINING SPACE</text>
      <text x="490" y="172" font-size="10" fill="#d97706" text-anchor="middle">12'-0" × 13'-0"</text>
      <rect x="400" y="240" width="180" height="120" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
      <text x="490" y="300" font-size="12" font-weight="bold" fill="#b91c1c" text-anchor="middle">KITCHEN (AGNI)</text>
      <text x="490" y="317" font-size="10" fill="#dc2626" text-anchor="middle">10'-0" × 12'-0"</text>
      <rect x="200" y="260" width="180" height="100" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>
      <text x="290" y="315" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">PARKING &amp; FOYER</text>
      <line x1="160" y1="395" x2="620" y2="395" stroke="#f59e0b" stroke-width="6"/>
      <text x="390" y="412" font-size="10" font-weight="bold" fill="#b45309" text-anchor="middle">ROAD FRONTAGE (${site.roadWidth}'-0" WIDE)</text>
    </svg>`,
  });

  // Sheet A-301: Cross Section A-A (Transverse Cut)
  sheets.push({
    sheetNumber: 'A-301',
    sheetTitle: 'BUILDING CROSS SECTION A-A (TRANSVERSE)',
    scale: '1:100 @ A1',
    category: 'Sections',
    svgContent: `<svg viewBox="0 0 800 500" class="w-full h-full bg-white text-slate-900 font-sans">
      <rect x="20" y="20" width="760" height="460" fill="none" stroke="#0f172a" stroke-width="2"/>
      <line x1="20" y1="420" x2="780" y2="420" stroke="#0f172a" stroke-width="1.5"/>
      <text x="40" y="445" font-size="14" font-weight="bold" fill="#0f172a">PROJECT: ARCHAI RESIDENCE</text>
      <text x="40" y="465" font-size="11" fill="#475569">CROSS SECTION A-A • ARCHITECTURAL &amp; STRUCTURAL CLEARANCES</text>
      <text x="580" y="445" font-size="12" font-weight="bold" fill="#0f172a">SHEET A-301</text>
      <text x="580" y="465" font-size="10" fill="#475569">SECTION A-A (1:100)</text>
      <!-- Ground Level Datum Line -->
      <line x1="80" y1="350" x2="700" y2="350" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>
      <text x="710" y="355" font-size="10" font-weight="bold" fill="#64748b">±0.00 GL</text>
      <!-- Plinth Slab -->
      <rect x="180" y="320" width="440" height="30" fill="#cbd5e1" stroke="#0f172a" stroke-width="2"/>
      <text x="710" y="325" font-size="10" font-weight="bold" fill="#0284c7">+0.75m PLINTH</text>
      <!-- Ground Floor Walls & Rooms -->
      <rect x="180" y="200" width="20" height="120" fill="#64748b"/>
      <rect x="390" y="200" width="20" height="120" fill="#64748b"/>
      <rect x="600" y="200" width="20" height="120" fill="#64748b"/>
      <text x="295" y="265" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">LIVING (3.00m CLEAR)</text>
      <text x="500" y="265" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">KITCHEN / DINING</text>
      <!-- First Floor Slab -->
      <rect x="170" y="185" width="460" height="15" fill="#94a3b8" stroke="#0f172a" stroke-width="2"/>
      <text x="710" y="192" font-size="10" font-weight="bold" fill="#0284c7">+3.75m FIRST FL</text>
      <!-- First Floor Walls -->
      <rect x="180" y="70" width="20" height="115" fill="#64748b"/>
      <rect x="390" y="70" width="20" height="115" fill="#64748b"/>
      <rect x="600" y="70" width="20" height="115" fill="#64748b"/>
      <text x="295" y="130" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">MASTER BEDROOM</text>
      <text x="500" y="130" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">BEDROOM 2 / OFFICE</text>
      <!-- Roof Slab & Parapet -->
      <rect x="160" y="55" width="480" height="15" fill="#94a3b8" stroke="#0f172a" stroke-width="2"/>
      <rect x="160" y="25" width="15" height="30" fill="#64748b"/>
      <rect x="625" y="25" width="15" height="30" fill="#64748b"/>
      <text x="710" y="62" font-size="10" font-weight="bold" fill="#0284c7">+6.75m ROOF LVL</text>
      <!-- Solar Array on Roof -->
      <line x1="280" y1="45" x2="380" y2="25" stroke="#2563eb" stroke-width="4"/>
      <text x="330" y="20" font-size="9" font-weight="bold" fill="#2563eb" text-anchor="middle">5.4 kWp SOLAR PV ARRAY</text>
    </svg>`,
  });

  // Sheet A-401: Roof & Solar PV Drainage Plan
  sheets.push({
    sheetNumber: 'A-401',
    sheetTitle: 'ROOFTOP DRAINAGE & SOLAR PV ARRAY MASTER PLAN',
    scale: '1:100 @ A1',
    category: 'Plans',
    svgContent: `<svg viewBox="0 0 800 500" class="w-full h-full bg-white text-slate-900 font-sans">
      <rect x="20" y="20" width="760" height="460" fill="none" stroke="#0f172a" stroke-width="2"/>
      <line x1="20" y1="420" x2="780" y2="420" stroke="#0f172a" stroke-width="1.5"/>
      <text x="40" y="445" font-size="14" font-weight="bold" fill="#0f172a">PROJECT: ARCHAI RESIDENCE</text>
      <text x="40" y="465" font-size="11" fill="#475569">ROOFTOP SOLAR PV SYSTEM, RWH DOWNSPOUTS &amp; WATERPROOFING DRAINAGE</text>
      <text x="580" y="445" font-size="12" font-weight="bold" fill="#0f172a">SHEET A-401</text>
      <text x="580" y="465" font-size="10" fill="#475569">ROOF PLAN (1:100)</text>
      <rect x="180" y="70" width="420" height="310" fill="#f8fafc" stroke="#0f172a" stroke-width="3"/>
      <!-- Solar Panels Grid -->
      <g fill="#1e3a8a" stroke="#60a5fa" stroke-width="1">
        <rect x="220" y="100" width="70" height="45" rx="2"/>
        <rect x="300" y="100" width="70" height="45" rx="2"/>
        <rect x="380" y="100" width="70" height="45" rx="2"/>
        <rect x="220" y="155" width="70" height="45" rx="2"/>
        <rect x="300" y="155" width="70" height="45" rx="2"/>
        <rect x="380" y="155" width="70" height="45" rx="2"/>
      </g>
      <text x="335" y="225" font-size="11" font-weight="bold" fill="#1e3a8a" text-anchor="middle">5.4 kWp MONOCRYSTALLINE PV (SOUTH 180° AZIMUTH)</text>
      <!-- Overhead Water Tank -->
      <rect x="490" y="100" width="80" height="80" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
      <text x="530" y="145" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">2,000L OHT</text>
      <!-- Rainwater Downspouts & Slopes -->
      <circle cx="195" cy="85" r="8" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
      <text x="195" y="88" font-size="8" fill="#ffffff" font-weight="bold" text-anchor="middle">RW</text>
      <circle cx="585" cy="85" r="8" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
      <text x="585" y="88" font-size="8" fill="#ffffff" font-weight="bold" text-anchor="middle">RW</text>
      <text x="390" y="340" font-size="11" fill="#64748b" text-anchor="middle">SLOPE 1:100 TOWARD GREEN RWH DOWNSPOUTS ➔</text>
    </svg>`,
  });

  return {
    projectTitle: 'ArchAI Modern Sustainable Residence',
    clientName: 'Darshan Studio',
    jurisdiction: site.buildingCodeJurisdiction,
    date: '2024-Q3',
    sheets,
    doorSchedule,
    windowSchedule,
    areaStatement,
  };
}
