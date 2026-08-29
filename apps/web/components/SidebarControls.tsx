'use client';

import React from 'react';
import { useBuildingStore, ActiveTab } from '../stores/buildingStore';
import {
  LayoutDashboard,
  Workflow,
  Columns,
  FileText,
  MapPin,
  Sparkles,
  Layers,
  Box,
  Cpu,
  FileCode,
  FileSpreadsheet,
  ShieldCheck,
  Sun,
} from 'lucide-react';

const NAV_ITEMS: { tab: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { tab: 'dashboard', label: '3D Workstation View', icon: LayoutDashboard },
  { tab: 'workflow', label: 'End-to-End Workflow', icon: Workflow },
  { tab: 'comparison', label: 'Design Comparison (3D)', icon: Columns },
  { tab: 'reports', label: 'Architectural Reports', icon: FileText },
  { tab: 'site', label: 'Site & Cadastral GIS', icon: MapPin },
  { tab: 'requirements', label: 'Program & AI Brief', icon: Sparkles },
  { tab: 'floorplan', label: '2D Floor Plan CAD', icon: Layers },
  { tab: 'geometry', label: 'Parametric Geometry', icon: Box },
  { tab: 'optimizer', label: 'NSGA-II Optimizer', icon: Cpu },
  { tab: 'bim', label: 'Open BIM & Exporters', icon: FileCode },
  { tab: 'boq', label: 'BOQ & Cost Takeoff', icon: FileSpreadsheet },
  { tab: 'compliance', label: 'NBC 2016 Compliance', icon: ShieldCheck },
  { tab: 'visualization', label: 'Cinematic Sun & Renders', icon: Sun },
];

export default function SidebarControls() {
  const { activeTab, setActiveTab } = useBuildingStore();

  return (
    <aside className="w-64 bg-neutral-950/90 backdrop-blur-xl border-r border-neutral-800 p-4 flex flex-col justify-between shrink-0 h-full overflow-y-auto">
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-3 mb-2 font-mono">
          PROJECT WORKSPACE
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition duration-150 ${
                isActive
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-amber-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer System Info */}
      <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1 mt-4">
        <div className="text-neutral-200 font-semibold font-mono text-[10px] uppercase">Engine Status</div>
        <div className="text-neutral-400 text-[10px]">Shapely • NSGA-II • Three.js</div>
        <div className="text-amber-400 font-mono font-bold text-[10px] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE (v3.0.0)
        </div>
      </div>
    </aside>
  );
}
