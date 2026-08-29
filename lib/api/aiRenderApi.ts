import { ArchitecturalStyle } from '@/types/architecture';

export interface AIConceptRenderRequest {
  style: ArchitecturalStyle;
  floors: number;
  bedrooms: number;
  timeOfDay: 'golden_hour' | 'bright_daylight' | 'twilight_dusk' | 'night_illuminated';
  perspective: 'exterior_facade' | 'aerial_drone' | 'interior_moodboard' | 'terrace_sunset';
  seed?: number;
}

export interface AIConceptRenderResult {
  id: string;
  imageUrl: string;
  prompt: string;
  style: ArchitecturalStyle;
  perspective: string;
  createdAt: string;
  isConceptVisualization: boolean;
  disclaimer: string;
}

/**
 * Generates AI Concept Visualizations (Facade Exploration, Material Moodboards, Landscaping Concepts)
 * Clearly labeled as NON-AUTHORITATIVE CONCEPT VISUALIZATION.
 */
export function generateAIConceptRender(req: AIConceptRenderRequest): AIConceptRenderResult {
  const seed = req.seed || Math.floor(Math.random() * 900000) + 100000;
  
  let perspectivePrompt = '';
  switch (req.perspective) {
    case 'exterior_facade':
      perspectivePrompt = 'front facade styling exploration, architectural concept render, textured concrete and warm timber louvers';
      break;
    case 'aerial_drone':
      perspectivePrompt = 'aerial massing concept with rooftop garden terrace, biophilic greenery, swimming pool';
      break;
    case 'interior_moodboard':
      perspectivePrompt = 'interior design material moodboard, travertine stone, white boucle fabrics, ambient cove lighting';
      break;
    case 'terrace_sunset':
      perspectivePrompt = 'rooftop pergola terrace moodboard with sunset panoramic skyline view, tempered glass railings';
      break;
  }

  let lightingPrompt = '';
  switch (req.timeOfDay) {
    case 'golden_hour':
      lightingPrompt = 'warm golden hour sun, soft directional sunlight, 8k resolution';
      break;
    case 'bright_daylight':
      lightingPrompt = 'bright architectural daylight, clear sky, octane render style';
      break;
    case 'twilight_dusk':
      lightingPrompt = 'blue hour twilight dusk with warm glowing interior lights';
      break;
    case 'night_illuminated':
      lightingPrompt = 'dramatic exterior night spotlighting on architectural facade';
      break;
  }

  const basePrompt = `Architectural concept visualization, ${req.floors}-story ${req.style} residence, ${perspectivePrompt}, ${lightingPrompt}, 8k UHD, architectural photography portfolio style`;
  const encodedPrompt = encodeURIComponent(basePrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${seed}&nologo=true&enhance=true`;

  return {
    id: `concept_${seed}`,
    imageUrl,
    prompt: basePrompt,
    style: req.style,
    perspective: req.perspective,
    createdAt: new Date().toLocaleTimeString(),
    isConceptVisualization: true,
    disclaimer: '⚠️ CONCEPT VISUALIZATION (Non-Authoritative) — Stylistic exploration only. Actual construction geometry is governed strictly by the Deterministic 3D BIM Model.',
  };
}

export function getDefaultConceptRenderGallery(style: ArchitecturalStyle = 'Modern Minimal'): AIConceptRenderResult[] {
  return [
    generateAIConceptRender({ style, floors: 2, bedrooms: 3, timeOfDay: 'golden_hour', perspective: 'exterior_facade', seed: 201 }),
    generateAIConceptRender({ style, floors: 2, bedrooms: 3, timeOfDay: 'bright_daylight', perspective: 'aerial_drone', seed: 202 }),
    generateAIConceptRender({ style, floors: 2, bedrooms: 3, timeOfDay: 'twilight_dusk', perspective: 'interior_moodboard', seed: 203 }),
    generateAIConceptRender({ style, floors: 2, bedrooms: 3, timeOfDay: 'night_illuminated', perspective: 'terrace_sunset', seed: 204 }),
  ];
}
