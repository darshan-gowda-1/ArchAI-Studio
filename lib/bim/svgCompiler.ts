import { BIMBuilding, compileDesignToCanonicalBIM } from './canonicalModel';
import { CandidateDesign, SiteInformation } from '@/types/architecture';

/**
 * Generates high-precision scalable vector graphics (SVG) CAD drawings with architectural layers
 */
export function exportToSVG(building: BIMBuilding, floorNumber = 0): string {
  const widthPx = 1000;
  const heightPx = 800;
  const padding = 80;

  const siteW = building.site.polygon.reduce((max, p) => Math.max(max, p.x), 30);
  const siteL = building.site.polygon.reduce((max, p) => Math.max(max, p.y), 40);

  const scale = Math.min((widthPx - padding * 2) / siteW, (heightPx - padding * 2) / siteL);
  const offX = (widthPx - siteW * scale) / 2;
  const offY = (heightPx - siteL * scale) / 2;

  const toX = (x: number) => (offX + x * scale).toFixed(1);
  const toY = (y: number) => (offY + y * scale).toFixed(1);
  const toW = (w: number) => (w * scale).toFixed(1);
  const toH = (h: number) => (h * scale).toFixed(1);

  const levelId = building.levels[floorNumber]?.id || building.levels[0].id;
  const floorSpaces = building.spaces.filter((s) => s.levelId === levelId);

  const lines: string[] = [];
  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${widthPx} ${heightPx}" width="${widthPx}" height="${heightPx}" style="background:#ffffff; font-family: Inter, Arial, sans-serif;">`);
  
  // Title Block
  lines.push(`  <rect x="20" y="20" width="${widthPx - 40}" height="${heightPx - 40}" fill="none" stroke="#0f172a" stroke-width="2"/>`);
  lines.push(`  <rect x="24" y="${heightPx - 70}" width="${widthPx - 48}" height="46" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>`);
  lines.push(`  <text x="40" y="${heightPx - 42}" font-size="14" font-weight="bold" fill="#0f172a">ArchAI Studio — CAD Architectural Blueprint</text>`);
  lines.push(`  <text x="40" y="${heightPx - 30}" font-size="10" fill="#64748b">Project: ${building.name} | Level: ${floorNumber} | Scale 1:100 | Code: IFC4</text>`);

  // Site Boundary
  const sitePoints = building.site.polygon.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ');
  lines.push(`  <polygon points="${sitePoints}" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,6"/>`);

  // Rooms / Spaces
  floorSpaces.forEach((spc) => {
    const poly = spc.boundaryPolygon;
    if (poly && poly.length >= 4) {
      const minX = Math.min(...poly.map((p) => p.x));
      const minY = Math.min(...poly.map((p) => p.y));
      const rW = Math.max(...poly.map((p) => p.x)) - minX;
      const rH = Math.max(...poly.map((p) => p.y)) - minY;

      lines.push(`  <g id="${spc.id}">`);
      lines.push(`    <rect x="${toX(minX)}" y="${toY(minY)}" width="${toW(rW)}" height="${toH(rH)}" fill="#f8fafc" stroke="#0f172a" stroke-width="3"/>`);
      lines.push(`    <text x="${toX(minX + rW / 2)}" y="${toY(minY + rH / 2 - 2)}" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">${spc.name.toUpperCase()}</text>`);
      lines.push(`    <text x="${toX(minX + rW / 2)}" y="${toY(minY + rH / 2 + 12)}" text-anchor="middle" font-size="9" fill="#64748b">${spc.areaSqFt} SQ FT</text>`);
      lines.push(`  </g>`);
    }
  });

  // RCC Columns
  building.columns.forEach((col) => {
    const cw = col.widthFt || 0.75;
    const cd = col.depthFt || 1.0;
    lines.push(`  <rect x="${toX(col.x - cw / 2)}" y="${toY(col.y - cd / 2)}" width="${toW(cw)}" height="${toH(cd)}" fill="#0f172a" stroke="#ef4444" stroke-width="1"/>`);
  });

  lines.push('</svg>');
  return lines.join('\n');
}

export function generateSVGFileContent(design: CandidateDesign, site: SiteInformation): string {
  const building = compileDesignToCanonicalBIM(design, site);
  return exportToSVG(building, 0);
}
