'use client';

import React from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import Viewport3D from '../../components/Viewport3D';
import {
  Maximize2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  IndianRupee,
  Sun,
  Eye,
  Sliders,
} from 'lucide-react';

export default function DashboardFeature() {
  const { model, sunHour, setActiveTab } = useBuildingStore();

  return (
    <div className="h-full w-full flex flex-col space-y-4">
      {/* 3D Workstation Center Canvas Container */}
      <div className="flex-1 w-full bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative min-h-[600px] flex flex-col">
        <Viewport3D model={model} sunHour={sunHour} />
      </div>
    </div>
  );
}
