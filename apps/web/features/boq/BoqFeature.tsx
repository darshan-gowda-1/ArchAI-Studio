'use client';

import React from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import { IndianRupee, FileSpreadsheet, PieChart, TrendingDown } from 'lucide-react';

export default function BoqFeature() {
  const { model } = useBuildingStore();
  const cost = model.metrics.cost_estimate;
  const items = cost.itemized_boq || [];

  return (
    <div className="space-y-6">
      {/* BOQ Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <span className="text-xs font-medium text-neutral-400 uppercase">Civil & Structural</span>
          <div className="text-xl font-bold text-white mt-2">
            ₹{((cost.civil_structural_total_inr || 1720000) / 100000).toFixed(2)} Lakh
          </div>
          <div className="text-xs text-neutral-500 mt-1">Foundation, Slabs, AAC Masonry</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <span className="text-xs font-medium text-neutral-400 uppercase">Finishes & Interiors</span>
          <div className="text-xl font-bold text-white mt-2">
            ₹{((cost.finishes_interior_total_inr || 1080000) / 100000).toFixed(2)} Lakh
          </div>
          <div className="text-xs text-neutral-500 mt-1">Italian Marble, Oak, Paint</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <span className="text-xs font-medium text-neutral-400 uppercase">MEP & Solar Systems</span>
          <div className="text-xl font-bold text-white mt-2">
            ₹{((cost.mep_total_inr || 520000) / 100000).toFixed(2)} Lakh
          </div>
          <div className="text-xs text-neutral-500 mt-1">Plumbing, Electrical, 9.2kW PV</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 border-l-4 border-l-emerald-500">
          <span className="text-xs font-medium text-neutral-400 uppercase">Grand Total Estimate</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            ₹{((cost.grand_total_inr || 3980000) / 100000).toFixed(2)} Lakh
          </div>
          <div className="text-xs text-neutral-400 mt-0.5">₹{cost.rate_per_sqft_inr || 2580} per sq ft</div>
        </div>
      </div>

      {/* Itemized BOQ Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            Itemized Bill of Quantities (QTO Takeoff)
          </h3>
          <span className="text-xs text-neutral-400">Schedule of Rates: Mumbai 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase font-semibold border-b border-neutral-800">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3">Unit</th>
                <th className="p-3 text-right">Unit Rate (INR)</th>
                <th className="p-3 text-right">Total Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-800/40 transition">
                    <td className="p-3 font-semibold text-amber-400">{item.category}</td>
                    <td className="p-3 text-white font-medium">{item.sub_item}</td>
                    <td className="p-3 text-right font-mono">{item.quantity.toLocaleString()}</td>
                    <td className="p-3 text-neutral-400">{item.unit}</td>
                    <td className="p-3 text-right font-mono">₹{item.unit_rate_inr.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-white">₹{item.total_amount_inr.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-neutral-500">
                    No itemized entries found. Run optimizer to compile fresh QTO.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
