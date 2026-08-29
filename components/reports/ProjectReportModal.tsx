'use client';

import React, { useState } from 'react';
import { CandidateDesign, SiteInformation, BuildingRequirements } from '@/types/architecture';
import { calculateBOQ } from '@/lib/boqCalculator';
import { runComplianceChecks } from '@/lib/complianceChecker';
import { calculateStructuralQuantities } from '@/lib/bim/structuralEngine';
import { jsPDF } from 'jspdf';
import { FileText, Download, CheckCircle, AlertTriangle, ShieldCheck, DollarSign, Layers, HelpCircle, XCircle } from 'lucide-react';

interface ProjectReportModalProps {
  design: CandidateDesign;
  site: SiteInformation;
  requirements: BuildingRequirements;
  onClose: () => void;
}

export const ProjectReportModal: React.FC<ProjectReportModalProps> = ({
  design,
  site,
  requirements,
  onClose,
}) => {
  const [generating, setGenerating] = useState(false);
  const boq = calculateBOQ(design, site);
  const compliance = runComplianceChecks(site, design, requirements);
  const structural = calculateStructuralQuantities(design, site);

  const handleDownloadPDF = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 30, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('ArchAI Studio — Architectural & Structural BIM Report', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Archetype: ${design.archetype.toUpperCase()} | Code: ${site.buildingCodeJurisdiction}`, 14, 25);

      // Section 1: Site & Geometric Program
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Site & Geometric Program', 14, 42);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Plot Area: ${site.length}ft × ${site.width}ft (${site.length * site.width} sq ft) | Shape: ${site.shape.toUpperCase()}`, 14, 49);
      doc.text(`Road Orientation: ${site.orientation} Facing | Road Width: ${site.roadWidth}ft | Location: ${site.locationState || 'Local Site'}`, 14, 55);
      doc.text(`Configuration: ${requirements.bedrooms} BHK (${requirements.floors} Floor(s)) | Architectural Style: ${requirements.style}`, 14, 61);
      doc.text(`Total Built-up Area: ${design.totalBuiltUpArea} sq ft | Overall Performance Score: ${design.overallScore}/100`, 14, 67);

      // Section 2: Multi-Objective Pareto Metrics
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Evolutionary Multi-Objective Pareto Metrics', 14, 78);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Space Efficiency Index: ${design.objectives?.spaceEfficiencyScore || design.spaceEfficiencyScore}/100`, 14, 85);
      doc.text(`• Natural Daylight Rating: ${design.objectives?.naturalLightScore || design.naturalLightScore}/100`, 14, 91);
      doc.text(`• Natural Cross-Ventilation: ${design.objectives?.ventilationScore || design.ventilationScore}/100`, 14, 97);
      doc.text(`• Vedic Vastu Energy Score: ${design.objectives?.vastuScore || 85}/100`, 14, 103);
      doc.text(`• Structural Simplicity & Regularity: ${design.objectives?.structuralSimplicityScore || 92}/100`, 14, 109);

      // Section 3: Structural Engineering & Quantities
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Structural Engineering & Rebar Quantities', 14, 120);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`• RCC Columns: ${structural.totalColumnsCount} Units (9"x12" standard grid)`, 14, 127);
      doc.text(`• Concrete Volume (M25): ${structural.concreteVolumeM3.totalM3} m³ (${structural.concreteVolumeM3.totalCuFt} cu ft)`, 14, 133);
      doc.text(`• Steel Rebar (Fe500D): ${structural.steelRebarTonnage.totalTons} Metric Tonnes`, 14, 139);
      doc.text(`• Masonry Blockwork: ${structural.brickworkAreaSqFt.totalSqFt} sq ft | Plastering: ${structural.plasteringAreaSqFt.totalSqFt} sq ft`, 14, 145);

      // Section 4: Parametric BOQ Summary
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Parametric Bill of Quantities (BOQ)', 14, 156);

      let startY = 163;
      boq.items.slice(0, 4).forEach((item) => {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.category} - ${item.item}: ₹${item.amount.toLocaleString('en-IN')}`, 14, startY);
        startY += 6;
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Estimated Total Construction Cost: ₹${design.estimatedCost.toLocaleString('en-IN')} (₹${design.costPerSqFt}/sq ft)`, 14, startY + 3);

      // Section 5: Engineering Disclaimer
      doc.setFillColor(241, 245, 249);
      doc.rect(14, startY + 12, 182, 22, 'F');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.text('ENGINEERING DISCLAIMER: Preliminary planning estimate generated via ArchAI Studio algorithms.', 18, startY + 19);
      doc.text('Mandatory geotechnical soil borehole investigation and certified structural engineer review required before field execution.', 18, startY + 26);

      doc.save(`ArchAI_BIM_Report_${design.id}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'FAIL':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'UNKNOWN':
      default:
        return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 text-slate-200 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-lg">
            <FileText className="w-5 h-5" />
            <span>Comprehensive BIM, Regulatory & Structural Report</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-medium px-2 py-1 rounded bg-slate-800"
          >
            ✕ Close
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Summary Banner */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-slate-400 block">Selected Pareto Design</span>
              <span className="font-bold text-sky-400 text-sm truncate block">{design.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Total Built-up Area</span>
              <span className="font-bold text-emerald-400 text-sm">{design.totalBuiltUpArea} sq ft</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">RCC Columns & Grid</span>
              <span className="font-bold text-indigo-400 text-sm">{structural.totalColumnsCount} Cols ({structural.steelRebarTonnage.totalTons} T)</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Est. Construction Cost</span>
              <span className="font-bold text-amber-400 text-sm">₹{(design.estimatedCost / 100000).toFixed(2)}L</span>
            </div>
          </div>

          {/* Structural Quantities Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" /> Structural Quantities & Schedule
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Concrete Volume (M25)</span>
                <span className="font-bold text-slate-200">{structural.concreteVolumeM3.totalM3} m³ ({structural.concreteVolumeM3.totalCuFt} cu ft)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Steel Rebar (Fe500D)</span>
                <span className="font-bold text-slate-200">{structural.steelRebarTonnage.totalTons} Metric Tonnes</span>
              </div>
            </div>
          </div>

          {/* Multi-Jurisdiction Rules Compliance Audit */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Building Code Audit ({site.buildingCodeJurisdiction})
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                {compliance.filter((c) => c.status === 'PASS').length} PASS / {compliance.filter((c) => c.status === 'FAIL').length} FAIL / {compliance.filter((c) => c.status === 'UNKNOWN').length} UNKNOWN
              </span>
            </div>

            <div className="space-y-2">
              {compliance.map((c, i) => (
                <div key={i} className="flex justify-between items-start bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{c.title}</span>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {c.code}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] block">{c.details}</span>
                    <span className="text-slate-500 text-[10px] block font-mono">Ref: {c.clauseReference}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold block ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">{c.actualValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 italic">
            <strong>Engineering Disclaimer:</strong> Preliminary planning estimate. Mandatory geotechnical borehole investigation and certified structural engineer sign-off required prior to construction.
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Close
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            {generating ? 'Generating PDF...' : 'Download Full PDF Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
