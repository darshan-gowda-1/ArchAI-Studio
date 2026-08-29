import { create } from 'zustand';
import {
  BuildingModel,
  createDefaultBuildingModel,
  Site,
  Space,
  Setbacks,
  SpaceType,
} from '@archai/building-model';
import { calculateBuildingBOQ } from '@archai/boq';
import { checkBuildingCompliance, ComplianceReport } from '@archai/compliance';
import { runNSGA2Optimization, ParetoCandidate } from '@archai/optimizer';

export type ActiveTab =
  | 'dashboard'
  | 'workflow'
  | 'comparison'
  | 'reports'
  | 'site'
  | 'requirements'
  | 'floorplan'
  | 'geometry'
  | 'optimizer'
  | 'bim'
  | 'boq'
  | 'compliance'
  | 'visualization';

export type ViewerMode =
  | 'Orbit'
  | 'Walkthrough'
  | 'First-person'
  | 'Floor-plan'
  | 'Section'
  | 'Exploded'
  | 'Daylight'
  | 'Night'
  | 'Material'
  | 'BIM';

export type MeasuringMode = 'none' | 'distance' | 'area';

export interface SelectedElementInfo {
  id: string;
  type: 'wall' | 'room' | 'door' | 'window' | 'slab' | 'column' | 'furniture';
  name: string;
  level: number;
  properties: Record<string, any>;
}

interface BuildingState {
  model: BuildingModel;
  activeTab: ActiveTab;
  activeLevelIndex: number;
  selectedElementId: string | null;
  selectedElementInfo: SelectedElementInfo | null;
  complianceReport: ComplianceReport;
  paretoCandidates: ParetoCandidate[];
  selectedCandidateId: string | null;
  isOptimizing: boolean;
  sunHour: number;

  // Three.js Viewer State
  viewerMode: ViewerMode;
  measuringMode: MeasuringMode;
  measureResult: string | null;
  showStructural: boolean;
  showFurniture: boolean;
  visibleLevelFilter: number | 'all';
  sectionCutZ: number; // 0.0 to 30.0 ft
  explodedFactor: number; // 0.0 to 2.0

  // 17-Step Workflow State
  workflowStep: number;
  isWorkflowRunning: boolean;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setActiveLevelIndex: (lvl: number) => void;
  setSelectedElementId: (id: string | null) => void;
  setSelectedElementInfo: (info: SelectedElementInfo | null) => void;
  setSunHour: (hour: number) => void;
  setViewerMode: (mode: ViewerMode) => void;
  setMeasuringMode: (mode: MeasuringMode) => void;
  setMeasureResult: (res: string | null) => void;
  setShowStructural: (show: boolean) => void;
  setShowFurniture: (show: boolean) => void;
  setVisibleLevelFilter: (lvl: number | 'all') => void;
  setSectionCutZ: (z: number) => void;
  setExplodedFactor: (f: number) => void;
  setWorkflowStep: (step: number) => void;
  setIsWorkflowRunning: (running: boolean) => void;

  updateSiteBoundary: (width: number, length: number) => void;
  updateSetbacks: (setbacks: Partial<Setbacks>) => void;
  updateSiteSetbacks: (setbacks: Partial<Setbacks>) => void;
  updateSpaceArea: (spaceId: string, deltaSqft: number) => void;
  addSpace: (name: string, type: SpaceType, areaSqft: number, levelIndex: number) => void;
  applyNLDirective: (directive: string) => void;

  runOptimization: (populationSize?: number, generations?: number) => void;
  selectParetoCandidate: (candidateId: string) => void;
  recomputeAll: () => void;
}

export const useBuildingStore = create<BuildingState>((set, get) => {
  const initialModel = createDefaultBuildingModel();
  const initialCompliance = checkBuildingCompliance(initialModel);

  return {
    model: initialModel,
    activeTab: 'dashboard',
    activeLevelIndex: 0,
    selectedElementId: null,
    selectedElementInfo: null,
    complianceReport: initialCompliance,
    paretoCandidates: [],
    selectedCandidateId: null,
    isOptimizing: false,
    sunHour: 14,

    viewerMode: 'Orbit',
    measuringMode: 'none',
    measureResult: null,
    showStructural: true,
    showFurniture: true,
    visibleLevelFilter: 'all',
    sectionCutZ: 12.0,
    explodedFactor: 0.0,

    workflowStep: 0,
    isWorkflowRunning: false,

    setActiveTab: (tab) => set({ activeTab: tab }),
    setActiveLevelIndex: (lvl) => set({ activeLevelIndex: lvl }),
    setSelectedElementId: (id) => set({ selectedElementId: id }),
    setSelectedElementInfo: (info) => set({ selectedElementInfo: info }),
    setSunHour: (hour) => set({ sunHour: hour }),
    setViewerMode: (mode) => set({ viewerMode: mode }),
    setMeasuringMode: (mode) => set({ measuringMode: mode, measureResult: null }),
    setMeasureResult: (res) => set({ measureResult: res }),
    setShowStructural: (show) => set({ showStructural: show }),
    setShowFurniture: (show) => set({ showFurniture: show }),
    setVisibleLevelFilter: (lvl) => set({ visibleLevelFilter: lvl }),
    setSectionCutZ: (z) => set({ sectionCutZ: z }),
    setExplodedFactor: (f) => set({ explodedFactor: f }),
    setWorkflowStep: (step) => set({ workflowStep: step }),
    setIsWorkflowRunning: (running) => set({ isWorkflowRunning: running }),

    updateSiteBoundary: (width, length) => {
      const { model } = get();
      const updatedModel: BuildingModel = {
        ...model,
        site: {
          ...model.site,
          boundary: {
            ...model.site.boundary,
            width,
            length,
            total_area_sqft: width * length,
            vertices: [
              { x: 0, y: 0 },
              { x: width, y: 0 },
              { x: width, y: length },
              { x: 0, y: length },
            ],
          },
        },
      };

      const boq = calculateBuildingBOQ(updatedModel);
      updatedModel.metrics.cost_estimate = boq;
      const compliance = checkBuildingCompliance(updatedModel);

      set({ model: updatedModel, complianceReport: compliance });
    },

    updateSetbacks: (setbacks) => {
      const { model } = get();
      const updatedModel: BuildingModel = {
        ...model,
        site: {
          ...model.site,
          setbacks: {
            ...model.site.setbacks,
            ...setbacks,
          },
        },
      };

      const boq = calculateBuildingBOQ(updatedModel);
      updatedModel.metrics.cost_estimate = boq;
      const compliance = checkBuildingCompliance(updatedModel);

      set({ model: updatedModel, complianceReport: compliance });
    },

    updateSiteSetbacks: (setbacks) => {
      get().updateSetbacks(setbacks);
    },

    updateSpaceArea: (spaceId, deltaSqft) => {
      const { model } = get();
      const updatedSpaces = model.spaces.map((spc) => {
        if (spc.id === spaceId) {
          const newArea = Math.max(20, spc.area_sqft + deltaSqft);
          return { ...spc, area_sqft: newArea };
        }
        return spc;
      });

      const updatedModel: BuildingModel = {
        ...model,
        spaces: updatedSpaces,
      };

      const boq = calculateBuildingBOQ(updatedModel);
      updatedModel.metrics.cost_estimate = boq;
      const compliance = checkBuildingCompliance(updatedModel);

      set({ model: updatedModel, complianceReport: compliance });
    },

    addSpace: (name, type, areaSqft, levelIndex) => {
      const { model } = get();
      const newSpace: Space = {
        id: `spc_${Date.now()}`,
        name,
        type,
        level_index: levelIndex,
        area_sqft: areaSqft,
        polygon_2d: [
          { x: 4, y: 6 },
          { x: 14, y: 6 },
          { x: 14, y: 16 },
          { x: 4, y: 16 },
        ],
        ceiling_height_ft: 9.5,
        finishes: {
          flooring_material: 'Vitrified Tiles',
          wall_finish: 'Emulsion Paint',
          ceiling_finish: 'False Ceiling',
          skirting_height_inches: 4.0,
        },
        requires_ventilation: true,
        daylight_factor_target: 2.0,
        furniture_ids: [],
      };

      const updatedModel: BuildingModel = {
        ...model,
        spaces: [...model.spaces, newSpace],
      };

      const boq = calculateBuildingBOQ(updatedModel);
      updatedModel.metrics.cost_estimate = boq;
      const compliance = checkBuildingCompliance(updatedModel);

      set({ model: updatedModel, complianceReport: compliance });
    },

    applyNLDirective: (directive: string) => {
      const { model } = get();
      const updatedModel = { ...model };
      const dLower = directive.toLowerCase();

      if (dLower.includes('kitchen') && (dLower.includes('larger') || dLower.includes('increase') || dLower.includes('expand'))) {
        updatedModel.spaces = updatedModel.spaces.map((s) => {
          if (s.type === 'kitchen' || s.name.toLowerCase().includes('kitchen')) {
            return { ...s, area_sqft: s.area_sqft + 25 };
          }
          return s;
        });
      }

      if (dLower.includes('bedroom') && (dLower.includes('larger') || dLower.includes('increase'))) {
        updatedModel.spaces = updatedModel.spaces.map((s) => {
          if (s.type.includes('bedroom')) {
            return { ...s, area_sqft: s.area_sqft + 20 };
          }
          return s;
        });
      }

      const boq = calculateBuildingBOQ(updatedModel);
      updatedModel.metrics.cost_estimate = boq;
      const compliance = checkBuildingCompliance(updatedModel);

      set({ model: updatedModel, complianceReport: compliance });
    },

    runOptimization: (populationSize = 100, generations = 15) => {
      set({ isOptimizing: true });
      const { model } = get();

      setTimeout(() => {
        const res = runNSGA2Optimization(model, { populationSize, generations });
        const candidates = res.solutions;
        set({
          isOptimizing: false,
          paretoCandidates: candidates,
          selectedCandidateId: candidates[0]?.id || null,
        });
      }, 600);
    },

    selectParetoCandidate: (candidateId) => {
      const { paretoCandidates } = get();
      const candidate = paretoCandidates.find((c) => c.id === candidateId);
      if (candidate && candidate.model) {
        const boq = calculateBuildingBOQ(candidate.model);
        candidate.model.metrics.cost_estimate = boq;
        const compliance = checkBuildingCompliance(candidate.model);

        set({
          model: candidate.model,
          selectedCandidateId: candidateId,
          complianceReport: compliance,
        });
      }
    },

    recomputeAll: () => {
      const { model } = get();
      const boq = calculateBuildingBOQ(model);
      const compliance = checkBuildingCompliance(model);
      const updatedModel = { ...model };
      updatedModel.metrics.cost_estimate = boq;
      set({ model: updatedModel, complianceReport: compliance });
    },
  };
});
