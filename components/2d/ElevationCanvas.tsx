'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CandidateDesign, SiteInformation } from '@/types/architecture';
import { Layers, Download } from 'lucide-react';

interface ElevationCanvasProps {
  design: CandidateDesign;
  site: SiteInformation;
}

export const ElevationCanvas: React.FC<ElevationCanvasProps> = ({ design, site }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [elevationSide, setElevationSide] = useState<'front' | 'rear' | 'left' | 'right'>('front');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const paddingX = 60;
    const paddingY = 60;

    const floors = design.floors;
    const bWidth = site.width;
    const floorHeightFeet = 10;
    const totalHeightFeet = floors.length * floorHeightFeet + 4; // plus parapet

    const scaleX = (width - paddingX * 2) / bWidth;
    const scaleY = (height - paddingY * 2) / totalHeightFeet;
    const scale = Math.min(scaleX, scaleY);

    const startX = (width - bWidth * scale) / 2;
    const groundY = height - paddingY;

    // 1. Ground Line & Hatching
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, groundY);
    ctx.lineTo(width - 20, groundY);
    ctx.stroke();

    // Ground grass line
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(20, groundY, width - 40, 4);

    // 2. Draw Floor Stories
    floors.forEach((floor, idx) => {
      const fBottomY = groundY - idx * floorHeightFeet * scale;
      const fTopY = groundY - (idx + 1) * floorHeightFeet * scale;
      const fHeight = floorHeightFeet * scale;
      const fWidth = bWidth * scale;

      // Wall Facade Background & Cladding Texture
      ctx.fillStyle = idx === 0 ? '#f8fafc' : '#f1f5f9';
      ctx.fillRect(startX, fTopY, fWidth, fHeight);

      // Vertical Wood Slate Accent on left portion
      ctx.fillStyle = '#78350f';
      ctx.fillRect(startX, fTopY, fWidth * 0.25, fHeight);

      // Heavy CAD Wall Outlines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(startX, fTopY, fWidth, fHeight);

      // Floor Slab Line
      ctx.fillStyle = '#334155';
      ctx.fillRect(startX - 8, fBottomY - 4, fWidth + 16, 8);

      // Render Windows on Facade
      const windowCount = Math.max(2, floor.rooms.length);
      const wWidth = (fWidth * 0.5) / windowCount;
      const wHeight = fHeight * 0.45;

      for (let w = 0; w < windowCount; w++) {
        const wx = startX + fWidth * 0.3 + w * (wWidth + 16);
        const wy = fTopY + fHeight * 0.25;

        // Window Frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(wx, wy, wWidth, wHeight);

        // Glass Pane
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(wx + 2, wy + 2, wWidth - 4, wHeight - 4);

        // Window Mullion
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx + wWidth / 2, wy + 2);
        ctx.lineTo(wx + wWidth / 2, wy + wHeight - 2);
        ctx.stroke();
      }

      // Balcony Railing for Upper Floor
      if (idx > 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.fillRect(startX, fBottomY - fHeight * 0.3, fWidth * 0.4, fHeight * 0.3);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX, fBottomY - fHeight * 0.3, fWidth * 0.4, fHeight * 0.3);
      }

      // Level Height Label
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`+${(idx + 1) * floorHeightFeet} FT (LVL ${idx + 1})`, startX - 16, fTopY + fHeight / 2);
    });

    // 3. Roof & Parapet Wall
    const topFloorY = groundY - floors.length * floorHeightFeet * scale;
    const parapetHeight = 3.5 * scale;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX, topFloorY - parapetHeight, bWidth * scale, parapetHeight);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(startX, topFloorY - parapetHeight, bWidth * scale, parapetHeight);

    // Parapet Coping Cap
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(startX - 4, topFloorY - parapetHeight - 3, bWidth * scale + 8, 4);

    // Solar Panel Array Outline on Roof
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(startX + bWidth * scale * 0.3, topFloorY - parapetHeight - 12, bWidth * scale * 0.4, 8);

    // 4. Dimension Markers & Height Callout
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(startX + bWidth * scale + 25, groundY);
    ctx.lineTo(startX + bWidth * scale + 25, topFloorY - parapetHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`TOTAL HEIGHT: ${totalHeightFeet} FT`, startX + bWidth * scale + 32, topFloorY + (groundY - topFloorY) / 2);

  }, [design, site, elevationSide]);

  const downloadCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `ArchAI_${elevationSide.toUpperCase()}_Elevation.png`;
    link.click();
  };

  return (
    <div className="relative flex flex-col items-center bg-white border border-slate-200 rounded-3xl p-5 shadow-xl">
      <div className="flex justify-between items-center w-full mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="font-extrabold text-sm text-slate-900">
            2D Exterior Architectural Elevation
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {(['front', 'rear', 'left', 'right'] as const).map((side) => (
            <button
              key={side}
              onClick={() => setElevationSide(side)}
              className={`px-2.5 py-1 rounded-lg capitalize transition border ${
                elevationSide === side
                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {side}
            </button>
          ))}
          <button
            onClick={downloadCanvasImage}
            title="Download PNG Elevation"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={580}
        height={340}
        className="border border-slate-200 rounded-2xl bg-white shadow-inner"
      />
    </div>
  );
};
