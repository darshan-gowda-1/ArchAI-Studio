'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useBuildingStore } from '../../stores/buildingStore';
import { Check, Columns, Layers, Sun, Wind, ShieldCheck, Zap, Sparkles, ArrowRight, Eye } from 'lucide-react';

interface DesignCandidate {
  id: string;
  name: string;
  badge: string;
  area_sqft: number;
  cost_lakhs_inr: number;
  daylight_pct: number;
  ventilation_pct: number;
  compliance_pct: number;
  solar_pct: number;
  color: string;
  description: string;
  features: string[];
}

const COMPARISON_CANDIDATES: DesignCandidate[] = [
  {
    id: 'design_a',
    name: 'DESIGN A',
    badge: 'Bioclimatic Baseline',
    area_sqft: 2140,
    cost_lakhs_inr: 42.1,
    daylight_pct: 91,
    ventilation_pct: 89,
    compliance_pct: 98,
    solar_pct: 87,
    color: '#06b6d4',
    description: 'Optimized passive solar orientation with central light well and shaded south patio.',
    features: ['Double-height living lounge', 'Courtyard microclimate buffer', '14-panel rooftop solar pergola']
  },
  {
    id: 'design_b',
    name: 'DESIGN B',
    badge: 'Max Usable Area',
    area_sqft: 2220,
    cost_lakhs_inr: 43.8,
    daylight_pct: 87,
    ventilation_pct: 94,
    compliance_pct: 96,
    solar_pct: 92,
    color: '#10b981',
    description: 'Extended cantilevered upper terrace maximizing carpet efficiency and wind capture.',
    features: ['Cross-breeze master suite', 'Deep shading roof overhangs', 'Rainwater collection terrace']
  },
  {
    id: 'design_c',
    name: 'DESIGN C',
    badge: 'Ultra Value & Cost',
    area_sqft: 2090,
    cost_lakhs_inr: 40.9,
    daylight_pct: 83,
    ventilation_pct: 81,
    compliance_pct: 100,
    solar_pct: 81,
    color: '#a855f7',
    description: 'Compact structural core with 100% NBC statutory clearance and minimized circulation waste.',
    features: ['High structural efficiency grid', 'Zero non-compliant setbacks', 'Modular wet core alignment']
  }
];

function MiniThreeViewport({ candidate, isSelected, onSelect }: { candidate: DesignCandidate; isSelected: boolean; onSelect: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(18, 14, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Site Grid
    const grid = new THREE.GridHelper(30, 15, 0x1e293b, 0x0f172a);
    grid.position.y = -0.01;
    scene.add(grid);

    // Procedural Building Massing
    const bldgGroup = new THREE.Group();

    const wallMat = new THREE.MeshStandardMaterial({
      color: candidate.color,
      roughness: 0.35,
      metalness: 0.15,
      transparent: true,
      opacity: 0.92,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transmission: 0.7,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    });

    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
    });

    // Ground Floor Box
    const gMesh = new THREE.Mesh(new THREE.BoxGeometry(12, 3.5, 14), wallMat);
    gMesh.position.set(0, 1.75, 0);
    gMesh.castShadow = true;
    bldgGroup.add(gMesh);

    // Slab Divider
    const sMesh = new THREE.Mesh(new THREE.BoxGeometry(13, 0.4, 15), slabMat);
    sMesh.position.set(0, 3.7, 0);
    bldgGroup.add(sMesh);

    // First Floor Box (Offset based on candidate)
    const offsetZ = candidate.id === 'design_b' ? 2 : candidate.id === 'design_a' ? -1 : 0;
    const fMesh = new THREE.Mesh(new THREE.BoxGeometry(11, 3.5, 12), wallMat);
    fMesh.position.set(0, 5.65, offsetZ);
    fMesh.castShadow = true;
    bldgGroup.add(fMesh);

    // Roof & Solar Panels
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 13), slabMat);
    roofSlab.position.set(0, 7.55, offsetZ);
    bldgGroup.add(roofSlab);

    const pvMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8, roughness: 0.2 });
    for (let r = -2; r <= 2; r++) {
      for (let c = -1; c <= 1; c++) {
        const pv = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 2.2), pvMat);
        pv.position.set(c * 2.2, 7.8, offsetZ + r * 2.6);
        pv.rotation.x = -0.15;
        bldgGroup.add(pv);
      }
    }

    scene.add(bldgGroup);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [candidate]);

  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border ${
        isSelected
          ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] ring-2 ring-cyan-500/50 bg-slate-900/90'
          : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-900/40'
      }`}
    >
      {/* Header Badge */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: candidate.color }} />
          <div>
            <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
              {candidate.name}
              {isSelected && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                  ACTIVE
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">{candidate.badge}</p>
          </div>
        </div>
        <button
          className={`p-1.5 rounded-lg border transition-all ${
            isSelected
              ? 'bg-cyan-500 text-black border-cyan-400'
              : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:text-white'
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>

      {/* 3D Viewport Canvas */}
      <div ref={mountRef} className="w-full h-56 relative bg-slate-950">
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5 pointer-events-none">
          <Eye className="w-3 h-3 text-cyan-400" />
          Interactive 3D Preview
        </div>
      </div>

      {/* Rationale & Features */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <p className="text-xs text-slate-300 leading-relaxed">{candidate.description}</p>
        <div className="space-y-1.5">
          {candidate.features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DesignComparisonView() {
  const { setActiveTab } = useBuildingStore();
  const [selectedId, setSelectedId] = useState<string>('design_a');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#05070d] text-slate-100 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            <Columns className="w-4 h-4" />
            Pareto Frontier Multi-Objective Comparison
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Side-by-Side Design Variants Analysis
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Inspect synchronized 3D models and compare structural, thermodynamic, and financial KPIs across synthesized candidates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('workflow')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            Workflow Stepper
          </button>
          <button
            onClick={() => setActiveTab('bim')}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            Proceed to BIM Export
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Side-by-Side 3D Multi-Viewport Grid (3D A | 3D B | 3D C) */}
      <div className="mt-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          3D Multi-Viewport Inspection (3D A | 3D B | 3D C)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COMPARISON_CANDIDATES.map((candidate) => (
            <MiniThreeViewport
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedId === candidate.id}
              onSelect={() => setSelectedId(candidate.id)}
            />
          ))}
        </div>
      </div>

      {/* Side-by-Side Metrics Comparison Matrix */}
      <div className="mt-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Multi-Objective KPI Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                <th className="pb-3 px-4">Metric / Parameter</th>
                {COMPARISON_CANDIDATES.map((c) => (
                  <th key={c.id} className="pb-3 px-4 text-center">
                    <span className="font-extrabold text-white">{c.name}</span>
                    <span className="block text-[10px] font-normal text-slate-400">{c.badge}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {/* Area */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Carpet Area
                </td>
                <td className="py-3 px-4 text-center font-bold text-white">2,140 ft²</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-400 bg-emerald-500/5 rounded-lg">2,220 ft² (Highest)</td>
                <td className="py-3 px-4 text-center font-bold text-white">2,090 ft²</td>
              </tr>

              {/* Cost */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Estimated Construction Cost
                </td>
                <td className="py-3 px-4 text-center font-bold text-white">₹42.1L</td>
                <td className="py-3 px-4 text-center font-bold text-white">₹43.8L</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-400 bg-emerald-500/5 rounded-lg">₹40.9L (Lowest)</td>
              </tr>

              {/* Daylight */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-300 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Daylight Factor Score
                </td>
                <td className="py-3 px-4 text-center font-bold text-emerald-400 bg-emerald-500/5 rounded-lg">91% (Best)</td>
                <td className="py-3 px-4 text-center font-bold text-white">87%</td>
                <td className="py-3 px-4 text-center font-bold text-white">83%</td>
              </tr>

              {/* Ventilation */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-300 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-sky-400" />
                  Natural Cross-Ventilation
                </td>
                <td className="py-3 px-4 text-center font-bold text-white">89%</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-400 bg-emerald-500/5 rounded-lg">94% (Best)</td>
                <td className="py-3 px-4 text-center font-bold text-white">81%</td>
              </tr>

              {/* Compliance */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Statutory NBC 2016 Compliance
                </td>
                <td className="py-3 px-4 text-center font-bold text-white">98%</td>
                <td className="py-3 px-4 text-center font-bold text-white">96%</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-400 bg-emerald-500/5 rounded-lg">100% (Full Clearance)</td>
              </tr>

              {/* Solar */}
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Rooftop Solar PV Harvest
                </td>
                <td className="py-3 px-4 text-center font-bold text-white">87%</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-400 bg-emerald-500/5 rounded-lg">92% (Best)</td>
                <td className="py-3 px-4 text-center font-bold text-white">81%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
