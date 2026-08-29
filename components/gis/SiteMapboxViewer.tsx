'use client';

import React, { useState, useEffect } from 'react';
import { SiteInformation, CandidateDesign } from '@/types/architecture';
import { getComprehensiveSiteIntelligence, SiteIntelligenceReport } from '@/lib/api/siteIntelligenceApi';
import {
  Globe,
  Layers,
  Sun,
  Moon,
  Compass,
  MapPin,
  Maximize2,
  Sliders,
  ShieldCheck,
  Zap,
  Wind,
  Droplets,
  TreeDeciduous,
  Building,
  Info,
} from 'lucide-react';

interface SiteMapboxViewerProps {
  site: SiteInformation;
  design?: CandidateDesign;
  lat?: number;
  lon?: number;
}

export const SiteMapboxViewer: React.FC<SiteMapboxViewerProps> = ({
  site,
  design,
  lat = 19.076,
  lon = 72.8777,
}) => {
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'terrain' | 'solar_flux' | 'shadow' | 'proposed'>('satellite');
  const [showIntelligenceDrawer, setShowIntelligenceDrawer] = useState<boolean>(false);
  const [intelligence, setIntelligence] = useState<SiteIntelligenceReport | null>(null);

  useEffect(() => {
    getComprehensiveSiteIntelligence(site, lat, lon).then(setIntelligence);
  }, [site, lat, lon]);

  const layers = [
    { id: 'satellite', label: '🛰️ Satellite RGB' },
    { id: 'terrain', label: '⛰️ Topo Terrain' },
    { id: 'solar_flux', label: '☀️ Solar Flux' },
    { id: 'shadow', label: '👥 Tree/Building Shadows' },
    { id: 'proposed', label: '🏢 Proposed 3D Footprint' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-200 shadow-2xl space-y-5">
      
      {/* Header & Layer Toggles */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-bold text-lg">
            <Globe className="w-5 h-5" />
            <span>GIS Satellite, Topography & Google Solar Heatmap</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-world geospatial context with satellite raster, elevation contours, Google Solar API flux, and setback boundaries.
          </p>
        </div>

        <button
          onClick={() => setShowIntelligenceDrawer(!showIntelligenceDrawer)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 shadow"
        >
          <Info className="w-4 h-4" />
          <span>{showIntelligenceDrawer ? 'Hide Site Intelligence' : 'View 13-Layer Site Intelligence'}</span>
        </button>
      </div>

      {/* Layer Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {layers.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeLayer === l.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Interactive GIS Map Canvas Viewport */}
      <div className="relative w-full h-96 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        
        {/* Background Visual based on Layer */}
        {activeLayer === 'satellite' && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-85"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80')`,
            }}
          />
        )}

        {activeLayer === 'terrain' && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70 filter hue-rotate-90"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80')`,
            }}
          />
        )}

        {activeLayer === 'solar_flux' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/40 via-red-500/30 to-purple-600/40 opacity-90 backdrop-blur-xs" />
        )}

        {activeLayer === 'shadow' && (
          <div className="absolute inset-0 bg-slate-950/70" />
        )}

        {activeLayer === 'proposed' && (
          <div className="absolute inset-0 bg-slate-950/80" />
        )}

        {/* Vector SVG CAD Overlay on GIS Map */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400">
          {/* Site Boundary Polygon */}
          <rect
            x="240"
            y="90"
            width="320"
            height="220"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="6,4"
          />

          {/* Setback Envelope Line */}
          <rect
            x="270"
            y="120"
            width="260"
            height="160"
            fill="#38bdf8"
            fillOpacity={activeLayer === 'solar_flux' ? 0.3 : 0.1}
            stroke="#0284c7"
            strokeWidth="1.5"
          />

          {/* Proposed Building Footprint */}
          {(activeLayer === 'proposed' || activeLayer === 'satellite' || activeLayer === 'solar_flux') && (
            <rect
              x="285"
              y="135"
              width="230"
              height="130"
              fill={activeLayer === 'solar_flux' ? '#f59e0b' : '#3b82f6'}
              fillOpacity={0.7}
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}

          {/* Solar Flux Gradient Heatmap Overlay */}
          {activeLayer === 'solar_flux' && (
            <circle cx="400" cy="200" r="100" fill="#ef4444" fillOpacity="0.35" filter="blur(20px)" />
          )}

          {/* Simulated Shadows */}
          {activeLayer === 'shadow' && (
            <polygon
              points="515,135 600,100 600,230 515,265"
              fill="#000000"
              fillOpacity="0.65"
            />
          )}

          {/* Road Frontage Indicator */}
          <line x1="200" y1="330" x2="600" y2="330" stroke="#facc15" strokeWidth="8" />
          <text x="400" y="355" fill="#facc15" fontSize="11" fontWeight="bold" textAnchor="middle">
            {site.roadWidth}ft {site.orientation}-Facing Access Road
          </text>

          {/* Trees */}
          <circle cx="255" cy="105" r="14" fill="#22c55e" fillOpacity="0.8" stroke="#15803d" strokeWidth="2" />
          <circle cx="545" cy="105" r="16" fill="#22c55e" fillOpacity="0.8" stroke="#15803d" strokeWidth="2" />
          <text x="255" y="108" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">🌳</text>
          <text x="545" y="108" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">🌳</text>
        </svg>

        {/* Top-Right Compass / North Arrow */}
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 flex items-center gap-2 text-xs shadow-lg">
          <Compass className="w-5 h-5 text-rose-500 animate-pulse" />
          <div>
            <span className="font-extrabold text-slate-200 block text-[11px]">TRUE NORTH</span>
            <span className="text-[10px] text-slate-400 font-mono">0.0° Azimuth</span>
          </div>
        </div>

        {/* Bottom-Left Coordinates HUD */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-[11px] font-mono space-y-0.5 shadow-lg">
          <div className="text-slate-300 font-bold">
            LAT: {lat.toFixed(4)}° N • LON: {lon.toFixed(4)}° E
          </div>
          <div className="text-slate-400 text-[10px]">
            Plot: {site.length}ft × {site.width}ft ({site.length * site.width} sq ft) • Elev: {intelligence?.elevation.elevationAboveSeaLevelFeet || 79}ft
          </div>
        </div>

        {/* Solar Flux Legend */}
        {activeLayer === 'solar_flux' && (
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 text-[10px] space-y-1">
            <span className="font-bold text-amber-400 block">Annual Solar Flux (Google Solar API)</span>
            <div className="w-36 h-2 rounded bg-gradient-to-r from-blue-500 via-amber-400 to-red-500" />
            <div className="flex justify-between text-slate-400 text-[9px] font-mono">
              <span>1,200 kWh</span>
              <span>1,850</span>
              <span>2,200 kWh/m²</span>
            </div>
          </div>
        )}

      </div>

      {/* 13-LAYER SITE INTELLIGENCE REPORT DRAWER */}
      {showIntelligenceDrawer && intelligence && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Comprehensive 13-Layer Site Intelligence Breakdown
            </span>
            <span className="text-xs text-slate-400 font-mono">{site.locationState}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            
            {/* 1. Address & Coords */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">1. Coordinates & UTM</span>
              <span className="font-bold text-slate-200 block">{intelligence.coordinates.latitude.toFixed(4)}°, {intelligence.coordinates.longitude.toFixed(4)}°</span>
              <span className="text-[10px] text-slate-400 block">UTM Zone {intelligence.coordinates.utmZone}</span>
            </div>

            {/* 2. Road & Access */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">2. Road & Access Vector</span>
              <span className="font-bold text-amber-400 block">{intelligence.road.primaryRoadWidthFt}ft Width ({intelligence.road.orientation})</span>
              <span className="text-[10px] text-slate-400 block">{intelligence.road.accessType}</span>
            </div>

            {/* 3. Topography & Slope */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">3. Topography & Slope</span>
              <span className="font-bold text-emerald-400 block">{intelligence.terrain.slopeGradientPercent}% ({intelligence.terrain.slopeCategory})</span>
              <span className="text-[10px] text-slate-400 block">Drainage: {intelligence.terrain.naturalDrainageDirection}</span>
            </div>

            {/* 4. Elevation */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">4. Geodetic Elevation</span>
              <span className="font-bold text-slate-200 block">{intelligence.elevation.elevationAboveSeaLevelMeters}m ({intelligence.elevation.elevationAboveSeaLevelFeet}ft)</span>
              <span className="text-[10px] text-slate-400 block">Relief: {intelligence.elevation.topographicRelief}</span>
            </div>

            {/* 5. Google Solar Potential */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">5. Solar Flux (Google Solar)</span>
              <span className="font-bold text-amber-400 block">{intelligence.solar.annualSolarFluxKWhM2} kWh/m²/yr</span>
              <span className="text-[10px] text-slate-400 block">Rec. PV: {intelligence.solar.recommendedPvCapacityKw} kW ({intelligence.solar.estimatedAnnualEnergyMWh} MWh/yr)</span>
            </div>

            {/* 6. Climate & Rainfall */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">6. Climate Zone & Rain</span>
              <span className="font-bold text-sky-400 block">{intelligence.climate.zone}</span>
              <span className="text-[10px] text-slate-400 block">Annual Rain: {intelligence.climate.annualRainfallMm} mm</span>
            </div>

            {/* 7. Nearby Obstructions */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">7. Urban Obstructions</span>
              <span className="font-bold text-slate-200 block">Avg Ht: {intelligence.nearbyBuildings.averageHeightMeters}m</span>
              <span className="text-[10px] text-slate-400 block">Shadow Risk: {intelligence.nearbyBuildings.solarObstructionRisk}</span>
            </div>

            {/* 8. Vegetation Quota */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">8. Vegetation Quota</span>
              <span className="font-bold text-emerald-400 block">{intelligence.vegetation.treeCanopyCoverPercent}% Canopy Cover</span>
              <span className="text-[10px] text-slate-400 block">Preserve: {intelligence.vegetation.treePreservationQuota} Trees Required</span>
            </div>

            {/* 9. Flood Risk */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">9. Flood Risk Zone</span>
              <span className="font-bold text-blue-400 block">{intelligence.floodRisk.floodZoneCategory}</span>
              <span className="text-[10px] text-slate-400 block">Rec. Plinth: +{intelligence.floodRisk.recommendedPlinthHeightFt}ft</span>
            </div>

            {/* 10. Wind & Ventilation */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">10. Wind Microclimate</span>
              <span className="font-bold text-slate-200 block">{intelligence.windAndMicroclimate.averageWindSpeedKmh} km/h</span>
              <span className="text-[10px] text-slate-400 block">Prevailing: {intelligence.windAndMicroclimate.prevailingWindDirection}</span>
            </div>

            {/* 11. Live Weather */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">11. Live Atmospheric</span>
              <span className="font-bold text-slate-200 block">{intelligence.weather.temperatureC}°C • {intelligence.weather.humidityPercent}% RH</span>
              <span className="text-[10px] text-slate-400 block">Direct DNI: {intelligence.weather.directSolarIrradianceW_m2} W/m²</span>
            </div>

            {/* 12. Local Bye-Laws */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block text-[11px]">12. Legal Regulations</span>
              <span className="font-bold text-indigo-400 block">{intelligence.localRegulations.jurisdiction}</span>
              <span className="text-[10px] text-slate-400 block">Max FAR: {intelligence.localRegulations.maxPermissibleFar} | Cov: {intelligence.localRegulations.maxGroundCoveragePercent}%</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
