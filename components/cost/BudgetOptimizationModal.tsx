'use client';

import React, { useState } from 'react';
import { CandidateDesign, SiteInformation, BuildingRequirements } from '@/types/architecture';
import { runBudgetOptimizer, BudgetOptimizationResult } from '@/lib/optimization/budgetOptimizer';
import { REGIONAL_RATES_DATABASE } from '@/lib/pricing/regionalRatesDatabase';
import {
  DollarSign,
  Sparkles,
  TrendingDown,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Layers,
  MapPin,
  RefreshCw,
  Building,
} from 'lucide-react';

interface BudgetOptimizationModalProps {
  design: CandidateDesign;
  site: SiteInformation;
  requirements: BuildingRequirements;
  onApplyOptimizedDesign: (newDesign: CandidateDesign) => void;
  onClose: () => void;
}

export const BudgetOptimizationModal: React.FC<BudgetOptimizationModalProps> = ({
  design,
  site,
  requirements,
  onApplyOptimizedDesign,
  onClose,
}) => {
  const [targetBudgetLakhs, setTargetBudgetLakhs] = useState<number>(40.0);
  const [selectedRegion, setSelectedRegion] = useState<string>('mumbai');
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<BudgetOptimizationResult | null>(() =>
    runBudgetOptimizer(design, site, requirements, 4000000, 'mumbai')
  );

  const handleRunOptimization = () => {
    setOptimizing(true);
    setTimeout(() => {
      const result = runBudgetOptimizer(
        design,
        site,
        requirements,
        targetBudgetLakhs * 100000,
        selectedRegion
      );
      setOptimizationResult(result);
      setOptimizing(false);
    }, 400);
  };

  const handleApply = () => {
    if (!optimizationResult) return;
    onApplyOptimizedDesign(optimizationResult.optimizedDesign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 text-slate-200 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg">
            <DollarSign className="w-5 h-5" />
            <span>Goal-Seeking Budget & Regional Cost Optimizer</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-medium px-2.5 py-1 rounded-lg bg-slate-800"
          >
            ✕ Close
          </button>
        </div>

        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
          
          {/* Controls Bar: Target Budget & Regional Rate Dataset */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
            
            {/* Target Budget Slider & Input */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300">Target Construction Budget:</span>
                <span className="font-extrabold text-emerald-400 font-mono text-sm">
                  ₹{targetBudgetLakhs.toFixed(1)} Lakhs (₹{(targetBudgetLakhs * 100000).toLocaleString('en-IN')})
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="80"
                step="1"
                value={targetBudgetLakhs}
                onChange={(e) => setTargetBudgetLakhs(+e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹25L</span>
                <span>₹40L (Target)</span>
                <span>₹60L</span>
                <span>₹80L</span>
              </div>
            </div>

            {/* Regional Pricing Dataset Selector */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" /> Regional Pricing Index:
              </span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-emerald-500 text-xs"
              >
                {Object.values(REGIONAL_RATES_DATABASE).map((reg) => (
                  <option key={reg.regionId} value={reg.regionId}>
                    {reg.cityName} ({reg.currencySymbol}{reg.averageCostPerSqFt}/sq ft)
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Trigger Button */}
          <div className="flex justify-center">
            <button
              onClick={handleRunOptimization}
              disabled={optimizing}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${optimizing ? 'animate-spin' : ''}`} />
              <span>{optimizing ? 'Solving Multi-Objective Trade-Offs...' : 'Run Goal-Seeking Budget Optimizer'}</span>
            </button>
          </div>

          {/* Optimization Results Card */}
          {optimizationResult && (
            <div className="space-y-4 pt-1">
              
              {/* Before vs After Cost Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 block">Original Estimated Cost</span>
                  <span className="font-extrabold text-slate-300 text-lg font-mono">
                    ₹{(optimizationResult.originalCostInr / 100000).toFixed(2)} Lakhs
                  </span>
                  <span className="text-[10px] text-slate-500 block">Unoptimized Specifications</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/10 space-y-1">
                  <span className="text-xs text-emerald-400 block font-bold">Optimized Budget Plan</span>
                  <span className="font-extrabold text-emerald-400 text-lg font-mono">
                    ₹{(optimizationResult.optimizedCostInr / 100000).toFixed(2)} Lakhs
                  </span>
                  <span className="text-[10px] text-emerald-300/80 block">Within Target Budget</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 block">Total Value-Engineered Savings</span>
                  <span className="font-extrabold text-sky-400 text-lg font-mono flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-sky-400" />
                    ₹{(optimizationResult.totalSavingsInr / 100000).toFixed(2)} Lakhs (-{optimizationResult.savingsPercentage}%)
                  </span>
                  <span className="text-[10px] text-slate-500 block">Zero Compromise on Bedroom Program</span>
                </div>
              </div>

              {/* Invariant Preservation Banner */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Preserved Essential Program Requirements:</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-400">
                  <span>✓ {optimizationResult.preservedProgramSummary.bedrooms} Bedrooms</span>
                  <span>✓ {optimizationResult.preservedProgramSummary.bathrooms} Bathrooms</span>
                  <span>✓ {optimizationResult.preservedProgramSummary.parkingCapacity} Parking</span>
                  <span>✓ Kitchen & Office</span>
                </div>
              </div>

              {/* Itemized Savings Breakdown */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" /> Itemized Value-Engineering Savings Schedule
                </span>

                <div className="space-y-2">
                  {optimizationResult.itemizedSavings.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-start text-xs gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{item.category}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{item.action}</p>
                        <div className="text-[10px] text-slate-500 font-mono">
                          <span className="line-through text-slate-600">{item.originalSpec}</span> → <span className="text-emerald-400">{item.optimizedSpec}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-emerald-400 text-xs font-mono block">
                          -₹{(item.costSavingsInr / 100000).toFixed(2)} Lakhs
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">₹{item.costSavingsInr.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regional Rate Benchmark Notice */}
              <div className="text-[11px] text-slate-400 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <strong>Regional Rate Basis:</strong> Estimated based on selected <strong>{optimizationResult.qtoComparison.optimizedQto.region.cityName}</strong> market index ({optimizationResult.qtoComparison.optimizedQto.region.source}, effective {optimizationResult.qtoComparison.optimizedQto.region.effectiveDate}).
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!optimizationResult}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
          >
            <span>Apply Optimized Budget Design to Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
