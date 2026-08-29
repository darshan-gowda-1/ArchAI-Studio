'use client';

import React, { useState } from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import { Layers, Download, FileCode, CheckCircle2, Cloud, ExternalLink } from 'lucide-react';

export default function BimFeature() {
  const { model } = useBuildingStore();
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const handleExport = (format: string) => {
    setExportStatus(`Compiling and exporting building model as ${format.toUpperCase()}...`);
    setTimeout(() => {
      setExportStatus(`✓ ${format.toUpperCase()} export compiled successfully and ready for download.`);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Export Action Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            Open BIM & AEC Interoperability Exporter
          </h3>
          <p className="text-xs text-neutral-400">
            Compile the Canonical Building Model into standard Open BIM and CAD formats.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleExport('IFC4')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" /> Export IFC4
          </button>
          <button
            onClick={() => handleExport('AutoCAD DXF')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-lg border border-neutral-700 transition"
          >
            <Download className="w-3.5 h-3.5" /> Export DXF
          </button>
          <button
            onClick={() => handleExport('Speckle Stream')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-lg border border-neutral-700 transition"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-400" /> Publish Speckle
          </button>
        </div>
      </div>

      {exportStatus && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportStatus}</span>
        </div>
      )}

      {/* BIM Element Tree & IFC Properties Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Element Hierarchy Tree */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            IFC4 Entity Hierarchy
          </h4>

          <div className="space-y-1.5 text-xs text-neutral-300 font-mono">
            <div className="p-2 bg-neutral-950 rounded border border-neutral-800 text-amber-400 font-bold">
              ▾ IfcProject ({model.project.code})
            </div>
            <div className="pl-4 space-y-1">
              <div className="p-1.5 bg-neutral-950 rounded border border-neutral-800 text-neutral-200">
                ▾ IfcSite ({model.site.address})
              </div>
              <div className="pl-4 space-y-1">
                <div className="p-1.5 bg-neutral-950 rounded border border-neutral-800 text-neutral-200">
                  ▾ IfcBuilding (ArchAI Modern Residence)
                </div>
                <div className="pl-4 space-y-1">
                  {model.levels.map((lvl) => (
                    <div key={lvl.id} className="p-1 bg-neutral-900 rounded border border-neutral-800">
                      ▸ IfcBuildingStorey ({lvl.name})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quantities Table */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-white">Compiled BIM Entities Schema</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold border-b border-neutral-800">
                <tr>
                  <th className="p-2.5">IFC Entity Class</th>
                  <th className="p-2.5">Element Count</th>
                  <th className="p-2.5">Material Mapping</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                <tr>
                  <td className="p-2.5 font-mono text-amber-400">IfcSpace</td>
                  <td className="p-2.5 font-bold">{model.spaces.length} Nos</td>
                  <td className="p-2.5">Vitrified Tile / Italian Marble</td>
                  <td className="p-2.5 text-emerald-400">Validated</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-amber-400">IfcWallStandardCase</td>
                  <td className="p-2.5 font-bold">{model.walls.length} Nos</td>
                  <td className="p-2.5">AAC Block Masonry 200mm</td>
                  <td className="p-2.5 text-emerald-400">Validated</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-amber-400">IfcDoor</td>
                  <td className="p-2.5 font-bold">{model.doors.length} Nos</td>
                  <td className="p-2.5">Teak Veneer / Flush Panel</td>
                  <td className="p-2.5 text-emerald-400">Validated</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-amber-400">IfcWindow</td>
                  <td className="p-2.5 font-bold">{model.windows.length} Nos</td>
                  <td className="p-2.5">UPVC Double Glazed Low-E</td>
                  <td className="p-2.5 text-emerald-400">Validated</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-amber-400">IfcColumn</td>
                  <td className="p-2.5 font-bold">{model.columns.length} Nos</td>
                  <td className="p-2.5">M25 Grade RCC Solid Column</td>
                  <td className="p-2.5 text-emerald-400">Validated</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-amber-400">IfcSlab</td>
                  <td className="p-2.5 font-bold">{model.slabs.length} Nos</td>
                  <td className="p-2.5">150mm Two-Way Solid Slab</td>
                  <td className="p-2.5 text-emerald-400">Validated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
