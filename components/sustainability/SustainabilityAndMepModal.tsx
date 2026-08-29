'use client';

import React, { useState } from 'react';
import { CandidateDesign, SiteInformation, BuildingRequirements } from '@/types/architecture';
import { evaluateSustainabilityAndWater, SustainabilityReport } from '@/lib/sustainability/sustainabilityEngine';
import { generateMEPLayout, MEPLayout } from '@/lib/mep/mepEngine';
import {
  Leaf,
  Droplets,
  Zap,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Wind,
  Layers,
  Thermometer,
  CloudRain,
  Activity,
  ArrowRight,
  Sliders,
} from 'lucide-react';

interface SustainabilityAndMepModalProps {
  design: CandidateDesign;
  site: SiteInformation;
  requirements: BuildingRequirements;
  onClose: () => void;
}

export const SustainabilityAndMepModal: React.FC<SustainabilityAndMepModalProps> = ({
  design,
  site,
  requirements,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'sustainability' | 'rainwater' | 'mep'>('sustainability');
  
  const sustainReport = evaluateSustainabilityAndWater(design, site, requirements);
  const mepReport = generateMEPLayout(design);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 text-slate-200 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-lg">
            <Leaf className="w-5 h-5" />
            <span>Sustainability, RWH & MEP Engineering Hub</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-medium px-2.5 py-1 rounded-lg bg-slate-800"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('sustainability')}
            className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'sustainability' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Green Sustainability ({sustainReport.overallScore}/100)
          </button>
          <button
            onClick={() => setActiveTab('rainwater')}
            className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'rainwater' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" /> RWH & Water Planning
          </button>
          <button
            onClick={() => setActiveTab('mep')}
            className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'mep' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> MEP & Electrical Systems
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[62vh] overflow-y-auto pr-1">
          
          {/* TAB 1: SUSTAINABILITY SCORING */}
          {activeTab === 'sustainability' && (
            <div className="space-y-4 text-xs">
              
              {/* Overall Score Badge */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/10 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="text-emerald-400 font-extrabold text-2xl font-mono block">
                    {sustainReport.overallScore} / 100
                  </span>
                  <span className="text-xs text-slate-300 font-bold">{sustainReport.ratingGrade}</span>
                </div>
                <div className="text-right text-[11px] font-mono space-y-0.5">
                  <div className="text-slate-300">Energy Index: {sustainReport.energyPerformanceIndexKwhM2Year} kWh/m²/yr</div>
                  <div className="text-emerald-400 font-bold">CO₂ Offset: -{sustainReport.carbonOffsetTonsPerYear} Tons/yr</div>
                </div>
              </div>

              {/* 7-Pillar Sustainability Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sustainReport.pillars.map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{p.pillarName}</span>
                      <span className="font-extrabold text-emerald-400 font-mono">{p.score}/{p.maxScore}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>

              {/* AI Green Recommendations */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 text-xs">Actionable High-ROI Green Upgrades:</span>
                <div className="space-y-2">
                  {sustainReport.aiRecommendations.map((rec, i) => (
                    <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center gap-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-200 block text-xs">{rec.title}</span>
                        <p className="text-[11px] text-slate-400">{rec.impact}</p>
                      </div>
                      <div className="text-right shrink-0 font-mono text-xs">
                        <span className="text-emerald-400 font-bold block">+₹{rec.annualSavingsInr.toLocaleString('en-IN')}/yr</span>
                        <span className="text-[10px] text-slate-500">{rec.paybackYears} yr payback</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: RWH & WATER PLANNING */}
          {activeTab === 'rainwater' && (
            <div className="space-y-4 text-xs">
              
              {/* Rainwater Harvesting KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Catchment Roof Area</span>
                  <span className="font-extrabold text-slate-200 text-base font-mono">
                    {sustainReport.rainwater.roofAreaSqFt} sq ft ({sustainReport.rainwater.roofAreaM2} m²)
                  </span>
                  <span className="text-[10px] text-slate-500 block">Rainfall: {sustainReport.rainwater.annualRainfallMm} mm/yr</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/40 bg-sky-950/10 space-y-1">
                  <span className="text-sky-400 font-bold block text-[11px]">Annual RWH Potential</span>
                  <span className="font-extrabold text-sky-400 text-lg font-mono">
                    {sustainReport.rainwater.annualHarvestPotentialLiters.toLocaleString()} Liters/yr
                  </span>
                  <span className="text-[10px] text-sky-300/80 block">~{sustainReport.rainwater.dailyHarvestEquivalentLiters} L/day avg</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Recommended Sump Size</span>
                  <span className="font-extrabold text-emerald-400 text-base font-mono">
                    {sustainReport.rainwater.recommendedSumpCapacityLiters.toLocaleString()} Liters
                  </span>
                  <span className="text-[10px] text-slate-500 block">{sustainReport.waterPlanning.tanks.retentionDays} days retention buffer</span>
                </div>
              </div>

              {/* Water Planning Balance */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-400" /> Daily Household Water Balance ({sustainReport.waterPlanning.occupantCount} Occupants @ 135 LPCD)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block">Potable (Cooking & Drinking)</span>
                    <span className="text-slate-200 font-bold text-sm">{sustainReport.waterPlanning.breakdown.drinkingAndCookingLiters} L/day</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block">Bathing & Washing</span>
                    <span className="text-slate-200 font-bold text-sm">{sustainReport.waterPlanning.breakdown.bathingAndWashingLiters} L/day</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 block">Flushing & Gardening</span>
                    <span className="text-slate-200 font-bold text-sm">{sustainReport.waterPlanning.breakdown.flushingAndGardeningLiters} L/day</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px]">
                  <strong>Greywater Recovery:</strong> {sustainReport.waterPlanning.greywater.recoverableLiters} L/day treated greywater recovers <strong>{sustainReport.waterPlanning.greywater.flushingOffsetPercent}%</strong> of non-potable flushing and landscape demand.
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: MEP & ELECTRICAL */}
          {activeTab === 'mep' && (
            <div className="space-y-4 text-xs">
              
              {/* MEP Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Connected Load</span>
                  <span className="font-extrabold text-amber-400 text-base">{mepReport.summary.totalConnectedLoadKw} kW</span>
                  <span className="text-[10px] text-slate-500 block">3-Phase 415V Supply</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Light & Fan Points</span>
                  <span className="font-extrabold text-sky-400 text-base">{mepReport.summary.totalLightPoints} Points</span>
                  <span className="text-[10px] text-slate-500 block">FRLS Conduit Wiring</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Power Sockets (16A)</span>
                  <span className="font-extrabold text-emerald-400 text-base">{mepReport.summary.totalPowerSockets16A} Sockets</span>
                  <span className="text-[10px] text-slate-500 block">AC, Geyser, Kitchen</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Vertical MEP Shafts</span>
                  <span className="font-extrabold text-indigo-400 text-base">{mepReport.summary.totalVerticalShafts} Shafts</span>
                  <span className="text-[10px] text-slate-500 block">2ft × 2.5ft Service Ducts</span>
                </div>
              </div>

              {/* Vertical MEP Shafts Specs */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-400" /> Dedicated Vertical MEP Utility Shafts
                </span>
                <div className="space-y-2">
                  {mepReport.shafts.map((sh) => (
                    <div key={sh.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-200 block">{sh.description}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Dimensions: {sh.width}ft × {sh.height}ft • {sh.servesFloors}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-sky-300 font-bold font-mono text-[10px]">
                        Continuous Riser
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
