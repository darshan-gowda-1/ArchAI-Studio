'use client';

import React, { useState } from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import Viewport3D from '../../components/Viewport3D';
import { Box, Layers, Eye, SunMedium, Sliders, ShieldCheck } from 'lucide-react';

export default function GeometryFeature() {
  const { model, sunHour, setSunHour } = useBuildingStore();
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className="space-y-6">
      {/* Viewport Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">3D Procedural Geometry Compiler</h3>
          <span className="text-xs text-neutral-400">• Drag mouse to orbit • Scroll to zoom</span>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Sun Hour Slider */}
          <div className="flex items-center gap-2 text-xs text-neutral-300 w-full sm:w-48">
            <SunMedium className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <input
              type="range"
              min={6}
              max={18}
              step={0.5}
              value={sunHour}
              onChange={(e) => setSunHour(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-amber-400 font-bold shrink-0">{sunHour}:00</span>
          </div>

          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
              wireframe
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            Wireframe
          </button>
        </div>
      </div>

      {/* Main 3D Viewport & Geometric Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl relative">
          <Viewport3D model={model} sunHour={sunHour} showWireframe={wireframe} />
        </div>

        {/* Right Sidebar: Geometric Breakdown */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Compiled Elements Breakdown
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <span className="text-neutral-400">Exterior & Partition Walls</span>
              <div className="text-base font-bold text-white mt-0.5">{model.walls.length} Solid Segments</div>
              <div className="text-neutral-400">9″ AAC Exterior / 4.5″ Interior</div>
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <span className="text-neutral-400">Floor Slabs & Balconies</span>
              <div className="text-base font-bold text-white mt-0.5">{model.slabs.length} Extruded Slabs</div>
              <div className="text-neutral-400">6″ RCC Suspended with Cantilevers</div>
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <span className="text-neutral-400">Structural Column Grid</span>
              <div className="text-base font-bold text-amber-400 mt-0.5">{model.columns.length} RCC Columns</div>
              <div className="text-neutral-400">9″ × 15″ M25 Grade Alignment</div>
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <span className="text-neutral-400">Rooftop Solar PV Array</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">14 High-Efficiency Panels</div>
              <div className="text-neutral-400">18° South Azimuth Tilt</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
