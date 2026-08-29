/**
 * ArchAI Studio v3 - Procedural 3D Mesh Compiler (TypeScript / Three.js)
 * Compiles Canonical BuildingModel into clean 3D vertex buffers with openings, sills, and headers.
 */

import * as THREE from 'three';
import { BuildingModel, Wall, Door, Window, Slab, Roof, Column } from '@archai/building-model';

export interface Compiled3DGeometry {
  wallGeometries: THREE.BufferGeometry[];
  slabGeometries: THREE.BufferGeometry[];
  roofGeometry: THREE.BufferGeometry | null;
  columnGeometries: THREE.BufferGeometry[];
  openingCutouts: { type: 'door' | 'window'; position: [number, number, number]; dimensions: [number, number, number] }[];
}

/**
 * Builds parametric wall solid with cutout holes for doors and windows.
 */
export function compileWallGeometry(
  wall: Wall,
  doors: Door[],
  windows: Window[],
  baseElevation: number
): THREE.BufferGeometry[] {
  const p1 = wall.start_point;
  const p2 = wall.end_point;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const wallLength = Math.sqrt(dx * dx + dy * dy);
  const wallAngle = Math.atan2(dy, dx);
  const thickness = wall.thickness_inches / 12; // convert to feet
  const height = wall.height_ft;

  const relevantDoors = doors.filter((d) => d.wall_id === wall.id);
  const relevantWindows = windows.filter((w) => w.wall_id === wall.id);

  const geometries: THREE.BufferGeometry[] = [];

  // If no openings, simple extruded box
  if (relevantDoors.length === 0 && relevantWindows.length === 0) {
    const geom = new THREE.BoxGeometry(wallLength, height, thickness);
    // Center of wall in 3D
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const midZ = baseElevation + height / 2;

    geom.rotateY(-wallAngle);
    geom.translate(midX, midZ, midY);
    return [geom];
  }

  // Segment wall into segments between openings
  const cutouts: { offset: number; width: number; height: number; sill: number }[] = [];
  relevantDoors.forEach((d) => {
    cutouts.push({ offset: d.offset_along_wall_ft, width: d.width_ft, height: d.height_ft, sill: d.sill_height_ft });
  });
  relevantWindows.forEach((w) => {
    cutouts.push({ offset: w.offset_along_wall_ft, width: w.width_ft, height: w.height_ft, sill: w.sill_height_ft });
  });

  cutouts.sort((a, b) => a.offset - b.offset);

  let currentOffset = 0;
  cutouts.forEach((cut) => {
    // 1. Left solid segment
    const leftLen = cut.offset - currentOffset;
    if (leftLen > 0.1) {
      const leftGeom = new THREE.BoxGeometry(leftLen, height, thickness);
      const segMidOffset = currentOffset + leftLen / 2;
      const posX = p1.x + (dx / wallLength) * segMidOffset;
      const posY = p1.y + (dy / wallLength) * segMidOffset;
      leftGeom.rotateY(-wallAngle);
      leftGeom.translate(posX, baseElevation + height / 2, posY);
      geometries.push(leftGeom);
    }

    // 2. Bottom sill solid (if window)
    if (cut.sill > 0.1) {
      const sillGeom = new THREE.BoxGeometry(cut.width, cut.sill, thickness);
      const segMidOffset = cut.offset + cut.width / 2;
      const posX = p1.x + (dx / wallLength) * segMidOffset;
      const posY = p1.y + (dy / wallLength) * segMidOffset;
      sillGeom.rotateY(-wallAngle);
      sillGeom.translate(posX, baseElevation + cut.sill / 2, posY);
      geometries.push(sillGeom);
    }

    // 3. Top header solid (above door / window)
    const headerHeight = height - (cut.sill + cut.height);
    if (headerHeight > 0.1) {
      const headerGeom = new THREE.BoxGeometry(cut.width, headerHeight, thickness);
      const segMidOffset = cut.offset + cut.width / 2;
      const posX = p1.x + (dx / wallLength) * segMidOffset;
      const posY = p1.y + (dy / wallLength) * segMidOffset;
      headerGeom.rotateY(-wallAngle);
      headerGeom.translate(posX, baseElevation + cut.sill + cut.height + headerHeight / 2, posY);
      geometries.push(headerGeom);
    }

    currentOffset = cut.offset + cut.width;
  });

  // Remaining right segment
  const rightLen = wallLength - currentOffset;
  if (rightLen > 0.1) {
    const rightGeom = new THREE.BoxGeometry(rightLen, height, thickness);
    const segMidOffset = currentOffset + rightLen / 2;
    const posX = p1.x + (dx / wallLength) * segMidOffset;
    const posY = p1.y + (dy / wallLength) * segMidOffset;
    rightGeom.rotateY(-wallAngle);
    rightGeom.translate(posX, baseElevation + height / 2, posY);
    geometries.push(rightGeom);
  }

  return geometries;
}

/**
 * Compiles a floor slab polygon into an extruded 3D slab geometry.
 */
export function compileSlabGeometry(slab: Slab): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const pts = slab.boundary;
  if (pts.length > 0) {
    shape.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      shape.lineTo(pts[i].x, pts[i].y);
    }
    shape.closePath();
  }

  // Cutouts (stairs / shafts)
  slab.openings.forEach((opening) => {
    if (opening.length > 2) {
      const hole = new THREE.Path();
      hole.moveTo(opening[0].x, opening[0].y);
      for (let i = 1; i < opening.length; i++) {
        hole.lineTo(opening[i].x, opening[i].y);
      }
      hole.closePath();
      shape.holes.push(hole);
    }
  });

  const thickness = slab.thickness_inches / 12;
  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: false,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.rotateX(Math.PI / 2);
  geom.translate(0, slab.elevation_ft, 0);
  return geom;
}

/**
 * Compiles structural RCC columns into vertical columns.
 */
export function compileColumnGeometry(col: Column, baseElevation: number): THREE.BufferGeometry {
  const w = col.width_inches / 12;
  const d = col.depth_inches / 12;
  const h = col.height_ft;
  const geom = new THREE.BoxGeometry(w, h, d);
  geom.translate(col.position.x, baseElevation + h / 2, col.position.y);
  return geom;
}

/**
 * Master compiler converting BuildingModel into 3D geometries.
 */
export function compileBuildingModel3D(model: BuildingModel): Compiled3DGeometry {
  const wallGeometries: THREE.BufferGeometry[] = [];
  const slabGeometries: THREE.BufferGeometry[] = [];
  const columnGeometries: THREE.BufferGeometry[] = [];
  const openingCutouts: Compiled3DGeometry['openingCutouts'] = [];

  // Compile slabs
  model.slabs.forEach((slab) => {
    slabGeometries.push(compileSlabGeometry(slab));
  });

  // Compile walls per level
  model.levels.forEach((level) => {
    const levelWalls = model.walls.filter((w) => w.level_index === level.level_index);
    levelWalls.forEach((wall) => {
      const wallGeoms = compileWallGeometry(wall, model.doors, model.windows, level.elevation_ft);
      wallGeometries.push(...wallGeoms);
    });

    const levelCols = model.columns.filter((c) => c.level_index === level.level_index);
    levelCols.forEach((col) => {
      columnGeometries.push(compileColumnGeometry(col, level.elevation_ft));
    });
  });

  // Compile roof
  let roofGeom: THREE.BufferGeometry | null = null;
  if (model.roof) {
    const roofShape = new THREE.Shape();
    const rpts = model.roof.boundary;
    if (rpts.length > 0) {
      roofShape.moveTo(rpts[0].x, rpts[0].y);
      for (let i = 1; i < rpts.length; i++) {
        roofShape.lineTo(rpts[i].x, rpts[i].y);
      }
      roofShape.closePath();
    }
    const maxElevation = Math.max(...model.levels.map((l) => l.elevation_ft + l.floor_to_floor_height_ft), 10.0);
    const extrudeSettings = { depth: 0.75, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1 };
    roofGeom = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    roofGeom.rotateX(Math.PI / 2);
    roofGeom.translate(0, maxElevation, 0);
  }

  return {
    wallGeometries,
    slabGeometries,
    roofGeometry: roofGeom,
    columnGeometries,
    openingCutouts,
  };
}
