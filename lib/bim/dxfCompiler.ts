import { BIMBuilding, compileDesignToCanonicalBIM } from './canonicalModel';
import { CandidateDesign, SiteInformation } from '@/types/architecture';

/**
 * Generates layered AutoCAD DXF (R12 / R2000 ASCII) vector drawings
 * Opens directly in Autodesk AutoCAD, Civil 3D, LibreCAD, and QCAD.
 */
export function exportToDXF(building: BIMBuilding): string {
  const lines: string[] = [];

  // 1. Header Section
  lines.push('0\nSECTION\n2\nHEADER');
  lines.push('9\n$ACADVER\n1\nAC1009'); // AutoCAD R12 standard ASCII compatibility
  lines.push('9\n$INSUNITS\n70\n2');   // Feet
  lines.push('0\nENDSEC');

  // 2. Tables Section (Layer Definitions)
  lines.push('0\nSECTION\n2\nTABLES');
  lines.push('0\nTABLE\n2\nLAYER\n70\n8');

  const layers = [
    { name: 'SITE_BOUNDARY', color: 6 },  // Magenta
    { name: 'WALLS_EXTERIOR', color: 4 }, // Cyan
    { name: 'WALLS_INTERIOR', color: 7 }, // White
    { name: 'COLUMNS', color: 1 },        // Red
    { name: 'DOORS', color: 2 },          // Yellow
    { name: 'WINDOWS', color: 5 },        // Blue
    { name: 'ROOM_TAGS', color: 3 },      // Green
    { name: 'DIMENSIONS', color: 4 },     // Cyan
    { name: 'FURNITURE', color: 8 },      // Gray
  ];

  layers.forEach((lyr) => {
    lines.push('0\nLAYER\n2\n' + lyr.name + '\n70\n0\n62\n' + lyr.color + '\n6\nCONTINUOUS');
  });

  lines.push('0\nENDTAB\n0\nENDSEC');

  // 3. Blocks Section (Empty)
  lines.push('0\nSECTION\n2\nBLOCKS\n0\nENDSEC');

  // 4. Entities Section
  lines.push('0\nSECTION\n2\nENTITIES');

  // Site Polygon
  const sitePoly = building.site.polygon;
  if (sitePoly && sitePoly.length >= 3) {
    for (let i = 0; i < sitePoly.length; i++) {
      const p1 = sitePoly[i];
      const p2 = sitePoly[(i + 1) % sitePoly.length];
      lines.push('0\nLINE\n8\nSITE_BOUNDARY');
      lines.push(`10\n${p1.x}\n20\n${p1.y}\n30\n0.0`);
      lines.push(`11\n${p2.x}\n21\n${p2.y}\n31\n0.0`);
    }
  }

  // Spaces / Rooms and Walls
  building.spaces.forEach((spc) => {
    const poly = spc.boundaryPolygon;
    if (poly && poly.length >= 4) {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        lines.push('0\nLINE\n8\nWALLS_EXTERIOR');
        lines.push(`10\n${p1.x}\n20\n${p1.y}\n30\n0.0`);
        lines.push(`11\n${p2.x}\n21\n${p2.y}\n31\n0.0`);
      }

      // Room Name Text
      const cx = (poly[0].x + poly[2].x) / 2;
      const cy = (poly[0].y + poly[2].y) / 2;
      lines.push('0\nTEXT\n8\nROOM_TAGS');
      lines.push(`10\n${cx}\n20\n${cy}\n30\n0.0`);
      lines.push(`40\n1.2\n1\n${spc.name.toUpperCase()}`);

      // Room Area Text
      lines.push('0\nTEXT\n8\nDIMENSIONS');
      lines.push(`10\n${cx}\n20\n${cy - 1.6}\n30\n0.0`);
      lines.push(`40\n0.8\n1\n${spc.areaSqFt} SQ FT`);
    }
  });

  // RCC Columns
  building.columns.forEach((col) => {
    const w = col.widthFt || 0.75;
    const d = col.depthFt || 1.0;
    const x0 = col.x - w / 2;
    const y0 = col.y - d / 2;
    const x1 = col.x + w / 2;
    const y1 = col.y + d / 2;

    const corners = [
      { x: x0, y: y0 },
      { x: x1, y: y0 },
      { x: x1, y: y1 },
      { x: x0, y: y1 },
    ];

    for (let i = 0; i < 4; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      lines.push('0\nLINE\n8\nCOLUMNS');
      lines.push(`10\n${p1.x}\n20\n${p1.y}\n30\n0.0`);
      lines.push(`11\n${p2.x}\n21\n${p2.y}\n31\n0.0`);
    }

    // Column Tag
    lines.push('0\nTEXT\n8\nCOLUMNS');
    lines.push(`10\n${col.x}\n20\n${col.y + d / 2 + 0.5}\n30\n0.0`);
    lines.push(`40\n0.6\n1\n${col.name}`);
  });

  // Doors & Windows
  building.doors.forEach((door) => {
    lines.push('0\nTEXT\n8\nDOORS');
    lines.push(`10\n2.0\n20\n2.0\n30\n0.0`);
    lines.push(`40\n0.7\n1\nDOOR D1 (3'0"x7'0")`);
  });

  lines.push('0\nENDSEC');
  lines.push('0\nEOF');

  return lines.join('\n');
}

export function generateDXFFileContent(design: CandidateDesign, site: SiteInformation): string {
  const building = compileDesignToCanonicalBIM(design, site);
  return exportToDXF(building);
}
