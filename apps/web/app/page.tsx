'use client';

import React from 'react';
import HeaderHUD from '../components/HeaderHUD';
import SidebarControls from '../components/SidebarControls';
import DesignMetricsPanel from '../components/DesignMetricsPanel';
import TimelineVariantsBar from '../components/TimelineVariantsBar';
import { useBuildingStore } from '../stores/buildingStore';

import DashboardFeature from '../features/dashboard/DashboardFeature';
import WorkflowFeature from '../features/workflow/WorkflowFeature';
import { DesignComparisonView } from '../features/comparison/DesignComparisonView';
import { ReportsFeature } from '../features/reports/ReportsFeature';
import SiteFeature from '../features/site/SiteFeature';
import RequirementsFeature from '../features/requirements/RequirementsFeature';
import FloorplanFeature from '../features/floorplan/FloorplanFeature';
import GeometryFeature from '../features/geometry/GeometryFeature';
import OptimizerFeature from '../features/optimizer/OptimizerFeature';
import BimFeature from '../features/bim/BimFeature';
import BoqFeature from '../features/boq/BoqFeature';
import ComplianceFeature from '../features/compliance/ComplianceFeature';
import VisualizationFeature from '../features/visualization/VisualizationFeature';

export default function ArchAIStudioPage() {
  const { activeTab } = useBuildingStore();

  const renderActiveFeature = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardFeature />;
      case 'workflow':
        return <WorkflowFeature />;
      case 'comparison':
        return <DesignComparisonView />;
      case 'reports':
        return <ReportsFeature />;
      case 'site':
        return <SiteFeature />;
      case 'requirements':
        return <RequirementsFeature />;
      case 'floorplan':
        return <FloorplanFeature />;
      case 'geometry':
        return <GeometryFeature />;
      case 'optimizer':
        return <OptimizerFeature />;
      case 'bim':
        return <BimFeature />;
      case 'boq':
        return <BoqFeature />;
      case 'compliance':
        return <ComplianceFeature />;
      case 'visualization':
        return <VisualizationFeature />;
      default:
        return <DashboardFeature />;
    }
  };

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black overflow-hidden">
      {/* 1. Top HUD Bar */}
      <HeaderHUD />

      {/* 2. Main Workstation Body: Left Sidebar + Center Canvas + Right Telemetry */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Project & Feature Navigation */}
        <SidebarControls />

        {/* Center: Dynamic 3D Workspace / Studio Views */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-950/60 relative">
          <div className="h-full max-w-[1600px] mx-auto">{renderActiveFeature()}</div>
        </main>

        {/* Right: Real-time Telemetry, AI Assistant & Properties */}
        <DesignMetricsPanel />
      </div>

      {/* 3. Bottom Timeline / Design Variants / Optimization Progress Bar */}
      <TimelineVariantsBar />
    </div>
  );
}
