'use client';

import React, { useState } from 'react';
import {
  CURATED_MESHY_ASSETS,
  MeshyAsset,
  createMeshyTextTo3DTask,
  MeshyTask,
} from '@/lib/api/meshyApi';
import {
  Box,
  Sparkles,
  Download,
  Plus,
  CheckCircle,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  Sliders,
  Maximize2,
} from 'lucide-react';

interface MeshyAssetStudioProps {
  onInjectAsset?: (asset: MeshyAsset) => void;
}

export const MeshyAssetStudio: React.FC<MeshyAssetStudioProps> = ({ onInjectAsset }) => {
  const [assets, setAssets] = useState<MeshyAsset[]>(CURATED_MESHY_ASSETS);
  const [prompt, setPrompt] = useState('Modern Scandinavian curved sofa with boucle fabric');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [generating, setGenerating] = useState(false);
  const [activeTask, setActiveTask] = useState<MeshyTask | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const categories = ['All', 'Seating', 'Tables', 'Beds', 'Lighting', 'Biophilic'];

  const filteredAssets =
    selectedCategory === 'All'
      ? assets
      : assets.filter((a) => a.category === selectedCategory);

  const handleGenerateTextTo3D = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const task = await createMeshyTextTo3DTask(prompt);
      setActiveTask(task);

      // Create new asset in catalog
      const newAsset: MeshyAsset = {
        id: task.id,
        name: prompt,
        category: 'Seating',
        dimensions: { widthFt: 6.0, depthFt: 3.0, heightFt: 2.8 },
        glbUrl: task.modelUrls?.glb || '',
        previewUrl: task.thumbnailUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80',
        polygonCount: 7800,
        source: 'Meshy AI Generated',
      };

      setAssets((prev) => [newAsset, ...prev]);
      setNotification(`Successfully generated 3D GLB model for "${prompt}"!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadGLB = (asset: MeshyAsset) => {
    const link = document.createElement('a');
    link.href = asset.glbUrl;
    link.download = `${asset.name.replace(/\s+/g, '_')}.glb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-200 space-y-6 shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-lg">
            <Box className="w-5 h-5" />
            <span>Meshy AI — 3D Asset & Furniture Generation Studio</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate production-ready GLB / USDZ 3D models via Meshy Text-to-3D and Image-to-3D APIs for your BIM interiors.
          </p>
        </div>

        <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
          Meshy API v2 Engine
        </span>
      </div>

      {/* Generator Prompt Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-400" /> Text-to-3D Generative Prompt
        </span>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Minimalist travertine coffee table with brass legs..."
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleGenerateTextTo3D}
            disabled={generating}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating 3D...' : 'Generate 3D GLB'}
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Asset Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden hover:border-purple-500/50 transition group flex flex-col justify-between"
          >
            <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
              <img
                src={asset.previewUrl}
                alt={asset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 left-2 text-[10px] font-bold bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-purple-300 border border-purple-500/20">
                {asset.category}
              </span>
              <span className="absolute top-2 right-2 text-[10px] font-mono bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-slate-400">
                {asset.polygonCount.toLocaleString()} Polys
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-bold text-slate-200 text-xs truncate">{asset.name}</h4>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Dimensions: {asset.dimensions.widthFt}ft × {asset.dimensions.depthFt}ft × {asset.dimensions.heightFt}ft
                </span>
              </div>

              <div className="flex gap-2 pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => handleDownloadGLB(asset)}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-[11px] rounded-xl border border-slate-700 transition flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" /> .GLB
                </button>
                {onInjectAsset && (
                  <button
                    onClick={() => {
                      onInjectAsset(asset);
                      setNotification(`Added "${asset.name}" to Active BIM Room!`);
                      setTimeout(() => setNotification(null), 3000);
                    }}
                    className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-bold text-[11px] rounded-xl border border-purple-500/40 transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Place
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
