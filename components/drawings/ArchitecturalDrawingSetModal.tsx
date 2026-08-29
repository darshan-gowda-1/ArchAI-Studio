'use client';

import React, { useState } from 'react';
import { CandidateDesign, SiteInformation, BuildingRequirements } from '@/types/architecture';
import {
  generateArchitecturalDrawingSet,
  ArchitecturalDrawingSet,
  ArchitecturalSheet,
} from '@/lib/drawings/architecturalDrawingSet';
import { compileDesignToCanonicalBIM } from '@/lib/bim/canonicalModel';
import { exportToIFC } from '@/lib/bim/ifcCompiler';
import { exportToDXF } from '@/lib/bim/dxfCompiler';
import {
  FileText,
  Download,
  Printer,
  Maximize2,
  CheckCircle2,
  Table,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface ArchitecturalDrawingSetModalProps {
  design: CandidateDesign;
  site: SiteInformation;
  requirements: BuildingRequirements;
  onClose: () => void;
}

export const ArchitecturalDrawingSetModal: React.FC<ArchitecturalDrawingSetModalProps> = ({
  design,
  site,
  requirements,
  onClose,
}) => {
  const drawingSet = generateArchitecturalDrawingSet(design, site, requirements);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'sheets' | 'schedules' | 'area_statement'>('sheets');

  const selectedSheet = drawingSet.sheets[selectedSheetIndex] || drawingSet.sheets[0];

  const handleDownloadDXF = () => {
    const bim = compileDesignToCanonicalBIM(design, site);
    const dxf = exportToDXF(bim);
    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ArchAI_Drawing_Set_${design.id}.dxf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadIFC = () => {
    const bim = compileDesignToCanonicalBIM(design, site);
    const ifc = exportToIFC(bim);
    const blob = new Blob([ifc], { type: 'application/x-step' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ArchAI_BIM_Model_${design.id}.ifc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSVG = () => {
    const blob = new Blob([selectedSheet.svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSheet.sheetNumber}_${selectedSheet.sheetTitle.replace(/\s+/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full p-6 text-slate-200 shadow-2xl space-y-5">
        
        {/* Header Bar */}
        <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center gap-2.5 text-sky-400 font-bold text-lg">
            <FileText className="w-5 h-5" />
            <span>Professional Architectural Construction Drawing Set</span>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSVG}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> SVG Sheet
            </button>
            <button
              onClick={handleDownloadDXF}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> AutoCAD DXF
            </button>
            <button
              onClick={handleDownloadIFC}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Open BIM IFC
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'sheets' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Architectural Sheets ({drawingSet.sheets.length})
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'schedules' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Door & Window Schedules
          </button>
          <button
            onClick={() => setActiveTab('area_statement')}
            className={`px-4 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'area_statement' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Statutory Area Statement & FAR
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[62vh] overflow-y-auto pr-1">
          
          {/* TAB 1: SHEETS VIEWER */}
          {activeTab === 'sheets' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Sheets Selector Sidebar */}
              <div className="space-y-2">
                <span className="font-bold text-slate-400 text-xs block">Drawing Index:</span>
                {drawingSet.sheets.map((sh, idx) => (
                  <button
                    key={sh.sheetNumber}
                    onClick={() => setSelectedSheetIndex(idx)}
                    className={`w-full p-3 rounded-2xl border text-left text-xs transition space-y-1 block ${
                      selectedSheetIndex === idx
                        ? 'bg-sky-950/40 border-sky-500/50 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center font-extrabold font-mono text-[11px]">
                      <span>{sh.sheetNumber}</span>
                      <span className="text-[9px] text-slate-500">{sh.scale}</span>
                    </div>
                    <p className="font-semibold text-slate-200 text-[11px] line-clamp-1">{sh.sheetTitle}</p>
                  </button>
                ))}
              </div>

              {/* Sheet Canvas Preview Viewport */}
              <div className="md:col-span-3 bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-inner flex flex-col justify-center items-center">
                <div
                  className="w-full max-w-[760px] h-[380px] rounded-xl overflow-hidden shadow-2xl bg-white"
                  dangerouslySetInnerHTML={{ __html: selectedSheet.svgContent }}
                />
                <div className="flex justify-between items-center w-full max-w-[760px] pt-3 text-xs text-slate-400 font-mono">
                  <span>{selectedSheet.sheetNumber} — {selectedSheet.sheetTitle}</span>
                  <span>Scale {selectedSheet.scale}</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DOOR & WINDOW SCHEDULES */}
          {activeTab === 'schedules' && (
            <div className="space-y-5 text-xs">
              
              {/* Door Schedule Table */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  🚪 Door Schedule (Joinery & Hardware Specification)
                </span>
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Tag</th>
                      <th className="p-2.5">Room Served</th>
                      <th className="p-2.5">Width × Height</th>
                      <th className="p-2.5">Lintel Level</th>
                      <th className="p-2.5">Material Specification</th>
                      <th className="p-2.5 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono text-[11px]">
                    {drawingSet.doorSchedule.map((d) => (
                      <tr key={d.tag} className="hover:bg-slate-900/50">
                        <td className="p-2.5 font-bold text-amber-400">{d.tag}</td>
                        <td className="p-2.5 text-slate-200">{d.roomServed}</td>
                        <td className="p-2.5">{d.widthFt}'-0" × {d.heightFt}'-0"</td>
                        <td className="p-2.5">+{d.lintelHeightFt}'</td>
                        <td className="p-2.5 text-slate-400">{d.material}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">{d.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Window Schedule Table */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  🪟 Window & Glazing Schedule (Glazing & Sill Specification)
                </span>
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Tag</th>
                      <th className="p-2.5">Room Served</th>
                      <th className="p-2.5">Width × Height</th>
                      <th className="p-2.5">Sill Level</th>
                      <th className="p-2.5">Lintel Level</th>
                      <th className="p-2.5">Glazing Specification</th>
                      <th className="p-2.5 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono text-[11px]">
                    {drawingSet.windowSchedule.map((w) => (
                      <tr key={w.tag} className="hover:bg-slate-900/50">
                        <td className="p-2.5 font-bold text-sky-400">{w.tag}</td>
                        <td className="p-2.5 text-slate-200">{w.roomServed}</td>
                        <td className="p-2.5">{w.widthFt}'-0" × {w.heightFt}'-0"</td>
                        <td className="p-2.5">+{w.sillHeightFt}'</td>
                        <td className="p-2.5">+{w.lintelHeightFt}'</td>
                        <td className="p-2.5 text-slate-400">{w.glazingType}</td>
                        <td className="p-2.5 text-right font-bold text-emerald-400">{w.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: STATUTORY AREA STATEMENT */}
          {activeTab === 'area_statement' && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <span className="font-bold text-slate-200 text-sm block">
                Statutory Municipal Area Statement & FAR Clearance
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Gross Plot Area</span>
                  <span className="font-extrabold text-slate-200 text-base font-mono">{drawingSet.areaStatement.plotAreaSqFt} sq ft</span>
                  <span className="text-[10px] text-slate-500 block">{site.length}ft × {site.width}ft Plot</span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Ground Coverage</span>
                  <span className="font-extrabold text-emerald-400 text-base font-mono">{drawingSet.areaStatement.groundCoverageSqFt} sq ft</span>
                  <span className="text-[10px] text-slate-500 block">{drawingSet.areaStatement.groundCoveragePercent}% of Plot (&lt; 60% Max)</span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Total Carpet Area</span>
                  <span className="font-extrabold text-sky-400 text-base font-mono">{drawingSet.areaStatement.totalCarpetAreaSqFt} sq ft</span>
                  <span className="text-[10px] text-slate-500 block">RERA Net Usable Area</span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Floor Area Ratio (FAR)</span>
                  <span className="font-extrabold text-indigo-400 text-base font-mono">{drawingSet.areaStatement.achievedFar} Achieved</span>
                  <span className="text-[10px] text-slate-500 block">Permissible Max: {drawingSet.areaStatement.permissibleFar}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
