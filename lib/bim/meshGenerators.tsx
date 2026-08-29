import React from 'react';
import * as THREE from 'three';

/**
 * Parametric Wall with True Geometric Window/Door Openings (Sill, Jambs, Lintel)
 */
export function ParametricWallWithOpening({
  length,
  height,
  thickness = 0.5,
  windowWidth,
  windowHeight = 4.5,
  sillHeight = 3.0,
  hasDoor = false,
  doorWidth = 3.5,
  doorHeight = 7.0,
  materialColor = '#ffffff',
}: {
  length: number;
  height: number;
  thickness?: number;
  windowWidth?: number;
  windowHeight?: number;
  sillHeight?: number;
  hasDoor?: boolean;
  doorWidth?: number;
  doorHeight?: number;
  materialColor?: string;
}) {
  // If solid wall with no openings
  if (!windowWidth && !hasDoor) {
    return (
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, height, thickness]} />
        <meshStandardMaterial color={materialColor} roughness={0.4} />
      </mesh>
    );
  }

  // Wall with Window Cutout: Composed of Bottom Sill Panel, Left Jamb, Right Jamb, Top Lintel
  if (windowWidth) {
    const wWidth = Math.min(length * 0.7, windowWidth);
    const sideW = Math.max(0.5, (length - wWidth) / 2);
    const lintelH = Math.max(0.5, height - (sillHeight + windowHeight));

    return (
      <group>
        {/* Bottom Sill Wall Panel */}
        <mesh position={[0, sillHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[length, sillHeight, thickness]} />
          <meshStandardMaterial color={materialColor} roughness={0.4} />
        </mesh>

        {/* Left Jamb Wall Panel */}
        <mesh position={[-length / 2 + sideW / 2, sillHeight + windowHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[sideW, windowHeight, thickness]} />
          <meshStandardMaterial color={materialColor} roughness={0.4} />
        </mesh>

        {/* Right Jamb Wall Panel */}
        <mesh position={[length / 2 - sideW / 2, sillHeight + windowHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[sideW, windowHeight, thickness]} />
          <meshStandardMaterial color={materialColor} roughness={0.4} />
        </mesh>

        {/* Top Lintel Wall Panel */}
        <mesh position={[0, height - lintelH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[length, lintelH, thickness]} />
          <meshStandardMaterial color={materialColor} roughness={0.4} />
        </mesh>

        {/* Parametric Window Frame & Glass Assembly */}
        <group position={[0, sillHeight + windowHeight / 2, 0]}>
          {/* Outer UPVC/Aluminum Frame */}
          <mesh castShadow>
            <boxGeometry args={[wWidth, windowHeight, thickness + 0.15]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Dual-Pane Glazed Glass */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[wWidth - 0.3, windowHeight - 0.3, 0.08]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transmission={0.92}
              transparent
              opacity={0.65}
              roughness={0.05}
              ior={1.5}
            />
          </mesh>
          {/* Central Vertical Mullion */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.15, windowHeight - 0.2, thickness + 0.18]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        </group>
      </group>
    );
  }

  // Wall with Door Cutout
  if (hasDoor) {
    const dW = Math.min(length * 0.8, doorWidth);
    const sideW = Math.max(0.5, (length - dW) / 2);
    const lintelH = Math.max(0.5, height - doorHeight);

    return (
      <group>
        {/* Left Side Panel */}
        <mesh position={[-length / 2 + sideW / 2, doorHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[sideW, doorHeight, thickness]} />
          <meshStandardMaterial color={materialColor} roughness={0.4} />
        </mesh>

        {/* Right Side Panel */}
        <mesh position={[length / 2 - sideW / 2, doorHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[sideW, doorHeight, thickness]} />
          <meshStandardMaterial color={materialColor} roughness={0.4} />
        </mesh>

        {/* Lintel Panel */}
        <mesh position={[0, height - lintelH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[length, lintelH, thickness]} />
          <meshStandardMaterial color={materialColor} roughness={0.4} />
        </mesh>

        {/* Door Frame & Teakwood Panel */}
        <group position={[0, doorHeight / 2, 0]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[dW - 0.1, doorHeight - 0.1, thickness * 0.6]} />
            <meshStandardMaterial color="#78350f" roughness={0.3} />
          </mesh>
          {/* Metallic Door Handle */}
          <mesh position={[dW * 0.35, 0, thickness * 0.35]}>
            <boxGeometry args={[0.15, 0.8, 0.25]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>
    );
  }

  return null;
}

/**
 * Parametric Balcony Glass Railing with Steel Balusters & Handrail
 */
export function ParametricBalconyRailing({
  width,
  height = 3.5,
}: {
  width: number;
  height?: number;
}) {
  return (
    <group position={[0, height / 2, 0]}>
      {/* Tempered Glass Panel */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, height - 0.4, 0.1]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.9}
          transparent
          opacity={0.6}
          roughness={0.1}
        />
      </mesh>

      {/* Top Stainless Steel Handrail */}
      <mesh position={[0, height / 2 - 0.1, 0]} castShadow>
        <boxGeometry args={[width + 0.2, 0.2, 0.25]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Bottom Shoe Base Channel */}
      <mesh position={[0, -height / 2 + 0.1, 0]} castShadow>
        <boxGeometry args={[width, 0.2, 0.3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Parametric Solar Photovoltaic Racking System on Roof Deck
 */
export function ParametricSolarPanelArray({
  width = 14,
  length = 9,
  angleRad = 0.25,
}: {
  width?: number;
  length?: number;
  angleRad?: number;
}) {
  return (
    <group rotation={[angleRad, 0, 0]}>
      {/* Aluminum Support Truss Legs */}
      {[-width / 2 + 1, width / 2 - 1].map((lx, idx) => (
        <mesh key={idx} position={[lx, -0.4, 0]} castShadow>
          <boxGeometry args={[0.2, 0.8, length]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} />
        </mesh>
      ))}

      {/* Monocrystalline PV Cells Array */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[width, 0.15, length]} />
        <meshStandardMaterial color="#0369a1" roughness={0.1} metalness={0.85} />
      </mesh>

      {/* Aluminum Perimeter Frame */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[width + 0.1, 0.18, length + 0.1]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>
    </group>
  );
}
