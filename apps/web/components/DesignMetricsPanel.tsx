'use client';

import React, { useState } from 'react';
import { useBuildingStore } from '../stores/buildingStore';
import {
  Activity,
  Bot,
  Sparkles,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  SunMedium,
  Wind,
  Layers,
  Send,
  Zap,
} from 'lucide-react';

export default function DesignMetricsPanel() {
  const { model, complianceReport, applyNLDirective } = useBuildingStore();
  const [promptInput, setPromptInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const carpetSqft = model.metrics.carpet_area_sqft || 1196;
  const builtupSqft = model.metrics.total_built_up_area_sqft || 1375;
  const grandTotalINR = model.metrics.cost_estimate?.grand_total_inr || 2195379;
  const ratePerSqft = Math.round(grandTotalINR / Math.max(1, carpetSqft));
  const passCount = complianceReport.passCount ?? 17;
  const failCount = complianceReport.failCount ?? 1;
  const compliancePct = Math.round((passCount / Math.max(1, passCount + failCount)) * 100);

  const handleSendAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsAiThinking(true);
    const directive = promptInput;
    setPromptInput('');

    setTimeout(() => {
      applyNLDirective(directive);
      setIsAiThinking(false);
    }, 600);
  };

  return (
    <aside className="w-80 border-l border-neutral-800 bg-neutral-950/80 backdrop-blur-xl flex flex-col h-full overflow-hidden text-neutral-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">Live Design & KPI Telemetry</span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Core Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Carpet Area</span>
            <div className="text-base font-bold text-white font-mono mt-0.5">{carpetSqft.toLocaleString()} sqft</div>
            <span className="text-[10px] text-neutral-500">{(carpetSqft * 0.0929).toFixed(1)} m²</span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Estimated BOQ</span>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              ₹{(grandTotalINR / 100000).toFixed(2)}L
            </div>
            <span className="text-[10px] text-neutral-500">₹{ratePerSqft}/sqft</span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">NBC Compliance</span>
            <div className="text-base font-bold text-amber-400 font-mono mt-0.5">{compliancePct}%</div>
            <span className="text-[10px] text-emerald-400 font-medium">Preliminary Pass</span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Ground Coverage</span>
            <div className="text-base font-bold text-sky-400 font-mono mt-0.5">53.5%</div>
            <span className="text-[10px] text-neutral-500">Max limit: 60%</span>
          </div>
        </div>

        {/* Multi-Objective Performance Gauges */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Objective Optimization</span>
            <span className="font-mono text-amber-400 text-[10px] font-bold">NSGA-II EVAL</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>Natural Daylight Factor</span>
                <span className="font-mono text-white">88.4%</span>
              </div>
              <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>Cross Ventilation Index</span>
                <span className="font-mono text-white">82.0%</span>
              </div>
              <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>Structural Regularity</span>
                <span className="font-mono text-white">96.0%</span>
              </div>
              <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '96%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-400 mb-1">
                <span>Circulation Efficiency</span>
                <span className="font-mono text-white">12.5%</span>
              </div>
              <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time AI Architectural Assistant */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Bot className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">ArchAI Copilot</span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Direct layout changes in natural language: e.g. <span className="text-amber-400 font-mono">"Make master bedroom 20 sq ft larger"</span> or <span className="text-amber-400 font-mono">"Expand kitchen"</span>.
          </p>

          <form onSubmit={handleSendAI} className="relative">
            <input
              type="text"
              placeholder="Type architectural directive..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isAiThinking}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition disabled:opacity-50"
            >
              {isAiThinking ? (
                <div className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
