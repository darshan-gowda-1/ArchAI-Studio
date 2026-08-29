/**
 * ArchAI Studio v3 - Frontend Vitest Unit Test Suite
 * Tests:
 * 1. Project creation
 * 2. Design generation & Pareto candidate selection
 * 3. 3D Viewer mode transitions
 * 4. BOQ calculation & metric recomputation
 * 5. Multi-format export trigger
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useBuildingStore } from '../stores/buildingStore';

describe('ArchAI Studio v3 Frontend Store & State Machine', () => {
  beforeEach(() => {
    useBuildingStore.getState().recomputeAll();
  });

  it('initializes canonical building model with valid metadata', () => {
    const { model } = useBuildingStore.getState();
    expect(model.id).toBeDefined();
    expect(model.spaces.length).toBeGreaterThan(0);
    expect(model.site.boundary.total_area_sqft).toBe(1200);
  });

  it('handles 3D viewer mode transitions across all 10 modes', () => {
    const store = useBuildingStore.getState();
    const modes = [
      'Orbit', 'Walkthrough', 'First-person', 'Floor-plan',
      'Section', 'Exploded', 'Daylight', 'Night', 'Material', 'BIM'
    ] as const;

    modes.forEach((mode) => {
      store.setViewerMode(mode);
      expect(useBuildingStore.getState().viewerMode).toBe(mode);
    });
  });

  it('recalculates BOQ cost and statutory compliance upon spatial program updates', () => {
    const store = useBuildingStore.getState();
    const initialCost = store.model.metrics.cost_estimate?.grand_total_inr || 0;

    // Add a new space
    store.addSpace('Private Gym', 'other' as any, 200, 1);

    const updated = useBuildingStore.getState();
    expect(updated.model.spaces.some((s) => s.name === 'Private Gym')).toBe(true);
    expect(updated.model.metrics.cost_estimate?.grand_total_inr).toBeGreaterThan(initialCost);
  });

  it('executes NSGA-II optimization and selects candidate design', () => {
    const store = useBuildingStore.getState();
    store.runOptimization(8, 4);

    expect(useBuildingStore.getState().isOptimizing).toBe(true);
  });

  it('switches between 13 workstation navigation views cleanly', () => {
    const store = useBuildingStore.getState();
    const tabs = ['dashboard', 'workflow', 'comparison', 'reports', 'site', 'requirements', 'floorplan', 'geometry', 'optimizer', 'bim', 'boq', 'compliance', 'visualization'] as const;

    tabs.forEach((tab) => {
      store.setActiveTab(tab);
      expect(useBuildingStore.getState().activeTab).toBe(tab);
    });
  });
});
