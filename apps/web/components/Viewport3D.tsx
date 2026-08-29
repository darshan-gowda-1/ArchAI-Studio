'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { BuildingModel } from '@archai/building-model';
import { useBuildingStore, ViewerMode, MeasuringMode } from '../stores/buildingStore';
import {
  Eye,
  Layers,
  Ruler,
  Maximize2,
  Sun,
  Moon,
  Box,
  Compass,
  Scissors,
  Sparkles,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface Viewport3DProps {
  model: BuildingModel;
  sunHour?: number;
  showWireframe?: boolean;
}

export default function Viewport3D({ model, sunHour = 14, showWireframe = false }: Viewport3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const {
    viewerMode,
    setViewerMode,
    measuringMode,
    setMeasuringMode,
    measureResult,
    setMeasureResult,
    showStructural,
    setShowStructural,
    showFurniture,
    setShowFurniture,
    visibleLevelFilter,
    setVisibleLevelFilter,
    sectionCutZ,
    setSectionCutZ,
    explodedFactor,
    setExplodedFactor,
    selectedElementInfo,
    setSelectedElementInfo,
  } = useBuildingStore();

  const [measurePoints, setMeasurePoints] = useState<THREE.Vector3[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const isNight = viewerMode === 'Night';
    scene.background = new THREE.Color(isNight ? '#030712' : '#09090b');

    let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    if (viewerMode === 'Floor-plan') {
      const aspect = width / height;
      const d = 25;
      camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
      camera.position.set(15, 60, 20);
      camera.lookAt(15, 0, 20);
    } else if (viewerMode === 'First-person') {
      camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 500);
      camera.position.set(12, 5.5, 12); // eye level 5.5 ft inside living room
      camera.lookAt(20, 5.5, 20);
    } else {
      camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
      camera.position.set(40, 40, 55);
      camera.lookAt(15, 8, 20);
    }

    // 2. WebGL Renderer with Shadow & Clipping support
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Enable section clipping plane if mode is 'Section'
    if (viewerMode === 'Section') {
      renderer.localClippingEnabled = true;
    }

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting based on Viewer Mode
    if (isNight) {
      const moonLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
      moonLight.position.set(-20, 40, -20);
      scene.add(moonLight);

      const warmInterior = new THREE.PointLight(0xf59e0b, 2.5, 40, 2);
      warmInterior.position.set(15, 8, 15);
      scene.add(warmInterior);

      const warmInterior2 = new THREE.PointLight(0xfbbf24, 2.0, 30, 2);
      warmInterior2.position.set(22, 18, 18);
      scene.add(warmInterior2);
    } else {
      const ambientLight = new THREE.AmbientLight(0xffffff, viewerMode === 'BIM' ? 0.9 : 0.65);
      scene.add(ambientLight);

      const sunAngle = ((sunHour - 6) / 12) * Math.PI;
      const sunX = 50 * Math.cos(sunAngle);
      const sunY = Math.max(10, 50 * Math.sin(sunAngle));
      const sunZ = 35;

      const dirLight = new THREE.DirectionalLight(0xfff7ed, viewerMode === 'Daylight' ? 2.2 : 1.6);
      dirLight.position.set(sunX, sunY, sunZ);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      scene.add(dirLight);
    }

    // 4. Ground Grid
    const grid = new THREE.GridHelper(90, 45, 0x3f3f46, 0x18181b);
    grid.position.set(15, -0.05, 20);
    scene.add(grid);

    // 5. Section Clipping Plane
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), sectionCutZ);

    // 6. Materials by Viewer Mode
    const isBIM = viewerMode === 'BIM';
    const isMaterial = viewerMode === 'Material';

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: isBIM ? 0x0284c7 : isMaterial ? 0xf1f5f9 : 0xe4e4e7,
      roughness: isMaterial ? 0.8 : 0.5,
      metalness: 0.05,
      wireframe: showWireframe,
      clippingPlanes: viewerMode === 'Section' ? [clipPlane] : [],
      clipShadows: true,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: isBIM ? 0x06b6d4 : 0x38bdf8,
      transparent: true,
      opacity: isBIM ? 0.8 : 0.45,
      roughness: 0.1,
      transmission: 0.85,
      thickness: 0.5,
      clippingPlanes: viewerMode === 'Section' ? [clipPlane] : [],
    });

    const doorMaterial = new THREE.MeshStandardMaterial({
      color: isBIM ? 0xa855f7 : isMaterial ? 0x78350f : 0x9a3412,
      roughness: 0.4,
      metalness: 0.1,
      clippingPlanes: viewerMode === 'Section' ? [clipPlane] : [],
    });

    const slabMaterial = new THREE.MeshStandardMaterial({
      color: isBIM ? 0x64748b : isMaterial ? 0x334155 : 0x27272a,
      roughness: isMaterial ? 0.9 : 0.6,
      metalness: 0.1,
      wireframe: showWireframe,
      clippingPlanes: viewerMode === 'Section' ? [clipPlane] : [],
    });

    const columnMaterial = new THREE.MeshStandardMaterial({
      color: isBIM ? 0xef4444 : 0xf59e0b,
      roughness: 0.3,
      metalness: 0.2,
      clippingPlanes: viewerMode === 'Section' ? [clipPlane] : [],
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: isBIM ? 0x10b981 : 0x18181b,
      roughness: 0.7,
      wireframe: showWireframe,
      clippingPlanes: viewerMode === 'Section' ? [clipPlane] : [],
    });

    const solarMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.2,
      metalness: 0.8,
    });

    // 7. Interactive Objects Array for Raycasting
    const interactiveObjects: THREE.Object3D[] = [];

    // 8. Build Geometry Elements with Exploded Height Displacement
    const getLevelOffsetZ = (lvlIdx: number) => {
      if (viewerMode === 'Exploded') {
        return lvlIdx * (12.0 * (1.0 + explodedFactor));
      }
      return 0.0;
    };

    model.levels.forEach((lvl) => {
      if (visibleLevelFilter !== 'all' && visibleLevelFilter !== lvl.level_index) {
        return; // filtered out level
      }

      const explodedY = getLevelOffsetZ(lvl.level_index);

      // A. Slabs
      const levelSlabs = model.slabs.filter((s) => s.level_index === lvl.level_index);
      levelSlabs.forEach((slab) => {
        const shape = new THREE.Shape();
        const pts = slab.boundary;
        if (pts.length > 0) {
          shape.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            shape.lineTo(pts[i].x, pts[i].y);
          }
          shape.closePath();
        }
        const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false });
        geom.rotateX(Math.PI / 2);
        const mesh = new THREE.Mesh(geom, slabMaterial);
        mesh.position.set(0, lvl.elevation_ft + explodedY, 0);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.userData = { type: 'slab', id: slab.id, name: `Floor Slab L${lvl.level_index}`, level: lvl.level_index };
        scene.add(mesh);
        interactiveObjects.push(mesh);
      });

      // B. Walls
      const levelWalls = model.walls.filter((w) => w.level_index === lvl.level_index);
      levelWalls.forEach((w) => {
        const dx = w.end_point.x - w.start_point.x;
        const dy = w.end_point.y - w.start_point.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const th = (w.thickness_inches || 9) / 12;
        const h = w.height_ft || 10;

        const geom = new THREE.BoxGeometry(length, h, th);
        const mesh = new THREE.Mesh(geom, wallMaterial);

        const midX = (w.start_point.x + w.end_point.x) / 2;
        const midY = (w.start_point.y + w.end_point.y) / 2;

        mesh.rotation.y = -angle;
        mesh.position.set(midX, lvl.elevation_ft + h / 2 + explodedY, midY);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = {
          type: 'wall',
          id: w.id,
          name: `Wall ${w.id}`,
          level: lvl.level_index,
          properties: { length_ft: length.toFixed(1), height_ft: h, thickness_in: w.thickness_inches || 9 },
        };
        scene.add(mesh);
        interactiveObjects.push(mesh);
      });

      // C. Windows
      const levelWindows = model.windows.filter((win) => win.level_index === lvl.level_index);
      levelWindows.forEach((win) => {
        const wall = model.walls.find((w) => w.id === win.wall_id);
        if (wall) {
          const dx = wall.end_point.x - wall.start_point.x;
          const dy = wall.end_point.y - wall.start_point.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          const glassGeom = new THREE.BoxGeometry(win.width_ft, win.height_ft, 0.2);
          const glassMesh = new THREE.Mesh(glassGeom, glassMaterial);

          const posX = wall.start_point.x + (dx / length) * (win.offset_along_wall_ft + win.width_ft / 2);
          const posY = wall.start_point.y + (dy / length) * (win.offset_along_wall_ft + win.width_ft / 2);

          glassMesh.rotation.y = -angle;
          glassMesh.position.set(posX, lvl.elevation_ft + win.sill_height_ft + win.height_ft / 2 + explodedY, posY);
          glassMesh.userData = {
            type: 'window',
            id: win.id,
            name: `Window ${win.width_ft}x${win.height_ft}ft`,
            level: lvl.level_index,
            properties: { width_ft: win.width_ft, height_ft: win.height_ft, sill_ft: win.sill_height_ft },
          };
          scene.add(glassMesh);
          interactiveObjects.push(glassMesh);
        }
      });

      // D. Doors
      const levelDoors = model.doors.filter((d) => d.level_index === lvl.level_index);
      levelDoors.forEach((door) => {
        const wall = model.walls.find((w) => w.id === door.wall_id);
        if (wall) {
          const dx = wall.end_point.x - wall.start_point.x;
          const dy = wall.end_point.y - wall.start_point.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          const doorGeom = new THREE.BoxGeometry(door.width_ft, door.height_ft, 0.25);
          const doorMesh = new THREE.Mesh(doorGeom, doorMaterial);

          const posX = wall.start_point.x + (dx / length) * (door.offset_along_wall_ft + door.width_ft / 2);
          const posY = wall.start_point.y + (dy / length) * (door.offset_along_wall_ft + door.width_ft / 2);

          doorMesh.rotation.y = -angle;
          doorMesh.position.set(posX, lvl.elevation_ft + door.height_ft / 2 + explodedY, posY);
          doorMesh.userData = {
            type: 'door',
            id: door.id,
            name: `Door ${door.door_style || 'Flush Teak'}`,
            level: lvl.level_index,
            properties: { width_ft: door.width_ft, height_ft: door.height_ft, style: door.door_style },
          };
          scene.add(doorMesh);
          interactiveObjects.push(doorMesh);
        }
      });

      // E. Structural Columns (Toggleable)
      if (showStructural) {
        const levelCols = model.columns.filter((c) => c.level_index === lvl.level_index);
        levelCols.forEach((col) => {
          const colGeom = new THREE.BoxGeometry(0.75, col.height_ft || 10, 1.25);
          const colMesh = new THREE.Mesh(colGeom, columnMaterial);
          colMesh.position.set(col.position.x, lvl.elevation_ft + (col.height_ft || 10) / 2 + explodedY, col.position.y);
          colMesh.castShadow = true;
          colMesh.userData = {
            type: 'column',
            id: col.id,
            name: `RCC Column ${col.id}`,
            level: lvl.level_index,
            properties: { section: '230x380mm M25', height_ft: col.height_ft || 10 },
          };
          scene.add(colMesh);
          interactiveObjects.push(colMesh);
        });
      }

      // F. Furniture (Toggleable)
      if (showFurniture) {
        const levelSpaces = model.spaces.filter((s) => s.level_index === lvl.level_index);
        levelSpaces.forEach((spc) => {
          if (spc.polygon_2d && spc.polygon_2d.length >= 4) {
            const xs = spc.polygon_2d.map((p) => p.x);
            const ys = spc.polygon_2d.map((p) => p.y);
            const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
            const cy = (Math.min(...ys) + Math.max(...ys)) / 2;

            const tableGeom = new THREE.BoxGeometry(3.0, 1.5, 4.0);
            const tableMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.3 });
            const tableMesh = new THREE.Mesh(tableGeom, tableMat);
            tableMesh.position.set(cx, lvl.elevation_ft + 0.75 + explodedY, cy);
            tableMesh.userData = {
              type: 'furniture',
              id: `furn_${spc.id}`,
              name: `Interior Layout - ${spc.name}`,
              level: lvl.level_index,
              properties: { space: spc.name, area_sqft: spc.area_sqft },
            };
            scene.add(tableMesh);
            interactiveObjects.push(tableMesh);
          }
        });
      }
    });

    // 9. Roof Structure & PV array
    if (model.roof && (visibleLevelFilter === 'all' || visibleLevelFilter === 2)) {
      const topElevation = Math.max(...model.levels.map((l) => l.elevation_ft + l.floor_to_floor_height_ft), 20.0);
      const explodedY = getLevelOffsetZ(2);
      const rShape = new THREE.Shape();
      const rpts = model.roof.boundary;
      if (rpts.length > 0) {
        rShape.moveTo(rpts[0].x, rpts[0].y);
        for (let i = 1; i < rpts.length; i++) {
          rShape.lineTo(rpts[i].x, rpts[i].y);
        }
        rShape.closePath();
      }
      const rGeom = new THREE.ExtrudeGeometry(rShape, { depth: 0.75, bevelEnabled: false });
      rGeom.rotateX(Math.PI / 2);
      const rMesh = new THREE.Mesh(rGeom, roofMaterial);
      rMesh.position.set(0, topElevation + explodedY, 0);
      rMesh.receiveShadow = true;
      scene.add(rMesh);

      // Solar PV Panels
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 7; c++) {
          const panelGeom = new THREE.BoxGeometry(3.0, 0.1, 5.0);
          panelGeom.rotateX(THREE.MathUtils.degToRad(18));
          const panelMesh = new THREE.Mesh(panelGeom, solarMaterial);
          panelMesh.position.set(6 + c * 3.4, topElevation + 1.2 + explodedY, 12 + r * 6.5);
          scene.add(panelMesh);
        }
      }
    }

    // 10. Measuring Tool Interaction & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (measuringMode === 'distance' || measuringMode === 'area') {
        if (intersects.length > 0) {
          const hitPoint = intersects[0].point;
          const newPts = [...measurePoints, hitPoint];
          setMeasurePoints(newPts);

          if (measuringMode === 'distance' && newPts.length >= 2) {
            const p1 = newPts[newPts.length - 2];
            const p2 = newPts[newPts.length - 1];
            const distFt = p1.distanceTo(p2);
            const distM = distFt * 0.3048;
            setMeasureResult(`Distance: ${distFt.toFixed(2)} ft (${distM.toFixed(2)} m)`);
          } else if (measuringMode === 'area' && newPts.length >= 3) {
            // Shoelace formula for 2D X-Z polygon area
            let area = 0;
            const n = newPts.length;
            for (let i = 0; i < n; i++) {
              const j = (i + 1) % n;
              area += newPts[i].x * newPts[j].z;
              area -= newPts[j].x * newPts[i].z;
            }
            area = Math.abs(area) / 2.0;
            const areaSqm = area * 0.092903;
            setMeasureResult(`Enclosed Area: ${area.toFixed(1)} sq ft (${areaSqm.toFixed(1)} m²)`);
          }
        }
      } else {
        // Selection Raycast
        if (intersects.length > 0) {
          const topHit = intersects[0].object;
          if (topHit.userData && topHit.userData.id) {
            setSelectedElementInfo({
              id: topHit.userData.id,
              type: topHit.userData.type,
              name: topHit.userData.name || topHit.userData.id,
              level: topHit.userData.level || 0,
              properties: topHit.userData.properties || {},
            });
          }
        }
      }
    };

    container.addEventListener('click', handleClick);

    // 11. Orbit / Walkthrough Camera Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = new THREE.Spherical(70, Math.PI / 3.2, Math.PI / 4);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (viewerMode === 'Orbit' || viewerMode === 'Exploded' || viewerMode === 'Section' || viewerMode === 'Daylight' || viewerMode === 'Night' || viewerMode === 'Material' || viewerMode === 'BIM') {
        spherical.theta -= deltaX * 0.008;
        spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.008));
        camera.position.setFromSpherical(spherical).add(new THREE.Vector3(15, 8, 20));
        camera.lookAt(15, 8, 20);
      } else if (viewerMode === 'Walkthrough' || viewerMode === 'First-person') {
        camera.rotation.y -= deltaX * 0.004;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      }
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [
    model,
    sunHour,
    showWireframe,
    viewerMode,
    visibleLevelFilter,
    showStructural,
    showFurniture,
    sectionCutZ,
    explodedFactor,
    measuringMode,
    measurePoints,
  ]);

  const viewerModes: ViewerMode[] = [
    'Orbit',
    'Walkthrough',
    'First-person',
    'Floor-plan',
    'Section',
    'Exploded',
    'Daylight',
    'Night',
    'Material',
    'BIM',
  ];

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Floating Top Mode Selector Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1 bg-neutral-950/80 backdrop-blur-md p-1.5 rounded-xl border border-neutral-800/80 shadow-2xl pointer-events-auto overflow-x-auto max-w-full">
          {viewerModes.map((mode) => (
            <button
              key={mode}
              onClick={() => setViewerMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-1.5 shrink-0 ${
                viewerMode === mode
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              {mode === 'Daylight' && <Sun className="w-3.5 h-3.5" />}
              {mode === 'Night' && <Moon className="w-3.5 h-3.5" />}
              {mode === 'BIM' && <Layers className="w-3.5 h-3.5" />}
              {mode === 'Section' && <Scissors className="w-3.5 h-3.5" />}
              {mode === 'Exploded' && <Maximize2 className="w-3.5 h-3.5" />}
              {mode}
            </button>
          ))}
        </div>

        {/* Quick Action Tools: Measuring, Structural & Furniture Toggles */}
        <div className="flex items-center gap-2 bg-neutral-950/80 backdrop-blur-md p-1.5 rounded-xl border border-neutral-800/80 shadow-2xl pointer-events-auto">
          <button
            onClick={() => setMeasuringMode(measuringMode === 'distance' ? 'none' : 'distance')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              measuringMode === 'distance' ? 'bg-amber-500 text-black font-bold' : 'text-neutral-300 hover:bg-neutral-800'
            }`}
            title="Measure Distance between two points"
          >
            <Ruler className="w-3.5 h-3.5" /> Measure Distance
          </button>

          <button
            onClick={() => setMeasuringMode(measuringMode === 'area' ? 'none' : 'area')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              measuringMode === 'area' ? 'bg-amber-500 text-black font-bold' : 'text-neutral-300 hover:bg-neutral-800'
            }`}
            title="Measure Polygon Area"
          >
            <Box className="w-3.5 h-3.5" /> Measure Area
          </button>

          <button
            onClick={() => setShowStructural(!showStructural)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              showStructural ? 'bg-neutral-800 text-amber-400' : 'text-neutral-500 hover:bg-neutral-800'
            }`}
          >
            Structural Frame
          </button>

          <button
            onClick={() => setShowFurniture(!showFurniture)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
              showFurniture ? 'bg-neutral-800 text-amber-400' : 'text-neutral-500 hover:bg-neutral-800'
            }`}
          >
            Furniture
          </button>
        </div>
      </div>

      {/* Mode Sub-Sliders (Section Cut or Exploded Factor) */}
      {viewerMode === 'Section' && (
        <div className="absolute top-16 left-4 z-20 bg-neutral-950/90 backdrop-blur-md p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300 flex items-center gap-3">
          <Scissors className="w-4 h-4 text-amber-400" />
          <span>Section Height:</span>
          <input
            type="range"
            min={0}
            max={25}
            step={0.5}
            value={sectionCutZ}
            onChange={(e) => setSectionCutZ(parseFloat(e.target.value))}
            className="accent-amber-500 w-36"
          />
          <span className="font-mono text-amber-400 font-bold">{sectionCutZ} ft</span>
        </div>
      )}

      {viewerMode === 'Exploded' && (
        <div className="absolute top-16 left-4 z-20 bg-neutral-950/90 backdrop-blur-md p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300 flex items-center gap-3">
          <Maximize2 className="w-4 h-4 text-amber-400" />
          <span>Explosion Separation:</span>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={explodedFactor}
            onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
            className="accent-amber-500 w-36"
          />
          <span className="font-mono text-amber-400 font-bold">{explodedFactor.toFixed(1)}x</span>
        </div>
      )}

      {/* Active Measuring Tool Feedback HUD */}
      {measureResult && (
        <div className="absolute bottom-6 left-6 z-20 bg-neutral-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-2xl flex items-center gap-2 animate-fade-in">
          <Ruler className="w-4 h-4 text-amber-400" />
          <span>{measureResult}</span>
          <button
            onClick={() => {
              setMeasureResult(null);
              setMeasurePoints([]);
            }}
            className="ml-2 text-neutral-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Selected Element Property Inspector Overlay */}
      {selectedElementInfo && (
        <div className="absolute bottom-6 right-6 z-20 bg-neutral-950/95 backdrop-blur-lg p-4 rounded-xl border border-amber-500/30 text-xs text-neutral-300 w-72 shadow-2xl">
          <div className="flex justify-between items-start mb-2 pb-2 border-b border-neutral-800">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                {selectedElementInfo.type}
              </span>
              <h4 className="font-bold text-white text-sm">{selectedElementInfo.name}</h4>
            </div>
            <button onClick={() => setSelectedElementInfo(null)} className="text-neutral-500 hover:text-white">
              ×
            </button>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>Level:</span>
              <span className="text-white">L{selectedElementInfo.level}</span>
            </div>
            {Object.entries(selectedElementInfo.properties).map(([k, v]) => (
              <div key={k} className="flex justify-between text-neutral-400">
                <span className="capitalize">{k.replace('_', ' ')}:</span>
                <span className="text-white">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full flex-1 min-h-[500px] cursor-grab active:cursor-grabbing relative" />
    </div>
  );
}
