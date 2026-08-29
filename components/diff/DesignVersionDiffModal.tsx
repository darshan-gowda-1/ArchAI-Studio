'use client';

import React, { useState } from 'react';
import { CandidateDesign } from '@/types/architecture';
import { computeDesignDiff } from '@/lib/diff/designDiffEngine';
import {
  X,
  Diff,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Box,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DesignVersionDiffModalProps {
  designs: CandidateDesign[];
  activeDesign: CandidateDesign;
  onClose: () => void;
}

export const DesignVersionDiffModal: React.FC<DesignVersionDiffModalProps> = ({
  designs,
  activeDesign,
  onClose,
}) => {
  // Compare active design with previous candidate in list or fallback
  const fallbackPrev = designs.find((d) => d.id !== activeDesign.id) || designs[0];
  const [selectedPrevId, setSelectedPrevId] = useState<string>(fallbackPrev.id);

  const prevDesign = designs.find((d) => d.id === selectedPrevId) || fallbackPrev;
  const diffReport = computeDesignDiff(prevDesign, activeDesign);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#11151A] border border-[#1E2530] rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl font-sans text-xs">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1E2530] flex justify-between items-center bg-[#080A0D]/60">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Diff className="w-5 h-5 text-amber-500" /> What Changed? (Version Diffing)
            </h2>
            <p className="text-slate-400 text-xs">
              Parametric geometry, cost, daylight, and area deltas between architectural iterations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#080A0D] hover:bg-[#1E2530] text-slate-400 hover:text-white border border-[#1E2530] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Base Comparison Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#080A0D] border border-[#1E2530]">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold font-mono">COMPARE:</span>
              <select
                value={selectedPrevId}
                onChange={(e) => setSelectedPrevId(e.target.value)}
                className="bg-[#11151A] border border-[#1E2530] rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              >
                {designs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.totalBuiltUpArea} sq ft)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 font-mono text-slate-400">
              <span>➔</span>
              <span className="text-amber-400 font-bold">{activeDesign.name} (ACTIVE)</span>
            </div>
          </div>

          {/* Quick Delta Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="p-4 rounded-2xl bg-[#080A0D] border border-[#1E2530] space-y-1 font-mono">
              <span className="text-slate-400 text-[10px] uppercase">Built Area Delta</span>
              <div className="text-lg font-extrabold text-white flex items-center gap-1">
                {diffReport.builtUpAreaDiff > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : diffReport.builtUpAreaDiff < 0 ? (
                  <TrendingDown className="w-4 h-4 text-sky-400" />
                ) : (
                  <Minus className="w-4 h-4 text-slate-500" />
                )}
                <span>
                  {diffReport.builtUpAreaDiff > 0 ? '+' : ''}
                  {diffReport.builtUpAreaDiff} sq ft
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080A0D] border border-[#1E2530] space-y-1 font-mono">
              <span className="text-slate-400 text-[10px] uppercase">Cost Delta</span>
              <div className="text-lg font-extrabold text-white flex items-center gap-1">
                <span className={diffReport.costDiff <= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                  {diffReport.costDiff > 0 ? '+₹' : '-₹'}
                  {Math.abs(diffReport.costDiff).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080A0D] border border-[#1E2530] space-y-1 font-mono">
              <span className="text-slate-400 text-[10px] uppercase">Daylight Score</span>
              <div className="text-lg font-extrabold text-white flex items-center gap-1">
                <span className={diffReport.daylightScoreDiff >= 0 ? 'text-amber-400' : 'text-slate-400'}>
                  {diffReport.daylightScoreDiff > 0 ? '+' : ''}
                  {diffReport.daylightScoreDiff} pts
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080A0D] border border-[#1E2530] space-y-1 font-mono">
              <span className="text-slate-400 text-[10px] uppercase">Column Nodes</span>
              <div className="text-lg font-extrabold text-white flex items-center gap-1">
                <span className="text-sky-400">
                  {diffReport.columnCountDiff === 0 ? 'Unchanged (14)' : `${diffReport.columnCountDiff > 0 ? '+' : ''}${diffReport.columnCountDiff}`}
                </span>
              </div>
            </div>

          </div>

          {/* Room-by-Room Area Differences Table */}
          <div className="space-y-3">
            <span className="font-bold text-white font-mono uppercase tracking-wider block">
              Spatial Room Deltas ({diffReport.roomDiffs.length} Rooms Changed)
            </span>

            <div className="rounded-2xl border border-[#1E2530] overflow-hidden divide-y divide-[#1E2530] bg-[#080A0D]">
              {diffReport.roomDiffs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-mono">
                  No geometric differences between these versions.
                </div>
              ) : (
                diffReport.roomDiffs.map((rd, i) => {
                  const isPos = rd.diff > 0;
                  return (
                    <div key={i} className="p-3.5 flex justify-between items-center font-mono">
                      <span className="font-bold text-slate-200 capitalize">{rd.roomName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-500 text-[11px]">
                          {rd.previousArea} sq ft ➔ {rd.newArea} sq ft
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                            isPos
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {rd.diff.toFixed(1)} sq ft
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
