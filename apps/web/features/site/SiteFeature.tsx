'use client';

import React from 'react';
import { useBuildingStore } from '../../stores/buildingStore';
import { Compass, Sun, MapPin, Layers, Ruler, ShieldAlert } from 'lucide-react';

export default function SiteFeature() {
  const { model, updateSiteSetbacks } = useBuildingStore();
  const site = model.site;
  const setbacks = site.setbacks;
  const solar = site.solar_data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Setback Controls & Cadastral Specs */}
      <div className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Ruler className="w-4 h-4 text-amber-400" />
            Statutory Setback Controls (Feet)
          </h3>
          <p className="text-xs text-neutral-400">
            Modifying setbacks recomputes the PostGIS buildable envelope and triggers instant NBC compliance verification.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs text-neutral-300 font-medium mb-1">
                <span>Front Setback (Road Facade)</span>
                <span className="text-amber-400 font-bold">{setbacks.front.toFixed(1)} ft</span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                step={0.5}
                value={setbacks.front}
                onChange={(e) => updateSiteSetbacks({ front: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 font-medium mb-1">
                <span>Rear Setback</span>
                <span className="text-amber-400 font-bold">{setbacks.rear.toFixed(1)} ft</span>
              </div>
              <input
                type="range"
                min={3}
                max={10}
                step={0.5}
                value={setbacks.rear}
                onChange={(e) => updateSiteSetbacks({ rear: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 font-medium mb-1">
                <span>Side Left Setback</span>
                <span className="text-amber-400 font-bold">{setbacks.side_left.toFixed(1)} ft</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                step={0.5}
                value={setbacks.side_left}
                onChange={(e) => updateSiteSetbacks({ side_left: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 font-medium mb-1">
                <span>Side Right Setback</span>
                <span className="text-amber-400 font-bold">{setbacks.side_right.toFixed(1)} ft</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                step={0.5}
                value={setbacks.side_right}
                onChange={(e) => updateSiteSetbacks({ side_right: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Site Details Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Cadastral Survey Parameters
          </h3>
          <div className="text-xs space-y-2 text-neutral-300">
            <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
              <span className="text-neutral-400">Total Plot Area</span>
              <span className="font-semibold">{site.boundary.total_area_sqft} sq ft ({site.boundary.width}′ × {site.boundary.length}′)</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
              <span className="text-neutral-400">Permissible FAR / FSI</span>
              <span className="font-semibold">{site.far_fsi.toFixed(2)} (Max: {site.boundary.total_area_sqft * site.far_fsi} sq ft)</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
              <span className="text-neutral-400">Max Ground Coverage</span>
              <span className="font-semibold">{site.ground_coverage_max_pct}% ({Math.round(site.boundary.total_area_sqft * 0.6)} sq ft)</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
              <span className="text-neutral-400">Climate Zone</span>
              <span className="font-semibold">{site.climate_zone}</span>
            </div>
            <div className="flex justify-between pb-0.5">
              <span className="text-neutral-400">Orientation / Primary Sun Facade</span>
              <span className="font-semibold text-amber-400">{site.facing_direction} (North: {site.north_angle_deg}°)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle & Right: 2D Interactive Plot Geometry Canvas & Google Solar Insights */}
      <div className="lg:col-span-2 space-y-6">
        {/* SVG Plot Geometry Viewer */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              PostGIS Cadastral Boundary & Buildable Footprint
            </h3>
            <span className="text-xs text-neutral-400">Scale: 1 ft = 8 px</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 flex justify-center items-center relative overflow-hidden min-h-[340px]">
            {/* Compass Rose */}
            <div className="absolute top-4 right-4 p-2 bg-neutral-900/80 border border-neutral-800 rounded-lg text-center text-xs font-bold text-amber-400">
              <div>▲ N</div>
              <div className="text-[10px] text-neutral-400">0°</div>
            </div>

            {/* SVG Plot */}
            <svg width="340" height="380" viewBox="-20 -20 280 360" className="drop-shadow-xl">
              {/* Grid Background */}
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#262626" strokeWidth="0.5" />
              </pattern>
              <rect x="-20" y="-20" width="280" height="360" fill="url(#grid)" />

              {/* Road Access at Bottom */}
              <rect x="-10" y="-15" width="260" height="10" fill="#333" stroke="#444" strokeWidth="1" />
              <text x="120" y="-8" fill="#888" fontSize="6" textAnchor="middle" fontWeight="bold">
                SOUTH ACCESS ROAD (30 FT R.O.W.)
              </text>

              {/* Cadastral Plot Boundary (30x40 ft -> 240x320 px) */}
              <polygon
                points="0,0 240,0 240,320 0,320"
                fill="rgba(245, 158, 11, 0.05)"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Buildable Envelope (Offset by setbacks) */}
              {(() => {
                const sx = 8; // scale
                const bx1 = setbacks.side_left * sx;
                const bx2 = (30 - setbacks.side_right) * sx;
                const by1 = setbacks.front * sx;
                const by2 = (40 - setbacks.rear) * sx;
                return (
                  <g>
                    <polygon
                      points={`${bx1},${by1} ${bx2},${by1} ${bx2},${by2} ${bx1},${by2}`}
                      fill="rgba(16, 185, 129, 0.15)"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                    <text x={(bx1 + bx2) / 2} y={(by1 + by2) / 2} fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold">
                      BUILDABLE FOOTPRINT
                    </text>
                    <text x={(bx1 + bx2) / 2} y={(by1 + by2) / 2 + 14} fill="#86efac" fontSize="7" textAnchor="middle">
                      {Math.round((30 - setbacks.side_left - setbacks.side_right) * (40 - setbacks.front - setbacks.rear))} sq ft
                    </text>
                  </g>
                );
              })()}

              {/* Dimensions Labels */}
              <text x="120" y="335" fill="#f59e0b" fontSize="8" textAnchor="middle">Width: 30 ft</text>
              <text x="252" y="160" fill="#f59e0b" fontSize="8" textAnchor="start">Length: 40 ft</text>
            </svg>
          </div>
        </div>

        {/* Google Solar Insights Card */}
        {solar && (
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/20 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-semibold text-white">Google Solar API Irradiance Insights</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-400">Annual Solar Flux</span>
                <div className="text-base font-bold text-white mt-1">{solar.annual_solar_flux_kwh_m2} kWh/m²</div>
              </div>
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-400">Peak Sun Hours</span>
                <div className="text-base font-bold text-white mt-1">{solar.peak_sun_hours_daily} hrs/day</div>
              </div>
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-400">Optimal PV Tilt / Azimuth</span>
                <div className="text-base font-bold text-white mt-1">{solar.optimal_pv_tilt_deg}° / {solar.optimal_pv_azimuth_deg}°</div>
              </div>
              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                <span className="text-neutral-400">Rooftop Capacity</span>
                <div className="text-base font-bold text-amber-400 mt-1">{solar.rooftop_solar_capacity_kw} kW Peak</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
