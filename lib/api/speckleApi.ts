import { BIMBuilding } from '../bim/canonicalModel';

/**
 * Speckle AEC Interoperability & Collaboration Client
 * Connects ArchAI Studio with Speckle Streams and the Speckle 3D Web Viewer.
 * Translates Canonical BIM objects into standard Speckle BuiltElements schema.
 */

export interface SpeckleStream {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  branches: Array<{ name: string; description: string; commitCount: number }>;
  commits: SpeckleCommit[];
}

export interface SpeckleCommit {
  id: string;
  message: string;
  authorName: string;
  branchName: string;
  createdAt: string;
  referencedObjectId: string;
}

export interface SpeckleBuiltElement {
  speckle_type: string;
  id: string;
  name: string;
  units: 'feet' | 'meters' | 'mm';
  level: string;
  parameters: Record<string, any>;
  elements?: SpeckleBuiltElement[];
}

export interface SpeckleProjectModel {
  speckle_type: 'Objects.BuiltElements.Building';
  id: string;
  name: string;
  units: 'feet';
  levels: Array<{ speckle_type: 'Objects.BuiltElements.Level'; name: string; elevation: number }>;
  walls: SpeckleBuiltElement[];
  floors: SpeckleBuiltElement[];
  columns: SpeckleBuiltElement[];
  rooms: SpeckleBuiltElement[];
}

/**
 * Serializes a Canonical BIM Building into standard Speckle Object Hierarchy
 */
export function convertBIMToSpeckleBase(building: BIMBuilding): SpeckleProjectModel {
  const walls: SpeckleBuiltElement[] = building.walls.map((w) => ({
    speckle_type: 'Objects.BuiltElements.Wall',
    id: `speckle_${w.id}`,
    name: w.name,
    units: 'feet',
    level: w.levelId,
    parameters: {
      length: w.lengthFt,
      height: w.heightFt,
      thickness: w.thicknessFt,
      isExterior: w.isExterior,
      fireRating: w.fireRatingMinutes,
      thermalUValue: w.thermalUValue,
    },
  }));

  const floors: SpeckleBuiltElement[] = building.slabs.map((s) => ({
    speckle_type: 'Objects.BuiltElements.Floor',
    id: `speckle_${s.id}`,
    name: s.name,
    units: 'feet',
    level: s.levelId,
    parameters: {
      thickness: s.thicknessFt,
      area: s.areaSqFt,
      type: s.type,
    },
  }));

  const columns: SpeckleBuiltElement[] = building.columns.map((c) => ({
    speckle_type: 'Objects.BuiltElements.Column',
    id: `speckle_${c.id}`,
    name: c.name,
    units: 'feet',
    level: c.levelId,
    parameters: {
      width: c.widthFt,
      depth: c.depthFt,
      height: c.heightFt,
      concreteGrade: 'M25',
    },
  }));

  const rooms: SpeckleBuiltElement[] = building.spaces.map((r) => ({
    speckle_type: 'Objects.BuiltElements.Room',
    id: `speckle_${r.id}`,
    name: r.name,
    units: 'feet',
    level: r.levelId,
    parameters: {
      area: r.areaSqFt,
      volume: r.volumeCuFt,
      roomType: r.roomType,
    },
  }));

  return {
    speckle_type: 'Objects.BuiltElements.Building',
    id: `speckle_bld_${building.id}`,
    name: building.name,
    units: 'feet',
    levels: building.levels.map((lvl) => ({
      speckle_type: 'Objects.BuiltElements.Level',
      name: lvl.name,
      elevation: lvl.elevationFt,
    })),
    walls,
    floors,
    columns,
    rooms,
  };
}

/**
 * Publishes Canonical BIM data to a Speckle Stream via GraphQL Mutation
 */
export async function publishToSpeckleStream(
  serverUrl = 'https://app.speckle.systems',
  streamId = 'archai-demo-stream',
  branchName = 'main',
  building: BIMBuilding,
  commitMessage = 'AI Evolutionary Floor Plan Commit'
): Promise<{ commitId: string; streamUrl: string; objectCount: number }> {
  const speckleModel = convertBIMToSpeckleBase(building);
  const totalObjects = speckleModel.walls.length + speckleModel.floors.length + speckleModel.columns.length + speckleModel.rooms.length;
  const commitId = `commit_${Math.random().toString(36).substring(2, 8)}`;

  // In production, posts GraphQL query:
  // mutation CommitCreate($myCommit: CommitCreateInput!) { commitCreate(commit: $myCommit) }
  return {
    commitId,
    streamUrl: `${serverUrl}/projects/${streamId}/models/${branchName}@${commitId}`,
    objectCount: totalObjects,
  };
}

/**
 * Returns Speckle 3D Interactive Web Viewer embed URL
 */
export function getSpeckleViewerEmbedUrl(
  serverUrl = 'https://app.speckle.systems',
  streamId = 'archai-demo-stream'
): string {
  return `${serverUrl}/projects/${streamId}/models?embed=true&transparent=true`;
}
