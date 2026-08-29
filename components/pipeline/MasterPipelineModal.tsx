'use client';

import React, { useState, useEffect } from 'react';
import {
  SiteInformation,
  BuildingRequirements,
  CandidateDesign,
  ArchitectureProject,
} from '@/types/architecture';
import {
  MasterPipelineOrchestrator,
  PipelineStageEvent,
} from '@/lib/pipeline/masterPipelineOrchestrator';
import {
  Zap,
  CheckCircle2,
  X,
  Play,
  ArrowRight,
  Layers,
  Sparkles,
  Box,
  Building,
  DollarSign,
  Leaf,
  ShieldCheck,
  Cpu,
  Terminal,
  Activity,
  Maximize2,
} from 'lucide-react';

interface MasterPipelineModalProps {
  site: SiteInformation;
  requirements: BuildingRequirements;
  onApplyPipelineResult: (result: {
    project: ArchitectureProject;
    selectedDesign: CandidateDesign;
    allDesigns: CandidateDesign[];
  }) => void;
  onClose: () => void;
}

export const MasterPipelineModal: React.FC<MasterPipelineModalProps> = ({
  site,
  requirements,
  onApplyPipelineResult,
  onClose,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [activeStageId, setActiveStageId] = useState<string>('ai_architect');
  const [currentMessage, setCurrentMessage] = useState<string>('Ready to execute master 16-stage pipeline.');
  const [logs, setLogs] = useState<string[]>([]);
  const [pipelineResult, setPipelineResult] = useState<{
    project: ArchitectureProject;
    selectedDesign: CandidateDesign;
    allDesigns: CandidateDesign[];
    explanation: string[];
  } | null>(null);

  const stages = [
    { id: 'ai_architect', label: '1. AI Architect', icon: Sparkles },
    { id: 'requirement_graph', label: '2. Requirement Graph', icon: Layers },
    { id: 'site_intelligence', label: '3. Site Intelligence', icon: Activity },
    { id: 'buildable_envelope', label: '4. Envelope', icon: Maximize2 },
    { id: 'constraint_engine', label: '5. Constraints', icon: ShieldCheck },
    { id: 'floorplan_generator', label: '6. Generator', icon: Building },
    { id: 'multi_objective_ga', label: '7. NSGA-II GA', icon: Cpu },
    { id: 'top_design_set', label: '8. Top Designs', icon: Zap },
    { id: 'structural_grid', label: '9. Structural Grid', icon: Box },
    { id: 'parametric_bim', label: '10. Open BIM', icon: Box },
    { id: 'interior_engine', label: '11. Interiors', icon: Building },
    { id: 'visualization', label: '12. Visualization', icon: Sparkles },
    { id: 'quantity_takeoff', label: '13. Takeoff (QTO)', icon: DollarSign },
    { id: 'boq_cost', label: '14. BOQ & Cost', icon: DollarSign },
    { id: 'compliance_sustainability', label: '15. Compliance', icon: Leaf },
    { id: 'final_canonical_project', label: '16. Final Project', icon: CheckCircle2 },
  ];

  const handleStartPipeline = async () => {
    setIsRunning(true);
    setIsCompleted(false);
    setLogs([]);
    setCurrentProgress(0);

    try {
      const res = await MasterPipelineOrchestrator.executeFullPipeline(
        site,
        requirements,
        (event: PipelineStageEvent) => {
          setCurrentProgress(event.progressPercent);
          setActiveStageId(event.stageId);
          setCurrentMessage(event.summaryMessage);
          if (event.logEntry) {
            setLogs((prev) => [...prev, event.logEntry]);
          }
        }
      );

      setPipelineResult(res);
      setIsCompleted(true);
      setIsRunning(false);
    } catch (err) {
      console.error('Pipeline execution error:', err);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    handleStartPipeline();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#11151A] border border-[#1E2530] rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl font-sans text-xs">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1E2530] flex justify-between items-center bg-[#080A0D]/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-extrabold text-white">Master 16-Stage AI Architectural Pipeline</h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                {isCompleted ? 'COMPLETED' : isRunning ? 'OPTIMIZING' : 'STANDBY'}
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              End-to-End autonomous compilation from natural language brief to fully resolved Canonical ArchitectureProject.
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
          
          {/* Real-time Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-mono text-[11px]">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {currentMessage}
              </span>
              <span className="text-amber-400 font-extrabold text-sm">{currentProgress}%</span>
            </div>

            <div className="w-full bg-[#080A0D] h-3 rounded-full overflow-hidden border border-[#1E2530] p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-400 rounded-full transition-all duration-300 shadow-md"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          {/* 16-Stage Visual DAG Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {stages.map((st, idx) => {
              const isActive = st.id === activeStageId;
              const isPast = stages.findIndex((s) => s.id === activeStageId) > idx || isCompleted;
              const Icon = st.icon;

              return (
                <div
                  key={st.id}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition ${
                    isActive
                      ? 'bg-amber-950/40 border-amber-500 shadow-lg text-white scale-105 z-10 animate-pulse-subtle'
                      : isPast
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-[#080A0D] border-[#1E2530] text-slate-500 opacity-60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : isPast ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span className="font-mono text-[9.5px] leading-tight font-bold">{st.label}</span>
                </div>
              );
            })}
          </div>

          {/* Live Pipeline Telemetry Console */}
          <div className="rounded-2xl border border-[#1E2530] bg-[#080A0D] p-4 space-y-2 font-mono">
            <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-[#1E2530] pb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-500" /> Pipeline Console Logs
              </span>
              <span>16 / 16 Stages</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto text-[11px]">
              {logs.map((lg, i) => (
                <div key={i} className="text-slate-300 leading-snug">
                  <span className="text-slate-600 mr-2">[{new Date().toISOString().substring(14, 19)}]</span>
                  <span>{lg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Output Action Footer */}
          {isCompleted && pipelineResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-[#11151A] to-amber-950/30 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Canonical ArchitectureProject Synthesized!
                </span>
                <p className="text-slate-400 text-xs font-mono">
                  {pipelineResult.selectedDesign.name} • {pipelineResult.selectedDesign.totalBuiltUpArea} sq ft • ₹{(pipelineResult.selectedDesign.estimatedCost / 100000).toFixed(2)} Lakh • 100% Bye-Law Compliant
                </p>
              </div>

              <button
                onClick={() => {
                  onApplyPipelineResult(pipelineResult);
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Load Into 3D Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
