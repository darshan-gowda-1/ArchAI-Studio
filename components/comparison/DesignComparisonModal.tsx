'use client';

import React from 'react';
import { CandidateDesign, SiteInformation } from '@/types/architecture';
import {
  X,
  CheckCircle2,
  Sparkles,
  Layers,
  Sun,
  ShieldCheck,
  Zap,
  ArrowRight,
  Maximize2,
  DollarSign,
  Box,
} from 'lucide-react';

interface DesignComparisonModalProps {
  designs: CandidateDesign[];
  activeDesignId: string;
  onSelectDesign: (id: string) => void;
  onClose: () => void;
}

export const DesignComparisonModal: React.FC<DesignComparisonModalProps> = ({
  designs,
  activeDesignId,
  onSelectDesign,
  onClose,
}) => {
  // Take up to 3 diverse designs (e.g. Balanced, Premium, Budget)
  const compareList = designs.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#11151A] border border-[#1E2530] rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl font-sans text-xs">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1E2530] flex justify-between items-center bg-[#080A0D]/60">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-amber-500" /> Multi-Objective Design Comparison
            </h2>
            <p className="text-slate-400 text-xs">
              Side-by-side trade-off evaluation across space efficiency, natural daylight, structural complexity, and cost.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#080A0D] hover:bg-[#1E2530] text-slate-400 hover:text-white border border-[#1E2530] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Way Side-by-Side Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {compareList.map((d, index) => {
            const isSelected = d.id === activeDesignId;
            const badgeLabel = index === 0 ? 'BALANCED' : index === 1 ? 'PREMIUM' : 'BUDGET OPTIMIZED';
            const badgeColor =
              index === 0
                ? 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                : index === 1
                ? 'bg-purple-950/40 text-purple-400 border-purple-500/30'
                : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';

            return (
              <div
                key={d.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-950/20 to-[#11151A] border-amber-500/60 shadow-xl'
                    : 'bg-[#080A0D] border-[#1E2530]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border ${badgeColor}`}>
                      {badgeLabel}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-white text-base">{d.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{d.subtitle}</p>
                  </div>

                  {/* 3D Massing Thumbnail Simulation */}
                  <div className="h-32 bg-[#11151A] rounded-xl border border-[#1E2530] flex flex-col items-center justify-center p-3 relative overflow-hidden">
                    <div className="w-16 h-12 border-2 border-amber-500/60 rounded-md bg-amber-500/10 flex items-center justify-center shadow-lg">
                      <Box className="w-6 h-6 text-amber-400 animate-pulse-subtle" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-2">
                      {d.floors.length} Floors • {d.columns.length} RCC Nodes
                    </span>
                  </div>

                  {/* Metrics Table */}
                  <div className="space-y-2 pt-1 font-mono text-[11px] divide-y divide-[#1E2530]">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Total Built-Up Area:</span>
                      <span className="font-bold text-white">{d.totalBuiltUpArea} sq ft</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-400">Estimated Cost:</span>
                      <span className="font-bold text-emerald-400">₹{(d.estimatedCost / 100000).toFixed(2)} Lakh</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-400">Space Efficiency:</span>
                      <span className="font-bold text-sky-400">{d.objectives?.spaceEfficiencyScore || d.spaceEfficiencyScore}%</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-400">Natural Daylight:</span>
                      <span className="font-bold text-amber-400">{d.objectives?.naturalLightScore || d.naturalLightScore}%</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-slate-400">Vastu Score:</span>
                      <span className="font-bold text-emerald-400">{d.objectives?.vastuScore || 85}%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectDesign(d.id);
                    onClose();
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#11151A] hover:bg-[#171D24] text-slate-300 hover:text-white border border-[#1E2530]'
                  }`}
                >
                  <span>{isSelected ? 'Currently Loaded' : 'Load This Design'}</span>
                  {!isSelected && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
