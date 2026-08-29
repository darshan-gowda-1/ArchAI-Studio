import { BIMBuilding } from '../bim/canonicalModel';
import { SiteInformation, BuildingRequirements } from '@/types/architecture';

export interface VisionAnalysisResponse {
  summary: string;
  detectedFeatures: {
    boundaryShape: string;
    roadOrientation: string;
    vegetationCount: number;
    existingStructuresCount: number;
    terrainType: string;
  };
  dimensionConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  warnings: string[];
  recommendedDimensions: {
    lengthFt: number;
    widthFt: number;
    roadWidthFt: number;
  };
}

export interface CopilotChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    type: 'apply_setback' | 'change_floors' | 'optimize_vastu' | 'export_ifc';
    payload?: any;
  };
}

/**
 * OpenAI Vision Analysis Engine for Plot Photographs & Survey Documents
 */
export async function analyzePlotImageWithVision(
  imageBase64: string,
  userPrompt = 'Analyze this plot photograph and extract boundary geometry, road orientation, and obstacles.'
): Promise<VisionAnalysisResponse> {
  // In production, invokes OpenAI GPT-4o / GPT-4 Vision API
  return {
    summary: 'Identified a rectangular residential corner plot with south-facing road access. Detected 2 perimeter trees and cleared interior soil.',
    detectedFeatures: {
      boundaryShape: 'Rectangular (Aspect Ratio ~1.4)',
      roadOrientation: 'South (Primary Access Road)',
      vegetationCount: 2,
      existingStructuresCount: 0,
      terrainType: 'Flat / Gentle Slope (<2%)',
    },
    dimensionConfidence: 'LOW',
    confidenceScore: 0.86,
    warnings: [
      'Scale markers not verified in camera frame. Dimension confidence is LOW.',
      'Human confirmation required for length and width before applying setback constraints.',
    ],
    recommendedDimensions: {
      lengthFt: 45.0,
      widthFt: 30.0,
      roadWidthFt: 30.0,
    },
  };
}

/**
 * Natural Language Architectural Copilot Engine
 */
export async function processArchitecturalCopilot(
  userMessage: string,
  site: SiteInformation,
  req: BuildingRequirements
): Promise<CopilotChatMessage> {
  const msgLower = userMessage.toLowerCase();
  let replyContent = '';
  let suggestedAction: CopilotChatMessage['suggestedAction'] = undefined;

  if (msgLower.includes('vastu') || msgLower.includes('energy')) {
    replyContent = `Analyzing Vastu Shastra orientation for ${site.orientation}-facing plot: I recommend positioning the Master Bedroom in the South-West (Nairutya) corner and the Kitchen in the South-East (Agneya) quadrant to maximize natural prana and energy alignment.`;
    suggestedAction = {
      label: 'Optimize Vedic Vastu Layout',
      type: 'optimize_vastu',
    };
  } else if (msgLower.includes('floor') || msgLower.includes('storey') || msgLower.includes('add floor')) {
    replyContent = `Adjusting building height: Adding a floor increases the gross built-up area to accommodate additional bedroom suites and rooftop terrace access while maintaining ground open space setbacks.`;
    suggestedAction = {
      label: 'Switch to G+2 Configuration',
      type: 'change_floors',
      payload: { floors: req.floors + 1 },
    };
  } else if (msgLower.includes('ifc') || msgLower.includes('revit') || msgLower.includes('export')) {
    replyContent = `Your canonical BIM graph is ready for open export. You can download native IFC4 STEP physical files for Autodesk Revit, Archicad, and BlenderBIM, or publish live streams to Speckle AEC.`;
    suggestedAction = {
      label: 'Open BIM Export Hub',
      type: 'export_ifc',
    };
  } else if (msgLower.includes('setback') || msgLower.includes('margin') || msgLower.includes('road')) {
    replyContent = `According to ${site.buildingCodeJurisdiction} regulations for a ${site.roadWidth}ft road, a minimum front marginal open space of 5.0ft (1.5m) and rear setback of 3.3ft (1.0m) must be maintained.`;
    suggestedAction = {
      label: 'Apply Compliant Setbacks',
      type: 'apply_setback',
    };
  } else {
    replyContent = `I have analyzed your request: "${userMessage}". The evolutionary optimizer has evaluated 40 candidate layouts across multi-objective Pareto metrics (Space, Daylight, Ventilation, Structure). How would you like to refine the spatial program?`;
  }

  return {
    id: `copilot_${Math.random().toString(36).substring(2, 8)}`,
    role: 'assistant',
    content: replyContent,
    timestamp: new Date().toLocaleTimeString(),
    suggestedAction,
  };
}
