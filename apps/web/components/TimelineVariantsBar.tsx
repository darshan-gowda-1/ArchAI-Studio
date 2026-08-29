'use client';

import React from 'react';
import { useBuildingStore } from '../stores/buildingStore';
import { GitBranch, Play, Award, CheckCircle2, ChevronUp, ChevronDown, Cpu, Sparkles } from 'lucide-react';

export default function TimelineVariantsBar() {
  const {
    paretoCandidates,
    selectedCandidateId,
    selectParetoCandidate,
    isOptimizing,
    runOptimization,
  } = useBuildingStore();

  return (
    <footer className="h-28 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-xl px-6 py-2.5 flex items-center justify-between gap-6 z-30">
      {/* Left: Optimizer Launch & Status */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={() => runOptimization(24, 12)}
          disabled={isOptimizing}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
        >
          {isOptimizing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Evolving Pareto Population...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" />
              <span>Evolve NSGA-II Variants</span>
            </>
          )}
        </button>

        <div className="hidden md:flex flex-col text-[11px]">
          <span className="text-neutral-400 font-medium">Evolutionary State:</span>
          <span className="text-amber-400 font-bold font-mono">
            {paretoCandidates.length > 0 ? `${paretoCandidates.length} Pareto Front Solutions` : 'Base Design Active'}
          </span>
        </div>
      </div>

      {/* Center: Design Variants Reel */}
      <div className="flex-1 flex items-center gap-3 overflow-x-auto py-1">
        {paretoCandidates.length > 0 ? (
          paretoCandidates.map((cand, idx) => {
            const isSelected = selectedCandidateId === cand.id;
            const costL = ((cand.cost || cand.estimatedCostINR || 2195379) / 100000).toFixed(2);
            const daylight = Math.round((cand.daylight_score || 0.88) * 100);

            return (
              <div
                key={cand.id}
                onClick={() => selectParetoCandidate(cand.id)}
                className={`cursor-pointer px-4 py-2 rounded-xl border transition duration-200 shrink-0 min-w-[170px] ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {cand.tag || `Variant #${idx + 1}`}
                    </span>
                  </div>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                  <span className="text-emerald-400 font-bold">₹{costL}L</span>
                  <span>Daylight: {daylight}%</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center gap-2 text-xs text-neutral-500 italic">
            <Sparkles className="w-4 h-4 text-neutral-600" />
            <span>No generated variants yet. Click 'Evolve NSGA-II Variants' to generate Pareto candidates.</span>
          </div>
        )}
      </div>

      {/* Right: Active Model Specs */}
      <div className="hidden lg:flex flex-col text-right text-[11px] shrink-0 border-l border-neutral-800 pl-4 font-mono">
        <span className="text-neutral-400">Canonical Model Hash:</span>
        <span className="text-white font-bold">SHA-256 (bldg_canonical_v3)</span>
      </div>
    </footer>
  );
}
