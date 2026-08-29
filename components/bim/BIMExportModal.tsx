'use client';

import React, { useState } from 'react';
import { CandidateDesign, SiteInformation, BuildingRequirements } from '@/types/architecture';
import { generateIFCFileContent } from '@/lib/bim/ifcCompiler';
import { generateDXFFileContent } from '@/lib/bim/dxfCompiler';
import { generateSVGFileContent } from '@/lib/bim/svgCompiler';
import { generateGLTFFileContent } from '@/lib/bim/gltfCompiler';
import { compileDesignToCanonicalBIM } from '@/lib/bim/canonicalModel';
import {
  Download,
  FileCode,
  Layers,
  Box,
  FileText,
  CheckCircle,
  Share2,
  Cloud,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface BIMExportModalProps {
  design: CandidateDesign;
  site: SiteInformation;
  requirements: BuildingRequirements;
  onClose: () => void;
}

export const BIMExportModal: React.FC<BIMExportModalProps> = ({
  design,
  site,
  requirements,
  onClose,
}) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadFile = (filename: string, content: string, contentType: string) => {
    setDownloading(filename);
    try {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  const handleDownloadIFC = () => {
    const ifcContent = generateIFCFileContent(design, site);
    downloadFile(`ArchAI_${design.id}_IFC4.ifc`, ifcContent, 'application/x-step');
  };

  const handleDownloadDXF = () => {
    const dxfContent = generateDXFFileContent(design, site);
    downloadFile(`ArchAI_${design.id}_AutoCAD.dxf`, dxfContent, 'application/dxf');
  };

  const handleDownloadSVG = () => {
    const svgContent = generateSVGFileContent(design, site);
    downloadFile(`ArchAI_${design.id}_FloorPlan.svg`, svgContent, 'image/svg+xml');
  };

  const handleDownloadGLTF = () => {
    const gltfContent = generateGLTFFileContent(design, site);
    downloadFile(`ArchAI_${design.id}_3D.gltf`, gltfContent, 'model/gltf+json');
  };

  const handleDownloadBIMJSON = () => {
    const bimObj = compileDesignToCanonicalBIM(design, site);
    downloadFile(`ArchAI_${design.id}_BIM_Graph.json`, JSON.stringify(bimObj, null, 2), 'application/json');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 text-slate-200 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-lg">
            <Box className="w-5 h-5" />
            <span>BIM & CAD Interoperability Export Hub</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-medium px-2 py-1 rounded bg-slate-800"
          >
            ✕ Close
          </button>
        </div>

        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
          <p className="text-xs text-slate-400">
            Export the canonical architectural building graph into industry-standard open BIM, CAD, and 3D formats compatible with professional AEC software workflows.
          </p>

          {/* Export Formats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* IFC 4 / IFC2X3 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex justify-between items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-sm">IFC4 / IFC2x3 Model</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded font-mono">.ifc</span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Revit, Archicad, BlenderBIM, FreeCAD & Solibri native STEP standard.
                </span>
              </div>
              <button
                onClick={handleDownloadIFC}
                disabled={downloading !== null}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-blue-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading?.includes('.ifc') ? 'Exporting...' : 'Download'}
              </button>
            </div>

            {/* AutoCAD DXF */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex justify-between items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-sm">AutoCAD Layered DXF</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded font-mono">.dxf</span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  AutoCAD R12/2000 multi-layer drawings with walls, columns, tags & dims.
                </span>
              </div>
              <button
                onClick={handleDownloadDXF}
                disabled={downloading !== null}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-amber-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading?.includes('.dxf') ? 'Exporting...' : 'Download'}
              </button>
            </div>

            {/* Scalable Vector SVG */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex justify-between items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-sm">Vector CAD Blueprint</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded font-mono">.svg</span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Lossless scalable vector graphic with architectural title block.
                </span>
              </div>
              <button
                onClick={handleDownloadSVG}
                disabled={downloading !== null}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading?.includes('.svg') ? 'Exporting...' : 'Download'}
              </button>
            </div>

            {/* 3D GLTF 2.0 */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex justify-between items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-sm">GLTF 2.0 3D Scene</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded font-mono">.gltf</span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  3D mesh with materials for Blender, Rhino, Unreal Engine & Speckle.
                </span>
              </div>
              <button
                onClick={handleDownloadGLTF}
                disabled={downloading !== null}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-purple-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading?.includes('.gltf') ? 'Exporting...' : 'Download'}
              </button>
            </div>

            {/* Canonical BIM JSON Graph */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex justify-between items-center gap-3 md:col-span-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-sm">Canonical BIM Graph Schema</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono">.json</span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Full object hierarchy: Levels, Spaces, Walls, Slabs, Columns, Beams, Openings, Materials & Relationships.
                </span>
              </div>
              <button
                onClick={handleDownloadBIMJSON}
                disabled={downloading !== null}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-indigo-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading?.includes('.json') ? 'Exporting...' : 'Download JSON'}
              </button>
            </div>
          </div>

          {/* Cloud BIM Interoperability Stream Banner */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-sky-400">
                <Cloud className="w-4 h-4" />
                <span>Enterprise Cloud BIM Interoperability (APS & Speckle)</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  Autodesk Platform Services (APS) <ExternalLink className="w-3 h-3 text-slate-500" />
                </span>
                <p className="text-[11px] text-slate-400">
                  Model Derivative API, Revit Design Automation, and AEC Data Model GraphQL endpoint integration.
                </p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  Speckle AEC Stream <ExternalLink className="w-3 h-3 text-slate-500" />
                </span>
                <p className="text-[11px] text-slate-400">
                  Real-time BIM streams for Rhino Grasshopper, Revit, Archicad, and PowerBI structural analytics.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-slate-800 pt-4">
          <span className="text-[11px] text-slate-400 font-mono">Canonical Schema: IFC4 / Speckle 2.0</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
