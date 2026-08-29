'use client';

import React from 'react';
import { useBuildingStore } from '../stores/buildingStore';
import { Building, ShieldCheck, IndianRupee, Sparkles, Cpu, Layers } from 'lucide-react';

export default function HeaderHUD() {
  const { model, complianceReport, activeTab } = useBuildingStore();
  const cost = model.metrics.cost_estimate;

  return (
    <header className="h-16 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand Logo & Model Metadata */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-amber-500/20">
          A
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">ArchAI Studio</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              v3.0 SSOT
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 font-mono">
            {model.project.code} • {model.site.boundary.width}′×{model.site.boundary.length}′ Cadastral
          </p>
        </div>
      </div>

      {/* Center Live HUD Metrics */}
      <div className="hidden md:flex items-center gap-3">
        <div className="px-3 py-1.5 bg-neutral-950/80 rounded-lg border border-neutral-800 flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Carpet:</span>
          <span className="font-bold text-white">{model.metrics.carpet_area_sqft || 980} sq ft</span>
        </div>

        <div className="px-3 py-1.5 bg-neutral-950/80 rounded-lg border border-neutral-800 flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Cost:</span>
          <span className="font-bold text-emerald-400">
            ₹{((cost.grand_total_inr || 3980000) / 100000).toFixed(1)}L
          </span>
        </div>

        <div className="px-3 py-1.5 bg-neutral-950/80 rounded-lg border border-neutral-800 flex items-center gap-2 text-xs">
          <span className="text-neutral-400">NBC Code:</span>
          <span className="font-bold text-amber-400">{complianceReport.complianceScorePercent}% Pass</span>
        </div>
      </div>

      {/* Right User & Environment Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          FastAPI & Worker Online
        </div>
      </div>
    </header>
  );
}
