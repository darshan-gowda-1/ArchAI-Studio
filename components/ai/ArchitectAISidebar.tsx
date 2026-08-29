'use client';

import React, { useState } from 'react';
import { CandidateDesign, SiteInformation, BuildingRequirements } from '@/types/architecture';
import { generateDesignExplanation } from '@/lib/diff/designDiffEngine';
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Zap,
  Info,
  TrendingUp,
  ShieldCheck,
  Diff,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ArchitectAISidebarProps {
  design: CandidateDesign;
  site: SiteInformation;
  requirements: BuildingRequirements;
  onApplyPromptChange: (prompt: string) => void;
  onOpenDiffModal: () => void;
  onOpenCompareModal: () => void;
}

export const ArchitectAISidebar: React.FC<ArchitectAISidebarProps> = ({
  design,
  site,
  requirements,
  onApplyPromptChange,
  onOpenDiffModal,
  onOpenCompareModal,
}) => {
  const [prompt, setPrompt] = useState<string>('Make the master bedroom 15% larger without increasing total cost.');
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const suggestedChanges = [
    'Reduce corridor area by 12 sq ft',
    'Move wardrobe to internal partition wall',
    'Reconfigure bathroom for universal wheelchair turning radius',
    'Align master bedroom window for morning east daylight',
    'Standardize structural column spacing to 14 ft',
  ];

  const explanationReasons = generateDesignExplanation(design);

  const handleApply = () => {
    if (!prompt.trim()) return;
    setIsApplying(true);
    setTimeout(() => {
      onApplyPromptChange(prompt);
      setIsApplying(false);
    }, 600);
  };

  return (
    <aside className="w-80 bg-[#11151A] border-l border-[#1E2530] flex flex-col h-full overflow-y-auto text-xs select-none z-20 shrink-0 font-sans">
      
      {/* Header */}
      <div className="p-4 border-b border-[#1E2530] flex justify-between items-center bg-[#080A0D]/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-white text-sm tracking-wide">Architect AI</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
          Online Copilot
        </span>
      </div>

      <div className="p-4 space-y-5 flex-1">
        
        {/* Natural Language Prompt Box */}
        <div className="space-y-2">
          <label className="text-slate-300 font-bold text-[11px] flex items-center justify-between">
            <span>Natural-Language Directive</span>
            <span className="text-[10px] text-slate-500 font-mono">LLM &amp; Geometry Engine</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full bg-[#080A0D] border border-[#1E2530] rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-amber-500 transition resize-none font-mono"
            placeholder="Type architectural change..."
          />
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-lg shadow-amber-950/50 transition flex items-center justify-center gap-2"
          >
            {isApplying ? (
              <span>Optimizing Geometry...</span>
            ) : (
              <>
                <span>Apply Change</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Quick Action Suggested Changes */}
        <div className="space-y-2 pt-1">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block font-mono">
            Suggested Changes
          </span>
          <div className="space-y-1.5">
            {suggestedChanges.map((sc, i) => (
              <button
                key={i}
                onClick={() => setPrompt(sc)}
                className="w-full text-left p-2.5 rounded-xl bg-[#080A0D] hover:bg-[#171D24] border border-[#1E2530] text-slate-300 hover:text-white transition flex items-start gap-2 text-[11px]"
              >
                <span className="text-amber-400 font-bold mt-0.5">•</span>
                <span className="leading-snug">{sc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* "Explain This Design" Accordion Panel (#54) */}
        <div className="space-y-2 border border-[#1E2530] rounded-2xl p-3 bg-[#080A0D]/70">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex justify-between items-center text-slate-200 font-bold text-[11px]"
          >
            <span className="flex items-center gap-1.5 text-amber-300">
              <Info className="w-3.5 h-3.5" /> Why this design?
            </span>
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {showExplanation && (
            <div className="space-y-2 pt-2 text-[11px] text-slate-300 font-mono border-t border-[#1E2530]">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
                Multi-Objective Trade-Off Rationale:
              </span>
              <ul className="space-y-1.5">
                {explanationReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Quick Tools: Compare & Version Diffing (#55, #56) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onOpenCompareModal}
            className="p-2.5 bg-[#080A0D] hover:bg-[#171D24] text-sky-400 font-bold rounded-xl border border-[#1E2530] transition flex flex-col items-center gap-1 text-[11px]"
          >
            <Maximize2 className="w-4 h-4" />
            <span>3-Way Compare</span>
          </button>

          <button
            onClick={onOpenDiffModal}
            className="p-2.5 bg-[#080A0D] hover:bg-[#171D24] text-amber-400 font-bold rounded-xl border border-[#1E2530] transition flex flex-col items-center gap-1 text-[11px]"
          >
            <Diff className="w-4 h-4" />
            <span>What Changed?</span>
          </button>
        </div>

      </div>

    </aside>
  );
};
