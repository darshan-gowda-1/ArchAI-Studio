'use client';

import React from 'react';
import { JobTelemetryFrame } from '@/lib/api/webSocketJobClient';
import { CandidateDesign } from '@/types/architecture';
import {
  Cpu,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Box,
  ShieldCheck,
  Zap,
  Radio,
} from 'lucide-react';

interface RealtimeJobProgressModalProps {
  telemetry: JobTelemetryFrame | null;
  onApplyResults: (designs: CandidateDesign[]) => void;
  onClose: () => void;
}

export const RealtimeJobProgressModal: React.FC<RealtimeJobProgressModalProps> = ({
  telemetry,
  onApplyResults,
  onClose,
}) => {
  if (!telemetry) return null;

  const isCompleted = telemetry.status === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-slate-200 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-sky-400 font-bold text-base">
            <Cpu className="w-5 h-5 animate-pulse text-sky-400" />
            <span>ARCHITECT AI: Real-Time Worker Telemetry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-mono text-emerald-400 border border-slate-700">
              <Radio className="w-3 h-3 animate-ping" />
              {telemetry.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Progress Bar & Status Message */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-bold">{telemetry.message}</span>
            <span className="text-sky-400 font-extrabold">{telemetry.progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${telemetry.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Real-time Checklist Tasks */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
          <span className="text-[11px] font-mono text-slate-400 block border-b border-slate-800 pb-2">
            ASYNCHRONOUS JOB PIPELINE • JOB ID: {telemetry.jobId}
          </span>

          <div className="space-y-2">
            {telemetry.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-1 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  {task.status === 'completed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {task.status === 'in_progress' && (
                    <Clock className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  )}
                  {task.status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span
                    className={`${
                      task.status === 'completed'
                        ? 'text-slate-200'
                        : task.status === 'in_progress'
                        ? 'text-amber-300 font-bold'
                        : 'text-slate-600'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold ${
                    task.status === 'completed'
                      ? 'text-emerald-400'
                      : task.status === 'in_progress'
                      ? 'text-amber-400'
                      : 'text-slate-600'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Engine Provenance Box */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 font-mono flex flex-wrap justify-between gap-2">
          <span>Optimizer: NSGA-II v3.1</span>
          <span>Rules: National/State Bye-laws 2026.08</span>
          <span>Cost DB: CPWD-DSR-2024</span>
          <span>BIM: IFC4 Compiler</span>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800">
          {!isCompleted ? (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition"
            >
              Run in Background
            </button>
          ) : (
            <button
              onClick={() => {
                if (telemetry.resultDesigns) {
                  onApplyResults(telemetry.resultDesigns);
                }
                onClose();
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Load 3 Optimized Candidate Designs
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
