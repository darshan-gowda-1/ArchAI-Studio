'use client';

import React, { useRef, useEffect, useState } from 'react';
import { FloorPlanLayout, RoomPolygon, SiteInformation, StructuralColumn } from '@/types/architecture';
import { calculateSiteGeometry } from '@/lib/geometrySolver';
import { Layers, Download, Compass, Eye, ShieldCheck, Sparkles, CheckSquare, Square } from 'lucide-react';

interface FloorPlanCanvasProps {
  layout: FloorPlanLayout;
  site: SiteInformation;
  columns?: StructuralColumn[];
  onSelectRoom?: (room: RoomPolygon) => void;
  selectedRoomId?: string;
}

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  layout,
  site,
  columns = [],
  onSelectRoom,
  selectedRoomId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const geo = calculateSiteGeometry(site);

  // Layer Visibility Controls
  const [layers, setLayers] = useState({
    furniture: true,
    dimensions: true,
    columns: true,
    wiring: false,
    vastu: false,
    hatching: true,
    grid: true,
  });

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Architectural CAD Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const padding = 55;
    const plotLength = site.length || 40;
    const plotWidth = site.width || 30;

    const scaleX = (width - padding * 2) / plotWidth;
    const scaleY = (height - padding * 2) / plotLength;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (width - plotWidth * scale) / 2;
    const offsetY = (height - plotLength * scale) / 2;

    const toCanvasX = (x: number) => offsetX + x * scale;
    const toCanvasY = (y: number) => offsetY + y * scale;
    const toCanvasW = (w: number) => w * scale;
    const toCanvasH = (h: number) => h * scale;

    // 1. Grid Background
    if (layers.grid) {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      const step = 5;
      for (let x = 0; x <= plotWidth; x += step) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x), offsetY);
        ctx.lineTo(toCanvasX(x), offsetY + plotLength * scale);
        ctx.stroke();
      }
      for (let y = 0; y <= plotLength; y += step) {
        ctx.beginPath();
        ctx.moveTo(offsetX, toCanvasY(y));
        ctx.lineTo(offsetX + plotWidth * scale, toCanvasY(y));
        ctx.stroke();
      }
    }

    // 2. Vastu Mandala Overlay (8 Zones + Brahmasthan)
    if (layers.vastu) {
      const pW = plotWidth * scale;
      const pH = plotLength * scale;

      ctx.fillStyle = 'rgba(254, 243, 199, 0.25)';
      ctx.fillRect(offsetX, offsetY, pW, pH);

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      ctx.lineTo(offsetX + pW, offsetY + pH);
      ctx.moveTo(offsetX + pW, offsetY);
      ctx.lineTo(offsetX, offsetY + pH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';

      ctx.fillText('NE (ISHANYA - WATER/POOJA)', offsetX + pW * 0.82, offsetY + pH * 0.18);
      ctx.fillText('SE (AGNI - FIRE/KITCHEN)', offsetX + pW * 0.82, offsetY + pH * 0.85);
      ctx.fillText('SW (NAIRUTYA - MASTER BED)', offsetX + pW * 0.18, offsetY + pH * 0.85);
      ctx.fillText('NW (VAYU - AIR)', offsetX + pW * 0.18, offsetY + pH * 0.18);
      ctx.fillText('N (KUBERA)', offsetX + pW * 0.5, offsetY + pH * 0.12);
      ctx.fillText('S (YAMA)', offsetX + pW * 0.5, offsetY + pH * 0.92);

      // Central Brahma Sthan Box
      ctx.fillStyle = 'rgba(234, 88, 12, 0.12)';
      ctx.fillRect(offsetX + pW * 0.35, offsetY + pH * 0.35, pW * 0.3, pH * 0.3);
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(offsetX + pW * 0.35, offsetY + pH * 0.35, pW * 0.3, pH * 0.3);
      ctx.fillStyle = '#c2410c';
      ctx.fillText('BRAHMA STHANAM', offsetX + pW * 0.5, offsetY + pH * 0.52);
    }

    // 3. Exact Site Polygon Boundary
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    geo.plotPolygon.forEach((pt, i) => {
      const cx = toCanvasX(pt.x);
      const cy = toCanvasY(pt.y);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Exact Inset Setback Boundary
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    geo.buildablePolygon.forEach((pt, i) => {
      const cx = toCanvasX(pt.x);
      const cy = toCanvasY(pt.y);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Main Road Callout
    const roadY = site.orientation === 'South' ? offsetY + plotLength * scale + 6 : offsetY - 28;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(offsetX - 10, roadY, plotWidth * scale + 20, 22);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`MAIN ROAD (${site.roadWidth} FT WIDE • ${site.orientation.toUpperCase()} FACING)`, offsetX + (plotWidth * scale) / 2, roadY + 15);

    // 6. Rooms Rendering
    layout.rooms.forEach((room) => {
      const rx = toCanvasX(geo.buildableOriginX + room.x);
      const ry = toCanvasY(geo.buildableOriginY + room.y);
      const rw = toCanvasW(room.width);
      const rh = toCanvasH(room.height);

      const isSelected = room.id === selectedRoomId;

      // Flooring Fill
      ctx.fillStyle = isSelected
        ? '#dbeafe'
        : room.type === 'parking'
        ? '#f8fafc'
        : room.type === 'balcony'
        ? '#f0fdf4'
        : '#ffffff';
      ctx.fillRect(rx, ry, rw, rh);

      // Floor Tile Grid for Kitchen/Bath
      if (room.type === 'kitchen' || room.type === 'bathroom') {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 0.5;
        const tileSize = 14;
        for (let tx = rx; tx < rx + rw; tx += tileSize) {
          ctx.beginPath();
          ctx.moveTo(tx, ry);
          ctx.lineTo(tx, ry + rh);
          ctx.stroke();
        }
        for (let ty = ry; ty < ry + rh; ty += tileSize) {
          ctx.beginPath();
          ctx.moveTo(rx, ty);
          ctx.lineTo(rx + rw, ty);
          ctx.stroke();
        }
      }

      // Electrical Wiring Layer
      if (layers.wiring) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(rx + 8, ry + 8);
        ctx.lineTo(rx + rw - 8, ry + rh - 8);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(rx + rw / 2, ry + rh / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Furniture Layer
      if (layers.furniture) {
        drawDetailedFurniture(ctx, room, rx, ry, rw, rh);
      }

      // Heavy CAD Double Walls
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(rx, ry, rw, rh);

      // Inner Wall Line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx + 2, ry + 2, rw - 4, rh - 4);

      // Windows
      room.windows.forEach((win) => {
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        const winW = Math.min(rw * 0.55, win.width * scale);

        if (win.side === 'N' || win.side === 'S') {
          const wy = win.side === 'N' ? ry - 2 : ry + rh - 2;
          ctx.fillRect(rx + rw / 2 - winW / 2, wy, winW, 4);
          ctx.strokeRect(rx + rw / 2 - winW / 2, wy, winW, 4);
        } else {
          const wx = win.side === 'W' ? rx - 2 : rx + rw - 2;
          ctx.fillRect(wx, ry + rh / 2 - winW / 2, 4, winW);
          ctx.strokeRect(wx, ry + rh / 2 - winW / 2, 4, winW);
        }
      });

      // Door Arc
      const doorRadius = Math.min(20, Math.min(rw, rh) * 0.28);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(rx + 6, ry + 6, doorRadius, 0, Math.PI / 2);
      ctx.stroke();

      // Room Name & Area Labels
      ctx.fillStyle = isSelected ? '#1d4ed8' : '#0f172a';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(room.name.toUpperCase(), rx + rw / 2, ry + rh / 2 - 4);

      if (layers.dimensions) {
        ctx.fillStyle = '#64748b';
        ctx.font = '500 9px Inter, sans-serif';
        const dimStr = `${room.width}' x ${room.height}' • ${room.area} sq ft`;
        ctx.fillText(dimStr, rx + rw / 2, ry + rh / 2 + 10);
      }
    });

    // 7. Structural Columns Grid Layer
    if (layers.columns && columns.length > 0) {
      columns.forEach((col) => {
        const cx = toCanvasX(geo.buildableOriginX + col.x);
        const cy = toCanvasY(geo.buildableOriginY + col.y);
        const cw = Math.max(7, col.width * scale * 1.5);
        const cd = Math.max(8, col.depth * scale * 1.5);

        // Reinforced concrete column hatch
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - cw / 2, cy - cd / 2, cw, cd);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - cw / 2, cy - cd / 2, cw, cd);

        // Column Tag
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 7px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(col.gridLabel, cx, cy - cd / 2 - 2);
      });
    }

    // 8. Overall Plot Dimensions Callout
    if (layers.dimensions) {
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${site.width} FT (${(site.width * 0.3048).toFixed(1)}m)`,
        offsetX + (plotWidth * scale) / 2,
        offsetY - 10
      );
      ctx.fillText(
        `${site.length} FT (${(site.length * 0.3048).toFixed(1)}m)`,
        offsetX - 24,
        offsetY + (plotLength * scale) / 2
      );
    }

    // 9. Compass Rose
    drawCompassRose(ctx, width - 42, 42, site.orientation);

  }, [layout, site, columns, selectedRoomId, geo, layers]);

  const drawDetailedFurniture = (
    ctx: CanvasRenderingContext2D,
    room: RoomPolygon,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ) => {
    ctx.strokeStyle = '#94a3b8';
    ctx.fillStyle = '#f1f5f9';
    ctx.lineWidth = 1;

    if (room.type === 'master_bedroom' || room.type === 'bedroom') {
      const bW = Math.min(rw * 0.46, 38);
      const bH = Math.min(rh * 0.52, 44);
      const bx = rx + rw / 2 - bW / 2;
      const by = ry + 8;

      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(bx, by, bW, bH);
      ctx.strokeRect(bx, by, bW, bH);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(bx + 2, by + 16, bW - 4, bH - 18);
      ctx.strokeRect(bx + 2, by + 16, bW - 4, bH - 18);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 3, by + 4, bW / 2 - 5, 9);
      ctx.fillRect(bx + bW / 2 + 2, by + 4, bW / 2 - 5, 9);
      ctx.strokeRect(bx + 3, by + 4, bW / 2 - 5, 9);
      ctx.strokeRect(bx + bW / 2 + 2, by + 4, bW / 2 - 5, 9);
    } else if (room.type === 'living') {
      const sW = Math.min(rw * 0.6, 52);
      const sH = Math.min(rh * 0.28, 22);
      const sx = rx + rw / 2 - sW / 2;
      const sy = ry + rh - sH - 12;

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(sx, sy, sW, sH);
      ctx.fillRect(sx, sy - 18, 16, 18);
      ctx.strokeRect(sx, sy, sW, sH);
      ctx.strokeRect(sx, sy - 18, 16, 18);
    } else if (room.type === 'dining') {
      const dW = Math.min(rw * 0.44, 34);
      const dH = Math.min(rh * 0.38, 26);
      const dx = rx + rw / 2 - dW / 2;
      const dy = ry + rh / 2 - dH / 2;

      ctx.fillStyle = '#fde68a';
      ctx.fillRect(dx, dy, dW, dH);
      ctx.strokeRect(dx, dy, dW, dH);
    } else if (room.type === 'kitchen') {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(rx + 4, ry + 4, rw - 8, 14);
      ctx.strokeRect(rx + 4, ry + 4, rw - 8, 14);
    }
  };

  const drawCompassRose = (ctx: CanvasRenderingContext2D, cx: number, cy: number, orientation: string) => {
    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(5, 0);
    ctx.lineTo(-5, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(5, 0);
    ctx.lineTo(-5, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, -16);

    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSelectRoom) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const padding = 55;
    const plotLength = site.length || 40;
    const plotWidth = site.width || 30;

    const scaleX = (canvas.width - padding * 2) / plotWidth;
    const scaleY = (canvas.height - padding * 2) / plotLength;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - plotWidth * scale) / 2;
    const offsetY = (canvas.height - plotLength * scale) / 2;

    const clicked = layout.rooms.find((room) => {
      const rx = offsetX + (geo.buildableOriginX + room.x) * scale;
      const ry = offsetY + (geo.buildableOriginY + room.y) * scale;
      const rw = room.width * scale;
      const rh = room.height * scale;

      return clickX >= rx && clickX <= rx + rw && clickY >= ry && clickY <= ry + rh;
    });

    if (clicked) {
      onSelectRoom(clicked);
    }
  };

  const downloadCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `ArchAI_CAD_FloorPlan_Floor${layout.floorNumber}.png`;
    link.click();
  };

  return (
    <div className="relative flex flex-col items-center bg-white border border-slate-200 rounded-3xl p-5 shadow-xl">
      <div className="flex flex-wrap justify-between items-center w-full mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs">
            2D
          </div>
          <span className="font-extrabold text-sm text-slate-900">
            CAD Floor Blueprint: Floor {layout.floorNumber}
          </span>
          <span className="font-mono text-[11px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">
            {site.shape.toUpperCase()} PLOT
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => toggleLayer('furniture')}
            className={`px-2.5 py-1 rounded-lg transition border flex items-center gap-1 ${
              layers.furniture
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            🛋️ Furniture
          </button>
          <button
            onClick={() => toggleLayer('columns')}
            className={`px-2.5 py-1 rounded-lg transition border flex items-center gap-1 ${
              layers.columns
                ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            🏛️ Columns
          </button>
          <button
            onClick={() => toggleLayer('dimensions')}
            className={`px-2.5 py-1 rounded-lg transition border flex items-center gap-1 ${
              layers.dimensions
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            📐 Dims
          </button>
          <button
            onClick={() => toggleLayer('vastu')}
            className={`px-2.5 py-1 rounded-lg transition border flex items-center gap-1 ${
              layers.vastu
                ? 'bg-orange-50 text-orange-700 border-orange-200 font-bold'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            🧩 Vastu
          </button>
          <button
            onClick={downloadCanvasImage}
            title="Download PNG Blueprint"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={580}
        height={520}
        onClick={handleCanvasClick}
        className="cursor-pointer border border-slate-200 rounded-2xl bg-white shadow-inner"
      />

      <div className="flex justify-between items-center w-full mt-3 text-xs text-slate-500 font-medium">
        <span>Click any room for precision dimensions</span>
        <span>Built-Up Area: <strong className="text-slate-900">{layout.totalBuiltArea} sq ft</strong></span>
      </div>
    </div>
  );
};
