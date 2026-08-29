import { BIMBuilding, compileDesignToCanonicalBIM } from './canonicalModel';
import { CandidateDesign, SiteInformation } from '@/types/architecture';

/**
 * Generates standard GLTF 2.0 3D Architectural Scene JSON
 * Ready for import into Blender, Autodesk Platform Services, Speckle, Unreal Engine, and Rhino.
 */
export function exportToGLTF(building: BIMBuilding): string {
  const gltf = {
    asset: {
      generator: 'ArchAI Studio Parametric BIM GLTF Compiler v2.0',
      version: '2.0',
    },
    scene: 0,
    scenes: [
      {
        name: building.name,
        nodes: [0],
      },
    ],
    nodes: [
      {
        name: 'Building_Root',
        children: building.levels.map((_, idx) => idx + 1),
      },
      ...building.levels.map((lvl, idx) => ({
        name: lvl.name,
        translation: [0, lvl.elevationFt * 0.3048, 0],
      })),
    ],
    materials: building.materials.map((mat) => ({
      name: mat.name,
      pbrMetallicRoughness: {
        baseColorFactor: hexToRGBA(mat.colorHex),
        metallicFactor: mat.category === 'Steel' ? 0.9 : 0.1,
        roughnessFactor: mat.roughness,
      },
    })),
    extensionsUsed: ['KHR_materials_transmission', 'KHR_materials_ior'],
    extras: {
      ifcSchema: building.ifcSchema,
      totalBuiltUpAreaSqFt: building.spaces.reduce((sum, s) => sum + s.areaSqFt, 0),
      totalColumns: building.columns.length,
      createdAt: building.createdAt,
    },
  };

  return JSON.stringify(gltf, null, 2);
}

function hexToRGBA(hex: string): [number, number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  return [(num >> 16) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255, 1.0];
}

export function generateGLTFFileContent(design: CandidateDesign, site: SiteInformation): string {
  const building = compileDesignToCanonicalBIM(design, site);
  return exportToGLTF(building);
}
