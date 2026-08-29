'use client';

import React from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

export default function ComplianceFeature() {
  const { complianceReport } = useBuildingStore();

  return (
    <div className="space-y-6">
      {/* Compliance Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">
              {complianceReport.jurisdiction} Verification Scorecard
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            Real-time statutory verification across zoning setbacks, room dimensions, natural light/ventilation, and accessibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-neutral-400">Overall Score</div>
            <div className="text-2xl font-extrabold text-amber-400">{complianceReport.complianceScorePercent}%</div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              complianceReport.overallStatus === 'COMPLIANT'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}
          >
            {complianceReport.overallStatus}
          </span>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold border-b border-neutral-800">
              <tr>
                <th className="p-3">Clause / Rule ID</th>
                <th className="p-3">Category</th>
                <th className="p-3">Requirement Description</th>
                <th className="p-3 text-center">Required</th>
                <th className="p-3 text-center">Actual Measured</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {complianceReport.checks.map((check, idx) => (
                <tr key={idx} className="hover:bg-neutral-800/40 transition">
                  <td className="p-3 font-mono font-bold text-amber-400">{check.ruleId}</td>
                  <td className="p-3 text-neutral-400">{check.category}</td>
                  <td className="p-3 text-white font-medium">{check.description}</td>
                  <td className="p-3 text-center font-mono">{check.requiredValue}</td>
                  <td className="p-3 text-center font-mono font-semibold text-white">{check.actualValue}</td>
                  <td className="p-3 text-center">
                    {check.status === 'PASS' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> PASS
                      </span>
                    ) : check.status === 'WARNING' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                        <AlertTriangle className="w-3 h-3" /> WARN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/20 text-red-300 font-bold">
                        <XCircle className="w-3 h-3" /> FAIL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
