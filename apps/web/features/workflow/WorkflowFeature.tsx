'use client';

import React, { useState } from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import {
  FolderPlus,
  MapPin,
  Upload,
  Sun,
  FileText,
  Bot,
  ShieldAlert,
  Cpu,
  Grid,
  Award,
  Check,
  Cuboid,
  Camera,
  Layers,
  Eye,
  Sliders,
  DollarSign,
  FileCheck,
  Network,
  Download,
  ArrowRight,
  ArrowLeft,
  Play,
  CheckCircle2,
} from 'lucide-react';

export default function WorkflowFeature() {
  const {
    model,
    workflowStep,
    setWorkflowStep,
    isWorkflowRunning,
    setIsWorkflowRunning,
    runOptimization,
    paretoCandidates,
    selectParetoCandidate,
    setActiveTab,
  } = useBuildingStore();

  const [promptText, setPromptText] = useState(
    'Modern 3-bedroom bioclimatic villa in Mumbai with double-height living room, vastu compliance, and rooftop solar array'
  );

  const workflowSteps = [
    { id: 0, label: 'CREATE PROJECT', icon: FolderPlus, desc: 'Initialize project workspace and metadata' },
    { id: 1, label: 'SITE', icon: MapPin, desc: 'Define geographic plot location and orientation' },
    { id: 2, label: 'UPLOAD / ENTER SITE', icon: Upload, desc: 'Input 30x40 ft cadastral boundary & setbacks' },
    { id: 3, label: 'GOOGLE SOLAR + GIS', icon: Sun, desc: 'Acquire annual solar irradiance flux data' },
    { id: 4, label: 'REQUIREMENTS', icon: FileText, desc: 'Specify spatial program brief & room quotas' },
    { id: 5, label: 'AI REQUIREMENTS PARSER', icon: Bot, desc: 'OpenAI GPT-4 architectural NLP validation' },
    { id: 6, label: 'CONSTRAINTS', icon: ShieldAlert, desc: 'Enforce NBC India 2016 statutory bylaws' },
    { id: 7, label: 'OPTIMIZER', icon: Cpu, desc: 'Launch 9-objective NSGA-II genetic algorithm' },
    { id: 8, label: '10–50 DESIGN OPTIONS', icon: Grid, desc: 'Synthesize non-dominated Pareto frontier' },
    { id: 9, label: 'RANK / COMPARE', icon: Award, desc: 'Multi-criteria objective trade-off analysis' },
    { id: 10, label: 'SELECT DESIGN', icon: Check, desc: 'Activate selected optimal candidate' },
    { id: 11, label: 'PARAMETRIC GEOMETRY', icon: Cuboid, desc: 'Compile sequential 3D building topology' },
    { id: 12, label: 'BLENDER', icon: Camera, desc: 'Dispatch Cycles 4K raytracing render job' },
    { id: 13, label: 'GLB', icon: Layers, desc: 'Extract multi-LOD GLBs (standard, low, high)' },
    { id: 14, label: 'THREE.JS', icon: Eye, desc: 'Interactive real-time 10-mode 3D viewport' },
    { id: 15, label: 'EDIT', icon: Sliders, desc: 'Parametric room tweaking & natural language copilot' },
    { id: 16, label: 'BOQ', icon: DollarSign, desc: '16-category automated Quantity Takeoff' },
    { id: 17, label: 'COMPLIANCE', icon: FileCheck, desc: 'Automated preliminary compliance analysis' },
    { id: 18, label: 'BIM', icon: Network, desc: 'IFC4 serialization & Autodesk APS / Speckle sync' },
    { id: 19, label: 'EXPORT', icon: Download, desc: 'Package IFC4, DXF, GLB, and BOQ CSV bundles' },
  ];

  const handleNext = () => {
    if (workflowStep < workflowSteps.length - 1) {
      setWorkflowStep(workflowStep + 1);
    }
  };

  const handlePrev = () => {
    if (workflowStep > 0) {
      setWorkflowStep(workflowStep - 1);
    }
  };

  const handleRunFullAutopilot = () => {
    setIsWorkflowRunning(true);
    let curr = 0;
    const interval = setInterval(() => {
      curr += 1;
      if (curr >= workflowSteps.length) {
        clearInterval(interval);
        setIsWorkflowRunning(false);
        setWorkflowStep(workflowSteps.length - 1);
      } else {
        setWorkflowStep(curr);
        if (curr === 7) {
          runOptimization(16, 8);
        }
      }
    }, 450);
  };

  const currentStepInfo = workflowSteps[workflowStep] || workflowSteps[0];
  const StepIcon = currentStepInfo.icon;

  return (
    <div className="space-y-6">
      {/* Workflow Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Flagship End-to-End Design-Generation Workflow
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Autonomous algorithmic pipeline traversing from site inception and solar flux to multi-objective Pareto evolution and BIM export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunFullAutopilot}
            disabled={isWorkflowRunning}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            {isWorkflowRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Running Autopilot Workflow...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>Run Full Autopilot Workflow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 20-Step Visual Flow Stepper */}
      <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-[1200px]">
          {workflowSteps.map((st, idx) => {
            const isCompleted = idx < workflowStep;
            const isCurrent = idx === workflowStep;
            const Icon = st.icon;

            return (
              <div key={st.id} className="flex items-center">
                <button
                  onClick={() => setWorkflowStep(idx)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition min-w-[100px] text-center ${
                    isCurrent
                      ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20 font-bold scale-105'
                      : isCompleted
                      ? 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:border-neutral-600'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isCurrent
                        ? 'bg-black text-amber-400'
                        : isCompleted
                        ? 'bg-neutral-800 text-emerald-400'
                        : 'bg-neutral-900 text-neutral-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-mono line-clamp-1">{st.label}</span>
                </button>
                {idx < workflowSteps.length - 1 && (
                  <div
                    className={`w-4 h-0.5 mx-0.5 ${
                      idx < workflowStep ? 'bg-emerald-500' : 'bg-neutral-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Step Dedicated Workspace Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                Step {workflowStep + 1} of {workflowSteps.length}
              </span>
              <h3 className="text-lg font-bold text-white">{currentStepInfo.label}</h3>
              <p className="text-xs text-neutral-400">{currentStepInfo.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={workflowStep === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded-xl transition disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={handleNext}
              disabled={workflowStep === workflowSteps.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-30"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Step Content Presentation */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 text-xs text-neutral-300">
          {workflowStep === 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Project Initialization</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500">Project Code:</span>
                  <div className="text-amber-400 font-bold">ARCHAI-MUM-2026-001</div>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500">Target Building Type:</span>
                  <div className="text-white font-bold">Bioclimatic Residential Villa</div>
                </div>
              </div>
            </div>
          )}

          {workflowStep === 4 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">AI Requirements Natural Language Prompt</h4>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {workflowStep === 7 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white">NSGA-II Multi-Objective Optimization</h4>
              <p className="text-neutral-400">
                Evaluating 9 objective fitness dimensions across Pareto population with constraint domination.
              </p>
              <button
                onClick={() => runOptimization(24, 12)}
                className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl"
              >
                Synthesize 24 Pareto Candidates
              </button>
            </div>
          )}

          {workflowStep >= 8 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white">Workflow Step Data Ready</h4>
                <span className="text-emerald-400 font-mono font-bold">Status: VERIFIED</span>
              </div>
              <p className="text-neutral-400">
                Stage {currentStepInfo.label} successfully completed and synchronized with the Single Source of Truth Canonical BuildingModel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
