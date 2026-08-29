'use client';

import React from 'react';
import { calculateSunPosition } from '@/lib/solarEngine';
import { SolarWeatherData } from '@/lib/api/solarWeatherApi';
import { Orientation } from '@/types/architecture';
import { Sun, Sunrise, Sunset, Zap, Cloud, Thermometer, ShieldCheck } from 'lucide-react';

interface SolarSimulatorProps {
  timeOfDay: number; // 6 to 18
  onChangeTime: (time: number) => void;
  roadOrientation: Orientation;
  solarData?: SolarWeatherData | null;
}

export const SolarSimulator: React.FC<SolarSimulatorProps> = ({
  timeOfDay,
  onChangeTime,
  roadOrientation,
  solarData,
}) => {
  const sunInfo = calculateSunPosition(timeOfDay, roadOrientation);

  const formatTimeStr = (h: number) => {
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayH = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayH}:${mins < 10 ? '0' : ''}${mins} ${period}`;
  };

  // Adjust current solar radiation based on timeOfDay curve and live API baseline
  const baseIrradiance = solarData?.irradianceWperM2 || 650;
  const progress = Math.max(0, Math.min(1, (timeOfDay - 6) / 12));
  const currentIrradiance = Math.round(Math.sin(progress * Math.PI) * baseIrradiance);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
          <span>Real-Time Solar Radiation & 24-Hour Sun Trajectory</span>
        </div>
        <div className="flex items-center gap-2">
          {solarData?.isLive && (
            <span className="text-[11px] px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded-full border border-emerald-500/30">
              ● Live Open-Meteo API
            </span>
          )}
          <span className="text-xs px-3 py-1 bg-amber-500/20 text-amber-300 font-mono font-bold rounded-full border border-amber-500/30">
            {formatTimeStr(timeOfDay)}
          </span>
        </div>
      </div>

      {/* Interactive Time Slider */}
      <div className="relative flex items-center gap-3 my-2">
        <Sunrise className="w-5 h-5 text-amber-300" />
        <input
          type="range"
          min="6.0"
          max="18.0"
          step="0.5"
          value={timeOfDay}
          onChange={(e) => onChangeTime(parseFloat(e.target.value))}
          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <Sunset className="w-5 h-5 text-amber-500" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Solar Irradiance</span>
          </div>
          <div className="text-amber-300 font-mono font-extrabold text-base">
            {currentIrradiance} <span className="text-xs font-normal">W/m²</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Rooftop PV Output</span>
          </div>
          <div className="text-emerald-400 font-mono font-extrabold text-base">
            {solarData?.estimatedDailyKWh || 23.5} <span className="text-xs font-normal">kWh/day</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Cloud & Temp</span>
          </div>
          <div className="text-sky-300 font-mono font-extrabold text-base">
            {solarData?.cloudCoverPercent || 15}% <span className="text-slate-400 text-xs font-normal">({solarData?.temperatureC || 28}°C)</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Direct Sun Exposure</span>
          </div>
          <div className="text-indigo-300 font-bold truncate">
            {sunInfo.illuminatedRooms.length > 0 ? sunInfo.illuminatedRooms.slice(0, 2).join(', ') : 'Ambient Light'}
          </div>
        </div>
      </div>
    </div>
  );
};
