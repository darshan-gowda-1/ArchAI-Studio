'use client';

import React, { useState } from 'react';
import { CandidateDesign, SiteInformation } from '@/types/architecture';
import { getClimateAdaptiveStrategy, ClimateAdaptiveStrategy } from '@/lib/climate/climateAdaptiveEngine';
import { simulateRoomDaylighting, BuildingDaylightReport } from '@/lib/solar/daylightSimulationEngine';
import { evaluateAccessibility, AccessibilityReport } from '@/lib/accessibility/accessibilityEngine';
import {
  Sun,
  Wind,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Layers,
  Thermometer,
  CloudSun,
  Activity,
  Heart,
} from 'lucide-react';

interface ClimateAndDaylightPanelProps {
  design: CandidateDesign;
  site: SiteInformation;
}

export const ClimateAndDaylightPanel: React.FC<ClimateAndDaylightPanelProps> = ({
  design,
  site,
}) => {
  const [activeTab, setActiveTab] = useState<'climate' | 'daylight' | 'accessibility'>('climate');

  const climateStrategy = getClimateAdaptiveStrategy(site.locationState || 'Mumbai, India');
  const daylightReport = simulateRoomDaylighting(design);
  const accessibilityReport = evaluateAccessibility(design, site);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-200 shadow-2xl space-y-5">
      
      {/* Top Tab Switcher */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('climate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'climate'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <CloudSun className="w-4 h-4" />
            <span>Climate-Aware Strategy ({climateStrategy.climateType})</span>
          </button>

          <button
            onClick={() => setActiveTab('daylight')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'daylight'
                ? 'bg-sky-600 text-white shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Multi-Interval Daylighting ({daylightReport.overallDaylightScore}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('accessibility')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'accessibility'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Universal Accessibility ({accessibilityReport.overallScore}%)</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {site.locationState}
        </span>
      </div>

      {/* 1. CLIMATE-AWARE ARCHITECTURAL STRATEGY */}
      {activeTab === 'climate' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Recommended WWR (Window-to-Wall)</span>
              <span className="font-extrabold text-amber-400 text-base font-mono">{climateStrategy.recommendedWwrPercent}%</span>
              <span className="text-[10px] text-slate-500 block">Passive solar/glare balance</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Chajja Overhang Projection</span>
              <span className="font-extrabold text-sky-400 text-base font-mono">{climateStrategy.chajjaOverhangDepthFt} ft</span>
              <span className="text-[10px] text-slate-500 block">Rain and solar shading</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Thermal Mass Specification</span>
              <span className="font-bold text-emerald-400 text-xs">{climateStrategy.wallThermalMassType}</span>
              <span className="text-[10px] text-slate-500 block">Thermal damping index</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Bioclimatic Roof Architecture</span>
              <span className="font-bold text-indigo-400 text-xs">{climateStrategy.recommendedRoofType}</span>
              <span className="text-[10px] text-slate-500 block">Microclimatic mitigation</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-200 block text-xs flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-sky-400" /> Natural Ventilation & Passive Solar Integration:
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">{climateStrategy.crossVentilationStrategy}</p>
            <p className="text-slate-400 text-[11px] leading-relaxed pt-1">{climateStrategy.passiveSolarStrategy}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="font-bold text-slate-200 text-xs">Location-Specific Bioclimatic Design Features:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {climateStrategy.bioclimaticFeatures.map((feat, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-2 text-slate-300 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MULTI-INTERVAL DAYLIGHTING ENGINE */}
      {activeTab === 'daylight' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Spatial Daylight Autonomy (sDA)</span>
              <span className="font-extrabold text-amber-400 text-lg font-mono">{daylightReport.overallDaylightScore}%</span>
              <span className="text-[10px] text-slate-500 block">&gt;300 lux for &gt;50% of daytime</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Average Ambient Illuminance</span>
              <span className="font-extrabold text-sky-400 text-lg font-mono">{daylightReport.averageLux} Lux</span>
              <span className="text-[10px] text-slate-500 block">Ideal residential range: 300-800 Lux</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Circadian Health Rating</span>
              <span className="font-bold text-emerald-400 text-sm">{daylightReport.circadianHealthRating}</span>
              <span className="text-[10px] text-slate-500 block">Human-centric biological rhythm</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-200 text-xs">Room-by-Room Multi-Interval Daylight Breakdown:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {daylightReport.rooms.map((rm) => (
                <div key={rm.roomId} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{rm.roomName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{rm.primaryLightFacing}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-amber-400 block font-bold">🌅 Morning</span>
                      <span className="text-slate-200 text-xs font-extrabold">{rm.morningScore}%</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-sky-400 block font-bold">☀️ Afternoon</span>
                      <span className="text-slate-200 text-xs font-extrabold">{rm.afternoonScore}%</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-indigo-400 block font-bold">🌇 Evening</span>
                      <span className="text-slate-200 text-xs font-extrabold">{rm.eveningScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. UNIVERSAL ACCESSIBILITY AUDIT */}
      {activeTab === 'accessibility' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-1">
              <span className="text-emerald-400 block text-[11px] font-bold">Universal Accessibility Rating</span>
              <span className="font-extrabold text-emerald-400 text-lg font-mono">{accessibilityReport.overallScore}%</span>
              <span className="text-[10px] text-emerald-300/80 block">{accessibilityReport.grade}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Wheelchair Circulation Index</span>
              <span className="font-extrabold text-sky-400 text-lg font-mono">{accessibilityReport.wheelchairCirculationScore}%</span>
              <span className="text-[10px] text-slate-500 block">Min. 3.5ft hallway & 5ft turning circle</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Door & Entrance Clearances</span>
              <span className="font-extrabold text-blue-400 text-lg font-mono">{accessibilityReport.doorClearanceScore}%</span>
              <span className="text-[10px] text-slate-500 block">Min. 3ft clear leaf openings</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-200 text-xs">Accessibility & Barrier-Free Design Audit Items:</span>
            <div className="space-y-2">
              {accessibilityReport.auditItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{item.feature}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({item.category})</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.actualDesignValue}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold font-mono shrink-0 ${
                    item.status === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
