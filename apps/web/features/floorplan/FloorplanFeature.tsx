'use client';

import React, { useState } from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import { Layers, Eye, Move, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';

export default function FloorplanFeature() {
  const { model, activeLevelIndex, setActiveLevelIndex, selectedElementId, setSelectedElementId } = useBuildingStore();
  const [zoom, setZoom] = useState(1);

  const currentLevel = model.levels[activeLevelIndex] || model.levels[0];
  const levelSpaces = model.spaces.filter((s) => s.level_index === activeLevelIndex);
  const levelWalls = model.walls.filter((w) => w.level_index === activeLevelIndex);
  const levelDoors = model.doors.filter((d) => d.level_index === activeLevelIndex);
  const levelWindows = model.windows.filter((w) => w.level_index === activeLevelIndex);
  const levelColumns = model.columns.filter((c) => c.level_index === activeLevelIndex);

  const colorPalette: Record<string, string> = {
    foyer: '#6366f1',
    living_room: '#3b82f6',
    dining: '#0ea5e9',
    kitchen: '#f59e0b',
    bathroom: '#06b6d4',
    home_office: '#10b981',
    master_bedroom: '#ec4899',
    bedroom: '#8b5cf6',
    terrace: '#14b8a6',
    balcony: '#10b981',
  };

  const scale = 12 * zoom; // scale factor: 1 ft = 12px

  return (
    <div className="space-y-4">
      {/* Level Tabs & View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">Floor Levels:</span>
          <div className="flex gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            {model.levels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setActiveLevelIndex(lvl.level_index)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeLevelIndex === lvl.level_index
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {lvl.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-neutral-300 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
              className="p-1 hover:bg-neutral-800 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1 hover:bg-neutral-800 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs text-neutral-400">
            {levelSpaces.length} Rooms • {levelWalls.length} Walls • {levelDoors.length} Doors • {levelWindows.length} Windows
          </span>
        </div>
      </div>

      {/* Main CAD Interactive Canvas & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 2D SVG Canvas */}
        <div className="lg:col-span-3 bg-neutral-950 border border-neutral-800 rounded-xl p-6 flex justify-center items-center relative overflow-hidden min-h-[500px]">
          {/* Compass & North Direction */}
          <div className="absolute top-4 right-4 p-2 bg-neutral-900/90 border border-neutral-800 rounded-lg text-center text-xs font-bold text-amber-400">
            <div>▲ NORTH</div>
            <div className="text-[9px] text-neutral-400">{model.site.facing_direction} Facing</div>
          </div>

          <svg
            width={32 * scale + 60}
            height={42 * scale + 60}
            viewBox={`-20 -20 ${32 * scale + 60} ${42 * scale + 60}`}
            className="drop-shadow-2xl transition-transform duration-200"
          >
            {/* Grid Pattern */}
            <pattern id="cad_grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
              <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#222" strokeWidth="0.5" />
            </pattern>
            <rect x="-20" y="-20" width={32 * scale + 60} height={42 * scale + 60} fill="url(#cad_grid)" />

            {/* Plot Boundary */}
            <polygon
              points={`0,0 ${30 * scale},0 ${30 * scale},${40 * scale} 0,${40 * scale}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Spaces Polygons */}
            {levelSpaces.map((space) => {
              const pointsStr = space.polygon_2d.map((p) => `${p.x * scale},${p.y * scale}`).join(' ');
              const minX = Math.min(...space.polygon_2d.map((p) => p.x * scale));
              const maxX = Math.max(...space.polygon_2d.map((p) => p.x * scale));
              const minY = Math.min(...space.polygon_2d.map((p) => p.y * scale));
              const maxY = Math.max(...space.polygon_2d.map((p) => p.y * scale));
              const cx = (minX + maxX) / 2;
              const cy = (minY + maxY) / 2;
              const isSelected = selectedElementId === space.id;
              const baseColor = colorPalette[space.type] || '#64748b';

              return (
                <g key={space.id} onClick={() => setSelectedElementId(space.id)} className="cursor-pointer">
                  <polygon
                    points={pointsStr}
                    fill={isSelected ? `${baseColor}55` : `${baseColor}22`}
                    stroke={baseColor}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    className="hover:fill-opacity-40 transition"
                  />
                  <text
                    x={cx}
                    y={cy - 6}
                    fill="#ffffff"
                    fontSize={Math.max(9, 10 * zoom)}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {space.name}
                  </text>
                  <text
                    x={cx}
                    y={cy + 8}
                    fill={baseColor}
                    fontSize={Math.max(8, 9 * zoom)}
                    fontWeight="semibold"
                    textAnchor="middle"
                  >
                    {space.area_sqft} sq ft
                  </text>
                </g>
              );
            })}

            {/* Walls Centerlines */}
            {levelWalls.map((wall) => (
              <line
                key={wall.id}
                x1={wall.start_point.x * scale}
                y1={wall.start_point.y * scale}
                x2={wall.end_point.x * scale}
                y2={wall.end_point.y * scale}
                stroke={wall.is_exterior ? '#ffffff' : '#a3a3a3'}
                strokeWidth={wall.is_exterior ? 3 : 2}
                strokeLinecap="round"
              />
            ))}

            {/* Structural Columns */}
            {levelColumns.map((col) => (
              <rect
                key={col.id}
                x={col.position.x * scale - 4}
                y={col.position.y * scale - 4}
                width={8}
                height={8}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={1}
              />
            ))}
          </svg>
        </div>

        {/* Right Details Panel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-white">Selected Room Inspector</h3>

          {selectedElementId ? (
            (() => {
              const selectedSpace = model.spaces.find((s) => s.id === selectedElementId);
              if (!selectedSpace) return <p className="text-xs text-neutral-400">Click any room to inspect.</p>;
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                    <span className="text-neutral-400">Room Name</span>
                    <div className="text-base font-bold text-white mt-0.5">{selectedSpace.name}</div>
                    <div className="text-amber-400 capitalize">{selectedSpace.type.replace('_', ' ')}</div>
                  </div>

                  <div className="space-y-2 text-neutral-300">
                    <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Net Floor Area</span>
                      <span className="font-bold text-white">{selectedSpace.area_sqft} sq ft</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Finished Ceiling Height</span>
                      <span className="font-semibold">{selectedSpace.ceiling_height_ft} ft</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Flooring Material</span>
                      <span className="font-semibold">{selectedSpace.finishes.flooring_material}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Wall Finish</span>
                      <span className="font-semibold">{selectedSpace.finishes.wall_finish}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-neutral-400">Daylight Target</span>
                      <span className="font-semibold text-amber-400">{selectedSpace.daylight_factor_target}% Daylight Factor</span>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-xs text-neutral-400 text-center py-10 space-y-2">
              <Eye className="w-8 h-8 mx-auto text-neutral-600" />
              <p>Click on any space in the 2D CAD canvas to view architectural details and finishes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
