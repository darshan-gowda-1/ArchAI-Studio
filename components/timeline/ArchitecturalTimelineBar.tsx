'use client';

import React from 'react';
import {
  Layers,
  LayoutGrid,
  Zap,
  Maximize2,
  Box,
  Building,
  DollarSign,
  Download,
  CheckCircle2,
} from 'lucide-react';

export type WorkflowStage =
  | 'site'
  | 'requirements'
  | 'generate'
  | 'compare'
  | '3d'
  | 'interior'
  | 'cost'
  | 'report';

interface ArchitecturalTimelineBarProps {
  currentStage: WorkflowStage;
  onSelectStage: (stage: WorkflowStage) => void;
}

export const ArchitecturalTimelineBar: React.FC<ArchitecturalTimelineBarProps> = ({
  currentStage,
  onSelectStage,
}) => {
  const stages: { id: WorkflowStage; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'site', label: '1. Site', icon: Layers },
    { id: 'requirements', label: '2. Program', icon: LayoutGrid },
    { id: 'generate', label: '3. Optimizer', icon: Zap },
    { id: 'compare', label: '4. Compare', icon: Maximize2 },
    { id: '3d', label: '5. 3D Studio', icon: Box },
    { id: 'interior', label: '6. Interior', icon: Building },
    { id: 'cost', label: '7. Cost BOQ', icon: DollarSign },
    { id: 'report', label: '8. Report', icon: Download },
  ];

  return (
    <div className="w-full bg-[#080A0D] border-t border-[#1E2530] px-4 py-2 flex items-center justify-between overflow-x-auto text-xs select-none z-20 shrink-0 font-mono">
      <div className="flex items-center gap-1 sm:gap-2 mx-auto">
        {stages.map((st, idx) => {
          const isCurrent = currentStage === st.id;
          const Icon = st.icon;

          return (
            <React.Fragment key={st.id}>
              <button
                onClick={() => onSelectStage(st.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  isCurrent
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40'
                    : 'bg-[#11151A] hover:bg-[#171D24] text-slate-400 hover:text-slate-200 border border-[#1E2530]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-200' : 'text-slate-400'}`} />
                <span>{st.label}</span>
              </button>

              {idx < stages.length - 1 && (
                <span className="text-slate-600 font-bold hidden md:inline">➔</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
