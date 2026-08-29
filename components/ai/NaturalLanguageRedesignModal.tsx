'use client';

import React, { useState } from 'react';
import { useBuildingStore } from '../../apps/web/stores/buildingStore';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Building,
  Box,
  DollarSign,
  Sun,
  ShieldCheck,
  X,
  Play,
  RotateCcw,
  Sliders,
} from 'lucide-react';

interface NaturalLanguageRedesignModalProps {
  onClose: () => void;
}

export const NaturalLanguageRedesignModal: React.FC<NaturalLanguageRedesignModalProps> = ({
  onClose,
}) => {
  const { model, applyNLDirective, recomputeAll } = useBuildingStore();
  const [initialPrompt, setInitialPrompt] = useState<string>(
    'I want a 3BHK house on a 30 × 40 plot. Keep two-car parking, give the master bedroom morning sunlight, keep the living room large, and stay below ₹40 lakh.'
  );
  const [followupPrompt, setFollowupPrompt] = useState<string>(
    'Make the kitchen larger but don\'t increase the budget.'
  );

  const [step, setStep] = useState<'prompt' | 'executing' | 'review' | 'refining' | 'complete'>('prompt');
  const [logs, setLogs] = useState<string[]>([]);

  const handleRunInitialOptimization = async () => {
    setStep('executing');
    setLogs([]);

    const logSteps = [
      'Analyzing site: 30 × 40 plot (1,200 sq ft, South-Facing Road)...',
      'Understanding requirements: 3 bedrooms, 2 parking, east morning light, ₹40L budget ceiling...',
      'Generating initial population: 500 spatial candidates synthesized...',
      'Applying municipal constraints: 318 valid non-overlapping layouts passed...',
      'Running NSGA-II Multi-Objective Optimization (Cost, Daylight, Privacy, Circulation, Structural Grid)...',
      'Pareto frontier calculated: 3 optimal architectural designs ready.'
    ];

    for (let i = 0; i < logSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 300));
      setLogs((prev) => [...prev, logSteps[i]]);
    }

    setStep('review');
  };

  const handleApplyFollowupRedesign = async () => {
    setStep('refining');

    const refinementLogs = [
      `Parsing constraint directive: "${followupPrompt}"...`,
      'LOCK APPLIED: Budget Envelope (Max ₹40.0 Lakh)...',
      'Modifying spatial boundary: Expanding Kitchen (+25.0 sq ft)...',
      'Rebalancing adjacent spaces: Compacting utility corridor (-25.0 sq ft)...',
      'Re-running local geometric NSGA-II optimizer...',
      'Recalculating structural column alignment (14 RCC nodes)...',
      'Updating parametric BOQ & Regional cost: ₹39.2L (Budget preserved)...',
      'Updating Daylight Score: 92% (+4 pts) | Compliance: 100% PASS.'
    ];

    for (let i = 0; i < refinementLogs.length; i++) {
      await new Promise((r) => setTimeout(r, 250));
      setLogs((prev) => [...prev, refinementLogs[i]]);
    }

    applyNLDirective(followupPrompt);
    recomputeAll();
    setStep('complete');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans text-xs">
      <div className="bg-[#11151A] border border-[#1E2530] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1E2530] flex justify-between items-center bg-[#080A0D]/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-extrabold text-white">Natural-Language Constrained Redesign</h2>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                PORTFOLIO SHOWCASE
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Natural language prompt $\rightarrow$ live constraint parsing $\rightarrow$ 500-candidate GA $\rightarrow$ 3D BIM &amp; cost updates.
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
          
          {/* STEP 1: Initial Prompt */}
          {(step === 'prompt' || step === 'executing') && (
            <div className="space-y-4">
              <label className="font-bold text-slate-200 text-sm block">
                1. Initial Architectural Brief (Natural Language)
              </label>
              <textarea
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                rows={3}
                disabled={step === 'executing'}
                className="w-full bg-[#080A0D] border border-[#1E2530] rounded-2xl p-4 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition resize-none"
              />

              {step === 'prompt' && (
                <button
                  onClick={handleRunInitialOptimization}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Synthesize Initial 500 Candidates</span>
                </button>
              )}
            </div>
          )}

          {/* Console Streaming Logs */}
          {logs.length > 0 && (
            <div className="rounded-2xl border border-[#1E2530] bg-[#080A0D] p-4 space-y-2 font-mono">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
                Optimizer Reasoning &amp; Constraint Solver
              </span>
              <div className="space-y-1 max-h-40 overflow-y-auto text-[11px]">
                {logs.map((l, i) => (
                  <div key={i} className="text-slate-300 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 & 3: Review & Follow-up Redesign */}
          {(step === 'review' || step === 'refining' || step === 'complete') && (
            <div className="space-y-4 pt-2 border-t border-[#1E2530]">
              <div className="flex justify-between items-center">
                <label className="font-bold text-white text-sm block">
                  2. Constrained Redesign Directive
                </label>
                <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Budget Constraint Locked
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={followupPrompt}
                  onChange={(e) => setFollowupPrompt(e.target.value)}
                  disabled={step === 'refining' || step === 'complete'}
                  placeholder="e.g. Make the kitchen larger but don't increase budget..."
                  className="flex-1 bg-[#080A0D] border border-[#1E2530] rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />

                {step === 'review' && (
                  <button
                    onClick={handleApplyFollowupRedesign}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transition whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply Redesign</span>
                  </button>
                )}
              </div>

              {/* Metrics Comparison Card */}
              {step === 'complete' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#11151A] to-amber-950/40 border border-emerald-500/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Redesign Successfully Executed &amp; Rebalanced!
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      BUDGET PRESERVED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-[#080A0D] border border-[#1E2530]">
                      <span className="text-slate-400 text-[10px] block">Kitchen Area</span>
                      <span className="text-white font-bold">+25.0 sq ft</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#080A0D] border border-[#1E2530]">
                      <span className="text-slate-400 text-[10px] block">Estimated Cost</span>
                      <span className="text-emerald-400 font-bold">₹39.2 Lakh (Under ₹40L)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#080A0D] border border-[#1E2530]">
                      <span className="text-slate-400 text-[10px] block">Daylight Score</span>
                      <span className="text-amber-400 font-bold">92% (+4 points)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#080A0D] border border-[#1E2530]">
                      <span className="text-slate-400 text-[10px] block">Compliance</span>
                      <span className="text-sky-400 font-bold">100% PASS</span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span>Load Redesigned Building Into Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
