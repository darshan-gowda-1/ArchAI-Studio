'use client';

import React, { useState } from 'react';
import { Point2D, SiteInformation } from '@/types/architecture';
import { executePlotVisionPipeline, SiteVisionResult } from '@/lib/vision/plotVisionPipeline';
import {
  Camera,
  Upload,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  Maximize2,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface PlotImageVisionModalProps {
  onApplySiteGeometry: (newSite: Partial<SiteInformation>) => void;
  onClose: () => void;
}

const SAMPLE_PLOT_IMAGES = [
  {
    id: 'sample_satellite',
    name: 'Satellite Survey Map',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
    description: 'Orthogonal top-down aerial view of rectangular greenfield plot.',
  },
  {
    id: 'sample_corner',
    name: 'Corner Plot Drone Capture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    description: 'Angled drone photograph with dual-road corner access.',
  },
  {
    id: 'sample_survey_sketch',
    name: 'CAD Survey Document',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    description: 'Site boundary dimension sketch with north orientation marker.',
  },
];

export const PlotImageVisionModal: React.FC<PlotImageVisionModalProps> = ({
  onApplySiteGeometry,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_PLOT_IMAGES[0].url);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [visionResult, setVisionResult] = useState<SiteVisionResult | null>(null);

  // Human Verification Inputs
  const [confirmedLength, setConfirmedLength] = useState<number>(45);
  const [confirmedWidth, setConfirmedWidth] = useState<number>(32);
  const [confirmedRoadWidth, setConfirmedRoadWidth] = useState<number>(30);
  const [confirmedOrientation, setConfirmedOrientation] = useState<'North' | 'South' | 'East' | 'West'>('South');

  const handleRunPipeline = async (imgUrl = selectedImage, dimensions?: { lengthFt: number; widthFt: number; roadWidthFt: number }) => {
    setAnalyzing(true);
    try {
      const result = await executePlotVisionPipeline(imgUrl, dimensions);
      setVisionResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyToStudio = () => {
    if (!visionResult) return;
    onApplySiteGeometry({
      length: confirmedLength,
      width: confirmedWidth,
      roadWidth: confirmedRoadWidth,
      orientation: confirmedOrientation,
      shape: 'rectangular',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 text-slate-200 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-sky-400 font-bold text-lg">
            <Camera className="w-5 h-5" />
            <span>7-Stage Plot Vision & Polygon Extraction Pipeline</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-medium px-2.5 py-1 rounded-lg bg-slate-800"
          >
            ✕ Close
          </button>
        </div>

        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
          
          {/* Sample Image Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300">1. Select Plot Survey Image / Drone Photo:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_PLOT_IMAGES.map((img) => (
                <div
                  key={img.id}
                  onClick={() => {
                    setSelectedImage(img.url);
                    setVisionResult(null);
                  }}
                  className={`p-2.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedImage === img.url
                      ? 'bg-slate-800 border-sky-500 shadow-md shadow-sky-500/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={img.url} alt={img.name} className="h-24 w-full object-cover rounded-xl mb-2" />
                  <div>
                    <span className="font-bold text-slate-200 text-xs block">{img.name}</span>
                    <span className="text-[10px] text-slate-400 block">{img.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Button */}
          <div className="flex justify-center">
            <button
              onClick={() => handleRunPipeline(selectedImage)}
              disabled={analyzing}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-sky-500/30 transition flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'Running 7-Stage Vision Pipeline...' : 'Run 7-Stage Computer Vision Pipeline'}</span>
            </button>
          </div>

          {/* Vision Pipeline Stages Progress */}
          {visionResult && (
            <div className="space-y-4 pt-2">
              
              {/* Stages List */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-400" /> Pipeline Execution Audit
                  </span>
                  <span className="text-[11px] font-mono bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded">
                    Overall Confidence: {(visionResult.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {visionResult.stages.map((st) => (
                    <div key={st.stage} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-2">
                        {st.status === 'completed' ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="font-bold text-slate-200 text-[11px]">
                          Stage {st.stage}: {st.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 pl-5">{st.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Dimension Confidence Warning */}
              {visionResult.dimensionConfidence === 'LOW' && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="font-bold block text-sm">Dimension Confidence: LOW</strong>
                    <p className="text-[11px] text-amber-200/90">
                      Photographs and perspective survey sketches lack absolute physical scale bars. Please verify or input the exact measured plot dimensions below. ArchAI will never silently hallucinate construction dimensions.
                    </p>
                  </div>
                </div>
              )}

              {/* Human Scale Verification & Dimensions Form (Stage 6) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Stage 6: Human Scale Verification & Dimension Confirmation
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Verified Length (ft)</span>
                    <input
                      type="number"
                      value={confirmedLength}
                      onChange={(e) => setConfirmedLength(+e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Verified Width (ft)</span>
                    <input
                      type="number"
                      value={confirmedWidth}
                      onChange={(e) => setConfirmedWidth(+e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Road Width (ft)</span>
                    <input
                      type="number"
                      value={confirmedRoadWidth}
                      onChange={(e) => setConfirmedRoadWidth(+e.target.value)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Road Orientation</span>
                    <select
                      value={confirmedOrientation}
                      onChange={(e) => setConfirmedOrientation(e.target.value as any)}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-sky-500"
                    >
                      <option value="North">North Facing</option>
                      <option value="South">South Facing</option>
                      <option value="East">East Facing</option>
                      <option value="West">West Facing</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() =>
                      handleRunPipeline(selectedImage, {
                        lengthFt: confirmedLength,
                        widthFt: confirmedWidth,
                        roadWidthFt: confirmedRoadWidth,
                      })
                    }
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-xl border border-slate-700 transition"
                  >
                    Recalibrate with Verified Dimensions
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyToStudio}
            disabled={!visionResult}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
          >
            <span>Apply Reconstructed Geometry to Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
