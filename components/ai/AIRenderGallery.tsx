'use client';

import React, { useState } from 'react';
import { ArchitecturalStyle, CandidateDesign, SiteInformation } from '@/types/architecture';
import {
  generateAIConceptRender,
  getDefaultConceptRenderGallery,
  AIConceptRenderResult,
} from '@/lib/api/aiRenderApi';
import { generateBlenderScriptForDesign } from '@/lib/blender/blenderScriptGenerator';
import { MeshyAssetStudio } from './MeshyAssetStudio';
import {
  Sparkles,
  Download,
  RefreshCw,
  Eye,
  Camera,
  Sun,
  Layers,
  Box,
  AlertTriangle,
  Code,
  CheckCircle,
  FileCode,
  ShieldCheck,
} from 'lucide-react';

interface AIRenderGalleryProps {
  style: ArchitecturalStyle;
  floors: number;
  bedrooms: number;
  design?: CandidateDesign;
  site?: SiteInformation;
}

export const AIRenderGallery: React.FC<AIRenderGalleryProps> = ({
  style,
  floors,
  bedrooms,
  design,
  site,
}) => {
  const [renderMode, setRenderMode] = useState<'deterministic' | 'concept' | 'meshy_3d'>('deterministic');

  // Deterministic Blender State
  const [blenderPerspective, setBlenderPerspective] = useState<'street_eye' | 'golden_sunset' | 'aerial_drone' | 'isometric'>('street_eye');
  const [showBlenderCode, setShowBlenderCode] = useState(false);

  // Concept Render State
  const [conceptRenders, setConceptRenders] = useState<AIConceptRenderResult[]>(() =>
    getDefaultConceptRenderGallery(style)
  );
  const [selectedPerspective, setSelectedPerspective] = useState<'exterior_facade' | 'aerial_drone' | 'interior_moodboard' | 'terrace_sunset'>('exterior_facade');
  const [selectedTime, setSelectedTime] = useState<'golden_hour' | 'bright_daylight' | 'twilight_dusk' | 'night_illuminated'>('golden_hour');
  const [isGeneratingConcept, setIsGeneratingConcept] = useState<boolean>(false);

  const handleGenerateConcept = () => {
    setIsGeneratingConcept(true);
    setTimeout(() => {
      const newRender = generateAIConceptRender({
        style,
        floors,
        bedrooms,
        timeOfDay: selectedTime,
        perspective: selectedPerspective,
      });

      setConceptRenders((prev) => [newRender, ...prev]);
      setIsGeneratingConcept(false);
    }, 600);
  };

  const handleDownloadBlenderScript = () => {
    if (!design || !site) return;
    const script = generateBlenderScriptForDesign(design, site);
    const blob = new Blob([script], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ArchAI_${design.id}_Blender_Cycles.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const blenderScriptCode = design && site ? generateBlenderScriptForDesign(design, site) : '';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Architectural Rendering & 3D Asset Studio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Two distinct rendering pipelines: Deterministic Geometry (Blender Cycles) vs AI Concept Exploration.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setRenderMode('deterministic')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              renderMode === 'deterministic'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Deterministic Render (Blender Cycles)
          </button>
          <button
            onClick={() => setRenderMode('concept')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              renderMode === 'concept'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Concept Styling
          </button>
          <button
            onClick={() => setRenderMode('meshy_3d')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              renderMode === 'meshy_3d'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" /> Meshy 3D Assets
          </button>
        </div>
      </div>

      {/* SYSTEM A: DETERMINISTIC GEOMETRY RENDER (BLENDER CYCLES / EEVEE) */}
      {renderMode === 'deterministic' && (
        <div className="space-y-5">
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm">Deterministic Geometry Pipeline:</strong>
              This render is derived 100% from your exact floor plan coordinates, wall thicknesses, window cutouts, RCC columns, and rooftop solar arrays. Zero synthetic hallucinations.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Viewpoint Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 text-xs block">Architectural Camera Perspective</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                {[
                  { id: 'street_eye', label: 'Street Eye-Level (1.65m)' },
                  { id: 'golden_sunset', label: 'Sunset Golden Hour' },
                  { id: 'aerial_drone', label: 'Aerial Drone Axonometric' },
                  { id: 'isometric', label: 'Isometric Cutaway' },
                ].map((vp) => (
                  <button
                    key={vp.id}
                    onClick={() => setBlenderPerspective(vp.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      blenderPerspective === vp.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {vp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Blender Python Script Downloader */}
            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-sky-400 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4" /> Headless Blender Python Script
                  </span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-2 py-0.5 rounded">
                    blender -b -P
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Generates an executable Python script configuring Cycles Path Tracing (128 samples), Nishita Sky, PBR Stucco/Glass, and exact BIM geometry.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowBlenderCode(!showBlenderCode)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1"
                >
                  <Code className="w-3.5 h-3.5" /> {showBlenderCode ? 'Hide Code' : 'Inspect Code'}
                </button>
                <button
                  onClick={handleDownloadBlenderScript}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download render_cycles.py
                </button>
              </div>
            </div>

          </div>

          {/* Script Code Viewer */}
          {showBlenderCode && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 block font-mono text-[11px]">
                render_building_cycles.py (Executable in Blender 3.6 / 4.x)
              </span>
              <pre className="bg-black/90 p-3 rounded-xl font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-60 overflow-y-auto">
                {blenderScriptCode}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SYSTEM B: AI CONCEPT VISUALIZATION (MOODBOARDS & STYLE) */}
      {renderMode === 'concept' && (
        <div className="space-y-5">
          {/* Prominent Caution Alert */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">⚠️ CONCEPT VISUALIZATION (Non-Authoritative):</strong>
              These images are AI-generated for stylistic moodboard exploration, material palettes, and facade concepts. They do not represent authoritative construction geometry.
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-600" /> Concept Perspective
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['exterior_facade', 'aerial_drone', 'interior_moodboard', 'terrace_sunset'] as const).map((persp) => (
                  <button
                    key={persp}
                    onClick={() => setSelectedPerspective(persp)}
                    className={`py-2 px-3 rounded-xl capitalize font-semibold transition border ${
                      selectedPerspective === persp
                        ? 'bg-amber-600 text-white border-amber-600 shadow'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {persp.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" /> Lighting Mood
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['golden_hour', 'bright_daylight', 'twilight_dusk', 'night_illuminated'] as const).map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-xl capitalize font-semibold transition border ${
                      selectedTime === time
                        ? 'bg-amber-600 text-white border-amber-600 shadow'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {time.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateConcept}
              disabled={isGeneratingConcept}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingConcept ? 'animate-spin' : ''}`} />
              <span>{isGeneratingConcept ? 'Generating AI Concept...' : 'Generate New Concept Render'}</span>
            </button>
          </div>

          {/* Render Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conceptRenders.map((render) => (
              <div
                key={render.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg group relative flex flex-col justify-between"
              >
                <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={render.imageUrl}
                    alt={render.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-extrabold text-white flex items-center gap-1 shadow">
                    <AlertTriangle className="w-3 h-3" /> Concept Visualization
                  </div>
                </div>
                <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-200 block capitalize">
                    {render.style} • {render.perspective.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 italic block">
                    {render.disclaimer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SYSTEM C: MESHY AI 3D ASSET STUDIO */}
      {renderMode === 'meshy_3d' && (
        <MeshyAssetStudio />
      )}

    </div>
  );
};
