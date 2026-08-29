'use client';

import React from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import { Cpu, Play, Award, CheckCircle2, TrendingUp } from 'lucide-react';

export default function OptimizerFeature() {
  const { isOptimizing, runOptimization, paretoCandidates, selectedCandidateId, selectParetoCandidate } =
    useBuildingStore();

  return (
    <div className="space-y-6">
      {/* Optimizer Header Controls */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">NSGA-II Multi-Objective Genetic Optimizer</h3>
          </div>
          <p className="text-xs text-neutral-400">
            Synthesizes non-dominated Pareto frontier layouts balancing 9 competing objectives with constraint domination.
          </p>
        </div>

        <button
          onClick={() => runOptimization(24, 12)}
          disabled={isOptimizing}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
        >
          {isOptimizing ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Evolving Population...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-black" /> Run Evolutionary Optimization
            </>
          )}
        </button>
      </div>

      {/* Pareto Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paretoCandidates.length > 0 ? (
          paretoCandidates.map((cand, idx) => {
            const isSelected = selectedCandidateId === cand.id;
            const spaceScore = cand.spaceMatchScore ?? cand.fitness?.spaceMatchScore ?? 92;
            const daylightScore = Math.round((cand.daylight_score ?? 0.88) * 100);
            const structuralScore = cand.structuralScore ?? cand.fitness?.structuralScore ?? 94;
            const overall = cand.overallFitness ?? cand.fitness?.overallFitness ?? 94;

            return (
              <div
                key={cand.id}
                onClick={() => selectParetoCandidate(cand.id)}
                className={`cursor-pointer rounded-xl p-5 border transition duration-200 relative ${
                  isSelected
                    ? 'bg-neutral-900 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-bold">
                    ACTIVE MODEL
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-neutral-300">Pareto Rank {cand.rank ?? 1}</span>
                </div>

                <h4 className="text-base font-bold text-white mb-3">{cand.tag ?? `Solution #${idx + 1}`}</h4>

                {/* Score Bars */}
                <div className="space-y-2.5 text-xs text-neutral-300">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-neutral-400">Space Area Match</span>
                      <span className="font-semibold">{spaceScore}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${spaceScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-neutral-400">Natural Daylight</span>
                      <span className="font-semibold">{daylightScore}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${daylightScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-neutral-400">Structural Regularity</span>
                      <span className="font-semibold">{structuralScore}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${structuralScore}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Estimated Cost</span>
                  <span className="text-sm font-bold text-emerald-400">
                    ₹{((cand.cost || cand.estimatedCostINR || 2997000) / 100000).toFixed(2)}L
                  </span>
                </div>

                <div className="mt-2 flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Aggregate Fitness</span>
                  <span className="text-base font-bold text-amber-400">{overall}/100</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-12 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
            <Cpu className="w-10 h-10 mx-auto text-neutral-600 animate-pulse" />
            <p className="text-sm text-neutral-300 font-semibold">Evolutionary Pool Ready for Execution</p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Click 'Run Evolutionary Optimization' above to synthesize Pareto-optimal layouts with competing trade-offs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
