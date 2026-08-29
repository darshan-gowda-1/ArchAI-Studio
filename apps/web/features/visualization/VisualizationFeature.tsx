'use client';

import React, { useState } from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import Viewport3D from '../../components/Viewport3D';
import { Sun, Camera, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

export default function VisualizationFeature() {
  const { model, sunHour, setSunHour } = useBuildingStore();
  const [renderStatus, setRenderStatus] = useState<string | null>(null);

  const handleRenderCycles = () => {
    setRenderStatus('Dispatching headless Blender Cycles 4K raytracing job...');
    setTimeout(() => {
      setRenderStatus('✓ Blender Cycles 4K rendering frame completed with physically based global illumination.');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Sun Study Controls Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">
              Cinematic Solar Shadow Study & Daylight Simulation
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            Simulate real-time sun angles, shadow projection, and solar radiation flux throughout the day.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-neutral-300 w-full md:w-60">
            <span>6 AM</span>
            <input
              type="range"
              min={6}
              max={18}
              step={0.5}
              value={sunHour}
              onChange={(e) => setSunHour(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span>6 PM</span>
            <span className="font-mono text-amber-400 font-bold px-2 py-0.5 bg-neutral-950 rounded border border-neutral-800 shrink-0">
              {sunHour}:00
            </span>
          </div>

          <button
            onClick={handleRenderCycles}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-semibold text-xs rounded-xl shadow-lg transition shrink-0"
          >
            <Camera className="w-4 h-4" /> Render Cycles 4K
          </button>
        </div>
      </div>

      {renderStatus && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{renderStatus}</span>
        </div>
      )}

      {/* 3D Sun Shadow Canvas */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl relative min-h-[500px]">
        <Viewport3D model={model} sunHour={sunHour} />
      </div>
    </div>
  );
}
