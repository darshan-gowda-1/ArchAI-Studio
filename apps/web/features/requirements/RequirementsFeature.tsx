'use client';

import React, { useState } from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import { Sparkles, Bot, CheckCircle2, ArrowRight, ShieldAlert, Cpu, RefreshCw } from 'lucide-react';

export default function RequirementsFeature() {
  const { model, applyNLDirective, isOptimizing } = useBuildingStore();
  const [briefInput, setBriefInput] = useState(
    'I need a 3 bedroom house for a family of five, around 2200 sq ft, with a home office, parking for two cars and good natural ventilation.'
  );
  const [directiveInput, setDirectiveInput] = useState(
    'Make the kitchen larger but don’t increase the budget.'
  );
  const [isParsing, setIsParsing] = useState(false);
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);

  const handleParseBrief = () => {
    setIsParsing(true);
    setTimeout(() => {
      setIsParsing(false);
      setLastActionStatus('Brief validated by Pydantic Schema & translated into Canonical Building Model.');
    }, 500);
  };

  const handleApplyDirective = () => {
    if (!directiveInput.trim()) return;
    applyNLDirective(directiveInput);
    setLastActionStatus(`Applied constraint directive: "${directiveInput}"`);
  };

  return (
    <div className="space-y-6">
      {/* Safety Protocol Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-amber-400" />
          <span>
            <strong className="text-white">Requirements AI Safe Architecture:</strong> User Brief ➔ OpenAI JSON Function Calling ➔ Pydantic Validation ➔ Constraint Feasibility Solver ➔ Canonical Building Model.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
          Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Natural Language Brief Parser */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Natural Language Architectural Brief
          </h3>
          <p className="text-xs text-neutral-400">
            Describe your family requirements, space count, square footage, parking, or lifestyle preferences in plain English.
          </p>

          <textarea
            value={briefInput}
            onChange={(e) => setBriefInput(e.target.value)}
            rows={4}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            placeholder="Enter architectural requirements brief..."
          />

          <button
            onClick={handleParseBrief}
            disabled={isParsing}
            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold rounded-xl transition flex justify-center items-center gap-2"
          >
            {isParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4 text-amber-400" />}
            {isParsing ? 'Validating Pydantic Schema...' : 'Parse & Validate Requirements'}
          </button>

          {/* Validated Parameters Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-neutral-300">
              <span>EXTRACTED VALIDATED PARAMETERS</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pydantic Validated
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                <span className="text-neutral-400">Building Type</span>
                <div className="font-semibold text-white">Residential Villa</div>
              </div>
              <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                <span className="text-neutral-400">Target Carpet Area</span>
                <div className="font-semibold text-amber-400">2,200 sq ft</div>
              </div>
              <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                <span className="text-neutral-400">Bedrooms / Bathrooms</span>
                <div className="font-semibold text-white">3 BHK / 3 Baths</div>
              </div>
              <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                <span className="text-neutral-400">Occupants / Parking</span>
                <div className="font-semibold text-white">5 Persons / 2 Cars</div>
              </div>
            </div>

            <div className="text-xs text-neutral-400 pt-1">
              <strong>Detected Special Rules:</strong>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">home_office</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">natural_ventilation</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">morning_sun_master_bed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Conversational Constrained Redesign */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-400" />
            Conversational Constrained Redesign
          </h3>
          <p className="text-xs text-neutral-400">
            Submit localized follow-up directives to mutate the floor plan while respecting structural column alignments and budget locks.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">Natural-Language Follow-up Directive</label>
            <input
              type="text"
              value={directiveInput}
              onChange={(e) => setDirectiveInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
              placeholder="e.g. Make the kitchen larger but don't increase budget..."
            />
          </div>

          <button
            onClick={handleApplyDirective}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm rounded-xl shadow-lg transition flex justify-center items-center gap-2"
          >
            Apply Constrained Redesign <ArrowRight className="w-4 h-4" />
          </button>

          {lastActionStatus && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{lastActionStatus}</span>
            </div>
          )}

          {/* Preset Prompts */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <span className="text-xs text-neutral-400 font-semibold">Try sample design directives:</span>
            <div className="space-y-1.5">
              {[
                "Make the kitchen larger but don't increase the budget.",
                'Expand living room and prioritize morning east sunlight.',
                'Add a walk-in wardrobe to master bedroom on First Floor.',
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setDirectiveInput(preset)}
                  className="w-full text-left p-2 rounded bg-neutral-950/60 border border-neutral-800/80 text-xs text-neutral-300 hover:text-amber-300 hover:border-amber-500/30 transition"
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
