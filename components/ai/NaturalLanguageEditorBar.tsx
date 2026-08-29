'use client';

import React, { useState } from 'react';
import { CandidateDesign, SiteInformation, BuildingRequirements, DesignLocks } from '@/types/architecture';
import { executeNaturalLanguageEdit, NLPEditResult } from '@/lib/nlp/naturalLanguageEditor';
import { evaluateDesignAdjacencies } from '@/lib/constraints/constraintGraph';
import { evaluateStructuralConstructibility } from '@/lib/bim/structuralGridOptimizer';
import {
  Sparkles,
  Lock,
  Unlock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Grid,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface NaturalLanguageEditorBarProps {
  design: CandidateDesign;
  site: SiteInformation;
  requirements: BuildingRequirements;
  onApplyDesignChange: (updatedDesign: CandidateDesign) => void;
}

export const NaturalLanguageEditorBar: React.FC<NaturalLanguageEditorBarProps> = ({
  design,
  site,
  requirements,
  onApplyDesignChange,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [locks, setLocks] = useState<DesignLocks>({
    plot: false,
    exteriorEnvelope: false,
    masterBedroom: false,
    staircase: true,
    kitchen: false,
    budget: false,
    structuralGrid: false,
  });

  const [lastResult, setLastResult] = useState<NLPEditResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const adjScore = evaluateDesignAdjacencies(design);
  const structReport = evaluateStructuralConstructibility(design);

  const samplePrompts = [
    'Make the master bedroom larger.',
    'Move the kitchen closer to dining.',
    'Reduce the construction cost by 10%.',
    'Give the master bedroom better morning sunlight.',
    "Don't change the exterior.",
    'Align all bathrooms vertically and regularize columns.',
  ];

  const handleExecute = (customPrompt?: string) => {
    const textToRun = customPrompt || prompt;
    if (!textToRun.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const result = executeNaturalLanguageEdit(textToRun, design, site, requirements, locks);
      setLastResult(result);
      setLocks(result.updatedLocks);
      if (result.success) {
        onApplyDesignChange(result.updatedDesign);
      }
      setIsProcessing(false);
    }, 350);
  };

  const toggleLock = (key: keyof DesignLocks) => {
    setLocks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-200 shadow-xl space-y-4">
      
      {/* Title & Stats */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>Natural-Language Architectural Co-Pilot & Design Locks</span>
        </div>

        {/* Semantic Constraint Graph & Structural Metrics */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sky-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Adjacency Graph: {adjScore.totalScore}%
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5" /> Column Grid: {structReport.constructibilityGrade}
          </span>
        </div>
      </div>

      {/* DESIGN LOCKS CONTROL BAR */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-slate-400 flex items-center gap-1 text-[11px]">
          <Lock className="w-3.5 h-3.5 text-amber-400" /> Active Design Locks:
        </span>

        {[
          { key: 'plot', label: 'Plot & Setbacks' },
          { key: 'exteriorEnvelope', label: 'Exterior Envelope' },
          { key: 'masterBedroom', label: 'Master Bed' },
          { key: 'staircase', label: 'Staircase Core' },
          { key: 'kitchen', label: 'Kitchen' },
          { key: 'budget', label: 'Hard Budget' },
        ].map(({ key, label }) => {
          const isLocked = locks[key as keyof DesignLocks];
          return (
            <button
              key={key}
              onClick={() => toggleLock(key as keyof DesignLocks)}
              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5 ${
                isLocked
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-slate-500" />}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Prompt Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
          placeholder="e.g. 'Make the master bedroom larger' or 'Reduce the cost by 10%'"
          className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={() => handleExecute()}
          disabled={isProcessing || !prompt.trim()}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isProcessing ? 'Mutating...' : 'Edit'}</span>
        </button>
      </div>

      {/* Sample Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
        <span className="text-slate-500 font-semibold shrink-0">Try:</span>
        {samplePrompts.map((sp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(sp);
              handleExecute(sp);
            }}
            className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg whitespace-nowrap transition"
          >
            "{sp}"
          </button>
        ))}
      </div>

      {/* Live AI Execution Feedback Banner */}
      {lastResult && (
        <div
          className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
            lastResult.success
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {lastResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span>{lastResult.explanation}</span>
          </div>

          {lastResult.modifications.length > 0 && (
            <ul className="list-disc list-inside text-[11px] text-slate-400 font-mono space-y-0.5 pt-1">
              {lastResult.modifications.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}

    </div>
  );
};
