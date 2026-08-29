'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { CandidateDesign, RoomPolygon, StructuralColumn } from '@/types/architecture';
import {
  ParametricWallWithOpening,
  ParametricBalconyRailing,
  ParametricSolarPanelArray,
} from '@/lib/bim/meshGenerators';
import { Sparkles, Layers, Eye, Compass, Sun, ShieldCheck, Box, Camera } from 'lucide-react';

export type CameraPresetMode = 'perspective' | 'top_down' | 'interior' | 'solar';

interface BuildingViewerProps {
  design: CandidateDesign;
  selectedFloor: number;
  solarTimeOfDay: number;
  cameraPreset?: CameraPresetMode;
}

function SmoothCameraController({ mode }: { mode: CameraPresetMode }) {
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(50, 35, 55));
  const targetLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 8, 0));

  useEffect(() => {
    switch (mode) {
      case 'top_down':
        targetPos.current.set(0, 68, 0.01);
        targetLook.current.set(0, 0, 0);
        break;
      case 'interior':
        targetPos.current.set(0, 5.5, 3);
        targetLook.current.set(0, 5.5, -8);
        break;
      case 'solar':
        targetPos.current.set(70, 48, 70);
        targetLook.current.set(0, 5, 0);
        break;
      case 'perspective':
      default:
        targetPos.current.set(50, 35, 55);
        targetLook.current.set(0, 8, 0);
        break;
    }
  }, [mode]);

  useFrame((state) => {
    state.camera.position.lerp(targetPos.current, 0.06);
  });

  return null;
}

function LandscapeTrees() {
  const treePositions: [number, number, number][] = [
    [-34, 0, -28],
    [34, 0, -28],
    [-34, 0, 28],
    [34, 0, 28],
    [-38, 0, 0],
    [38, 0, 0],
  ];

  return (
    <group>
      {treePositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh position={[0, 3.5, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.85, 7, 8]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
          <mesh position={[0, 8.5, 0]} castShadow>
            <sphereGeometry args={[4.5, 12, 12]} />
            <meshStandardMaterial color="#166534" roughness={0.7} />
          </mesh>
          <mesh position={[0, 10.8, 0]} castShadow>
            <sphereGeometry args={[3.2, 10, 10]} />
            <meshStandardMaterial color="#15803d" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SurroundingContextBuildings({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <group>
      {/* Left Neighboring 2-Storey House */}
      <mesh position={[-52, 11, 0]} castShadow receiveShadow>
        <boxGeometry args={[26, 22, 38]} />
        <meshStandardMaterial color="#475569" roughness={0.7} transparent opacity={0.65} />
      </mesh>

      {/* Right Neighboring 3-Storey Residential Block */}
      <mesh position={[54, 15, 0]} castShadow receiveShadow>
        <boxGeometry args={[28, 30, 42]} />
        <meshStandardMaterial color="#475569" roughness={0.7} transparent opacity={0.65} />
      </mesh>

      {/* Rear Neighboring Structure */}
      <mesh position={[0, 12, -48]} castShadow receiveShadow>
        <boxGeometry args={[44, 24, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.8} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function ParametricBuildingModel({
  design,
  viewMode,
}: {
  design: CandidateDesign;
  viewMode: 'full' | 'exploded' | 'columns' | 'f0' | 'f1';
}) {
  const wallHeight = 10.0;
  const wallThickness = 0.55;

  const groundFloor = design.floors.find((f) => f.floorNumber === 0);
  const firstFloor = design.floors.find((f) => f.floorNumber === 1);

  const bWidth = groundFloor?.width || 30;
  const bHeight = groundFloor?.height || 40;

  const f0Y = 0;
  const f1Y = viewMode === 'exploded' ? 19 : wallHeight + 0.5;
  const roofY = viewMode === 'exploded' ? 38 : (firstFloor ? 2 : 1) * (wallHeight + 0.55);

  const showF0 = viewMode === 'full' || viewMode === 'exploded' || viewMode === 'f0' || viewMode === 'columns';
  const showF1 = (viewMode === 'full' || viewMode === 'exploded' || viewMode === 'f1' || viewMode === 'columns') && !!firstFloor;
  const showRoof = viewMode === 'full' || viewMode === 'exploded';

  return (
    <group position={[0, 0, 0]}>
      {/* GROUND FLOOR (Level 0) */}
      {showF0 && groundFloor && (
        <group position={[0, f0Y, 0]}>
          {/* Foundation Plinth Slab */}
          <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
            <boxGeometry args={[bWidth + 3, 0.5, bHeight + 3]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>

          {/* Rooms, Walls with Openings & Furniture */}
          {groundFloor.rooms.map((room) => {
            const rx = room.x - bWidth / 2 + room.width / 2;
            const rz = room.y - bHeight / 2 + room.height / 2;

            return (
              <group key={room.id} position={[rx, 0.5, rz]}>
                {/* Floor Finish Plate */}
                <mesh position={[0, 0.05, 0]} receiveShadow>
                  <boxGeometry args={[room.width - 0.2, 0.1, room.height - 0.2]} />
                  <meshStandardMaterial color={room.color || '#e2e8f0'} roughness={0.3} />
                </mesh>

                {/* Parametric Walls with Windows & Doors */}
                {viewMode !== 'columns' && (
                  <group>
                    {/* North Wall */}
                    <group position={[0, 0, -room.height / 2]} rotation={[0, 0, 0]}>
                      <ParametricWallWithOpening
                        length={room.width}
                        height={wallHeight}
                        thickness={wallThickness}
                        windowWidth={room.windows.some((w) => w.side === 'N') ? 4.0 : undefined}
                        hasDoor={room.doors.some((d) => d.side === 'N')}
                      />
                    </group>

                    {/* South Wall */}
                    <group position={[0, 0, room.height / 2]} rotation={[0, 0, 0]}>
                      <ParametricWallWithOpening
                        length={room.width}
                        height={wallHeight}
                        thickness={wallThickness}
                        windowWidth={room.windows.some((w) => w.side === 'S') ? 4.0 : undefined}
                        hasDoor={room.doors.some((d) => d.side === 'S')}
                      />
                    </group>

                    {/* West Wall */}
                    <group position={[-room.width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                      <ParametricWallWithOpening
                        length={room.height}
                        height={wallHeight}
                        thickness={wallThickness}
                        windowWidth={room.windows.some((w) => w.side === 'W') ? 4.0 : undefined}
                        hasDoor={room.doors.some((d) => d.side === 'W')}
                      />
                    </group>

                    {/* East Wall */}
                    <group position={[room.width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                      <ParametricWallWithOpening
                        length={room.height}
                        height={wallHeight}
                        thickness={wallThickness}
                        windowWidth={room.windows.some((w) => w.side === 'E') ? 4.0 : undefined}
                        hasDoor={room.doors.some((d) => d.side === 'E')}
                      />
                    </group>
                  </group>
                )}

                {/* 3D Furniture Assets */}
                {room.furniture.map((item) => (
                  <group key={item.id} position={[item.x, 0.4, item.y]} rotation={[0, (item.rotation * Math.PI) / 180, 0]}>
                    <mesh position={[0, item.depth / 2, 0]} castShadow receiveShadow>
                      <boxGeometry args={[item.width, item.depth, item.depth]} />
                      <meshStandardMaterial
                        color={item.type === 'bed' ? '#3b82f6' : item.type === 'sofa' ? '#d97706' : '#64748b'}
                        roughness={0.5}
                      />
                    </mesh>
                  </group>
                ))}
              </group>
            );
          })}
        </group>
      )}

      {/* FIRST FLOOR (Level 1) */}
      {showF1 && firstFloor && (
        <group position={[0, f1Y, 0]}>
          {/* Floor Intermediate Slab */}
          <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
            <boxGeometry args={[bWidth + 3, 0.5, bHeight + 3]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>

          {/* First Floor Rooms */}
          {firstFloor.rooms.map((room) => {
            const rx = room.x - bWidth / 2 + room.width / 2;
            const rz = room.y - bHeight / 2 + room.height / 2;

            return (
              <group key={room.id} position={[rx, 0.5, rz]}>
                {/* Floor Finish */}
                <mesh position={[0, 0.05, 0]} receiveShadow>
                  <boxGeometry args={[room.width - 0.2, 0.1, room.height - 0.2]} />
                  <meshStandardMaterial color={room.color || '#f1f5f9'} roughness={0.3} />
                </mesh>

                {/* Parametric Walls */}
                {viewMode !== 'columns' && (
                  <group>
                    <group position={[0, 0, -room.height / 2]}>
                      <ParametricWallWithOpening
                        length={room.width}
                        height={wallHeight}
                        thickness={wallThickness}
                        windowWidth={room.windows.some((w) => w.side === 'N') ? 4.0 : undefined}
                        hasDoor={room.doors.some((d) => d.side === 'N')}
                      />
                    </group>
                    <group position={[0, 0, room.height / 2]}>
                      <ParametricWallWithOpening
                        length={room.width}
                        height={wallHeight}
                        thickness={wallThickness}
                        windowWidth={room.windows.some((w) => w.side === 'S') ? 4.0 : undefined}
                        hasDoor={room.doors.some((d) => d.side === 'S')}
                      />
                    </group>
                    <group position={[-room.width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                      <ParametricWallWithOpening
                        length={room.height}
                        height={wallHeight}
                        thickness={wallThickness}
                        windowWidth={room.windows.some((w) => w.side === 'W') ? 4.0 : undefined}
                        hasDoor={room.doors.some((d) => d.side === 'W')}
                      />
                    </group>
                    <group position={[room.width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                      <ParametricWallWithOpening
                        length={room.height}
                        height={wallHeight}
                        thickness={wallThickness}
                        windowWidth={room.windows.some((w) => w.side === 'E') ? 4.0 : undefined}
                        hasDoor={room.doors.some((d) => d.side === 'E')}
                      />
                    </group>
                  </group>
                )}
              </group>
            );
          })}
        </group>
      )}

      {/* ROOFTOP SLAB & SOLAR PANEL ARRAY */}
      {showRoof && (
        <group position={[0, roofY, 0]}>
          <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
            <boxGeometry args={[bWidth + 3.4, 0.6, bHeight + 3.4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>

          {/* Parametric Balcony / Parapet Railing */}
          <group position={[0, 0.6, (bHeight + 3.4) / 2]}>
            <ParametricBalconyRailing
              width={bWidth + 3.4}
              height={3.5}
            />
          </group>

          {/* Rooftop Solar PV Array */}
          <group position={[-bWidth / 6, 1.4, 0]}>
            <ParametricSolarPanelArray
              width={14}
              length={10}
              angleRad={0.3}
            />
          </group>
        </group>
      )}

      {/* STRUCTURAL RCC COLUMNS GRID */}
      {design.columns.map((col) => {
        const cx = col.x - bWidth / 2;
        const cz = col.y - bHeight / 2;
        const totalHeight = (firstFloor ? 2 : 1) * (wallHeight + 0.55);

        return (
          <group key={col.id} position={[cx, totalHeight / 2, cz]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[col.width || 1.0, totalHeight, col.depth || 1.0]} />
              <meshStandardMaterial
                color={viewMode === 'columns' ? '#e11d48' : '#cbd5e1'}
                roughness={0.3}
                metalness={viewMode === 'columns' ? 0.4 : 0.1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export const BuildingViewer: React.FC<BuildingViewerProps> = ({
  design,
  selectedFloor,
  solarTimeOfDay,
  cameraPreset = 'perspective',
}) => {
  const [viewMode, setViewMode] = useState<'full' | 'exploded' | 'columns' | 'f0' | 'f1'>('full');
  const [showSurroundings, setShowSurroundings] = useState<boolean>(true);
  const [activeCamPreset, setActiveCamPreset] = useState<CameraPresetMode>(cameraPreset);

  useEffect(() => {
    setActiveCamPreset(cameraPreset);
  }, [cameraPreset]);

  // Solar Trajectory Angles
  const sunAngle = ((solarTimeOfDay - 6) / 12) * Math.PI;
  const sunX = Math.cos(sunAngle) * 90;
  const sunY = Math.sin(sunAngle) * 85;
  const sunZ = Math.sin(sunAngle * 0.5) * 45;
  const isNight = solarTimeOfDay < 6 || solarTimeOfDay > 18.5;
  const sunColor = solarTimeOfDay < 8 || solarTimeOfDay > 16 ? '#fde047' : '#ffffff';

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#080A0D] overflow-hidden select-none">
      
      {/* Top Viewport Modes Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 bg-[#11151A]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#1E2530] shadow-2xl text-xs font-mono">
        <button
          onClick={() => {
            setViewMode('full');
            setActiveCamPreset('perspective');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            viewMode === 'full' && activeCamPreset === 'perspective'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-[#171D24]'
          }`}
        >
          Perspective 3D
        </button>

        <button
          onClick={() => {
            setViewMode('full');
            setActiveCamPreset('top_down');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeCamPreset === 'top_down'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-[#171D24]'
          }`}
        >
          Top-Down CAD
        </button>

        <button
          onClick={() => {
            setViewMode('full');
            setActiveCamPreset('interior');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeCamPreset === 'interior'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-[#171D24]'
          }`}
        >
          Interior Walkthrough
        </button>

        <button
          onClick={() => {
            setViewMode('full');
            setActiveCamPreset('solar');
          }}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeCamPreset === 'solar'
              ? 'bg-amber-500 text-black shadow'
              : 'text-slate-400 hover:text-white hover:bg-[#171D24]'
          }`}
        >
          ☀️ Solar Shadows
        </button>

        <button
          onClick={() => setViewMode(viewMode === 'columns' ? 'full' : 'columns')}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            viewMode === 'columns' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-[#171D24]'
          }`}
        >
          🏛️ RCC Columns
        </button>

        <button
          onClick={() => setViewMode(viewMode === 'exploded' ? 'full' : 'exploded')}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
            viewMode === 'exploded' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-[#171D24]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Exploded
        </button>

        <button
          onClick={() => setShowSurroundings(!showSurroundings)}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
            showSurroundings ? 'bg-emerald-600 text-white shadow' : 'bg-[#080A0D] text-slate-400'
          }`}
        >
          Context {showSurroundings ? 'ON' : 'OFF'}
        </button>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[50, 35, 55]} fov={42} />
        <SmoothCameraController mode={activeCamPreset} />
        <OrbitControls target={[0, 8, 0]} maxPolarAngle={Math.PI / 2.02} />

        <ambientLight intensity={isNight ? 0.3 : 0.85} />
        <directionalLight
          position={[sunX, sunY, sunZ]}
          intensity={isNight ? 0.1 : 1.9}
          color={sunColor}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Interior Accent Lighting if in interior walkthrough */}
        {activeCamPreset === 'interior' && (
          <pointLight position={[0, 6, 0]} intensity={1.5} color="#fed7aa" distance={25} />
        )}

        <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial color="#0b131f" roughness={0.9} />
        </mesh>

        <mesh position={[0, 0.01, 22]} receiveShadow>
          <boxGeometry args={[36, 0.1, 44]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>

        <LandscapeTrees />
        <SurroundingContextBuildings enabled={showSurroundings} />
        <ParametricBuildingModel design={design} viewMode={viewMode} />
        <ContactShadows position={[0, 0, 0]} opacity={0.65} scale={95} blur={2.2} far={45} />
      </Canvas>
    </div>
  );
};
