'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sparkles,
  Layers,
  Box,
  Sun,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Building,
  CheckCircle2,
  Terminal,
  Compass,
  Cpu,
} from 'lucide-react';

interface CinematicLandingPageProps {
  onEnterStudio: () => void;
}

function SubtleFloatingParticles({ count = 80 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = Math.random() * 12;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#f59e0b"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ArchitecturalWireframeStructure() {
  const groupRef = useRef<THREE.Group>(null);
  const floor1Ref = useRef<THREE.Mesh>(null);
  const floor2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.06;
    }
    // Subtle breathing elevation
    if (floor1Ref.current) {
      floor1Ref.current.position.y = 2.6 + Math.sin(t * 0.8) * 0.08;
    }
    if (floor2Ref.current) {
      floor2Ref.current.position.y = 5.0 + Math.sin(t * 0.8 + 0.4) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.2, 0]}>
      {/* Ground Foundation Grid Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[16, 16, 16, 16]} />
        <meshBasicMaterial color="#1e293b" wireframe />
      </mesh>

      {/* Cadastral Setback Boundary Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshBasicMaterial color="#f59e0b" wireframe />
      </mesh>

      {/* Ground Floor Podium Slab */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[8.5, 0.3, 6.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Ground Floor Glass Curtain Envelope */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[8.2, 2.2, 6.2]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.88}
          opacity={1}
          transparent
          roughness={0.08}
          ior={1.52}
          thickness={0.6}
        />
      </mesh>

      {/* First Floor Cantilevered Slab */}
      <mesh ref={floor1Ref} position={[0.4, 2.6, 0]}>
        <boxGeometry args={[9.5, 0.25, 7.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* First Floor Wireframe Massing with Copper Accent */}
      <mesh position={[0.4, 3.8, 0]}>
        <boxGeometry args={[9.2, 2.1, 6.8]} />
        <meshBasicMaterial color="#d97706" wireframe />
      </mesh>

      {/* Floating Rooftop Terrace */}
      <mesh ref={floor2Ref} position={[0.4, 5.0, 0]}>
        <boxGeometry args={[9.8, 0.2, 7.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Structural RCC Columns (Amber Glowing Nodes) */}
      {[-3.8, 0, 3.8].map((x, i) =>
        [-2.8, 2.8].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, 2.5, z]}>
            <mesh>
              <cylinderGeometry args={[0.07, 0.07, 5, 8]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#b45309"
                emissiveIntensity={0.8}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))
      )}

      {/* Solar Panel Array on Roof */}
      <mesh position={[-1.5, 5.3, 0]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[5, 0.05, 3]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
}

export const CinematicLandingPage: React.FC<CinematicLandingPageProps> = ({ onEnterStudio }) => {
  return (
    <div className="relative min-h-screen bg-[#080A0D] text-[#F1F5F9] overflow-hidden flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      
      {/* 3D Background Interactive Canvas with Particles */}
      <div className="absolute inset-0 pointer-events-auto opacity-75">
        <Canvas camera={{ position: [9, 7, 11], fov: 40 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[12, 18, 10]} intensity={1.8} color="#fed7aa" castShadow />
          <pointLight position={[-10, 8, -10]} intensity={1.0} color="#38bdf8" />
          <SubtleFloatingParticles count={90} />
          <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.3}>
            <ArchitecturalWireframeStructure />
          </Float>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.35}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
        </Canvas>
      </div>

      {/* Fog and Radial Glow Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080A0D] via-transparent to-[#080A0D]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#080A0D]/30 to-[#080A0D] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-[#1E2530]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-extrabold text-black text-sm tracking-widest shadow-lg shadow-amber-900/30">
            A
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider text-white">ARCHAI</span>
            <span className="text-[10px] text-amber-500 font-mono ml-2 uppercase tracking-widest font-bold">
              STUDIO v2.4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="hidden sm:inline-block text-slate-400">
            NSGA-II GENETIC OPTIMIZER • OPEN BIM IFC4 • POSTGIS
          </span>
          <button
            onClick={onEnterStudio}
            className="px-5 py-2 rounded-xl bg-[#11151A] hover:bg-[#171D24] text-amber-400 border border-[#1E2530] font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            Launch Studio <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 py-12 space-y-10">
        
        <div className="max-w-3xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#11151A]/90 border border-amber-500/30 text-amber-300 text-xs font-mono backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Autonomous Architectural Synthesis &amp; 3D BIM Platform</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.05] font-sans">
            GENERATE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-slate-100">
              YOUR NEXT
            </span><br />
            BUILDING.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            A constraint-driven algorithmic engine that synthesizes 100–1000 candidate architectural plans, resolves municipal bye-laws, computes multi-objective Pareto frontiers, and exports production-ready AutoCAD DXF, IFC4 BIM, and construction blueprints in seconds.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onEnterStudio}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-amber-950/60 transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5"
            >
              <span>Start Designing</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onEnterStudio}
              className="px-6 py-4 bg-[#11151A]/80 hover:bg-[#171D24] text-slate-300 hover:text-white font-semibold text-sm rounded-2xl border border-[#1E2530] backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Box className="w-4 h-4 text-sky-400" />
              <span>Explore 3D Studio</span>
            </button>
          </div>

        </div>

        {/* 4-Feature Architecture Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          
          <div className="p-5 rounded-2xl bg-[#11151A]/85 border border-[#1E2530] backdrop-blur-md space-y-2 hover:border-amber-500/40 transition">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm block">NSGA-II Genetic Optimizer</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes 250 candidate plans per generation across space efficiency, natural light, and ventilation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#11151A]/85 border border-[#1E2530] backdrop-blur-md space-y-2 hover:border-sky-500/40 transition">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Box className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm block">Canonical IFC4 &amp; Open BIM</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct exports to Autodesk Revit, Archicad, BlenderBIM, and cloud collaboration via Speckle &amp; APS.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#11151A]/85 border border-[#1E2530] backdrop-blur-md space-y-2 hover:border-amber-500/40 transition">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm block">Solar Physics &amp; Daylighting</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Maps Solar API integration with time-resolved Morning, Afternoon, and Evening room illuminance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#11151A]/85 border border-[#1E2530] backdrop-blur-md space-y-2 hover:border-emerald-500/40 transition">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm block">Parametric QTO &amp; BOQ</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Derived directly from 3D geometry with regional CPWD &amp; CREDAI material and labour rates.
            </p>
          </div>

        </div>

        {/* Technical Provenance Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#1E2530]/40 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-6">
            <span>ENGINE: NSGA-II v3.1</span>
            <span>JURISDICTIONS: NBC INDIA • BBMP • UDCPR • IBC</span>
            <span>BIM: IFC4 / STEP ISO-10303</span>
          </div>
          <div>
            <span>© 2026 ARCHAI STUDIO • ALL RIGHTS RESERVED</span>
          </div>
        </div>

      </main>

    </div>
  );
};
