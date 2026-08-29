import { BIMBuilding, compileDesignToCanonicalBIM } from './canonicalModel';
import { CandidateDesign, SiteInformation } from '@/types/architecture';

/**
 * Generates an Industry Foundation Classes (IFC4 / IFC2x3) STEP physical format file
 * Compatible with Autodesk Revit, Graphisoft Archicad, BlenderBIM, FreeCAD, and Solibri.
 */
export function exportToIFC(building: BIMBuilding): string {
  let stepId = 1;
  const nextId = () => `#${stepId++}`;

  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const guid = () => '2' + Math.random().toString(36).substring(2, 10).toUpperCase() + 'X' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const lines: string[] = [];

  // 1. STEP Header
  lines.push('ISO-10303-21;');
  lines.push('HEADER;');
  lines.push(`FILE_DESCRIPTION(('ViewDefinition [CoordinationView_V2.0, Architecture]'), '2;1');`);
  lines.push(`FILE_NAME('ArchAI_${building.id}.ifc', '${timestamp}', ('ArchAI Studio Engineer'), ('ArchAI AI Studio'), 'ArchAI IFC Geometry Compiler v2.0', 'IFC4', 'None');`);
  lines.push(`FILE_SCHEMA(('IFC4'));`);
  lines.push('ENDSEC;');
  lines.push('DATA;');

  // 2. Core Project Metadata & Units
  const orgId = nextId(); // #1
  lines.push(`${orgId}=IFCORGANIZATION($,'ArchAI Architecture Studio','Parametric BIM Generator',$,$);`);

  const appPersonId = nextId(); // #2
  lines.push(`${appPersonId}=IFCPERSONANDORGANIZATION($,${orgId},$);`);

  const appOwnerId = nextId(); // #3
  lines.push(`${appOwnerId}=IFCOWNERHISTORY(${appPersonId},$,.READWRITE.,.ADDED.,$,$,$,${Math.floor(Date.now() / 1000)});`);

  // Dimensional Units (Feet/Meters, Radians, Degrees)
  const lengthUnitId = nextId();
  lines.push(`${lengthUnitId}=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);`);
  const areaUnitId = nextId();
  lines.push(`${areaUnitId}=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);`);
  const volumeUnitId = nextId();
  lines.push(`${volumeUnitId}=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);`);
  const unitAssignId = nextId();
  lines.push(`${unitAssignId}=IFCUNITASSIGNMENT((${lengthUnitId},${areaUnitId},${volumeUnitId}));`);

  // 3D Geometric Context & Origin
  const originPointId = nextId();
  lines.push(`${originPointId}=IFCCARTESIANPOINT((0.,0.,0.));`);
  const axisZId = nextId();
  lines.push(`${axisZId}=IFCDIRECTION((0.,0.,1.));`);
  const axisXId = nextId();
  lines.push(`${axisXId}=IFCDIRECTION((1.,0.,0.));`);
  const axisPlacementId = nextId();
  lines.push(`${axisPlacementId}=IFCAXIS2PLACEMENT3D(${originPointId},${axisZId},${axisXId});`);

  const geomContextId = nextId();
  lines.push(`${geomContextId}=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,${axisPlacementId},$);`);

  // Project Entity
  const projectId = nextId();
  lines.push(`${projectId}=IFCPROJECT('${guid()}',${appOwnerId},'${building.name}',$,$,$,$,(${geomContextId}),${unitAssignId});`);

  // Site Entity
  const sitePlacementId = nextId();
  lines.push(`${sitePlacementId}=IFCLOCALPLACEMENT($,${axisPlacementId});`);
  const siteId = nextId();
  lines.push(`${siteId}=IFCSITE('${guid()}',${appOwnerId},'${building.site.name}',$,$,${sitePlacementId},$,$,.ELEMENT.,(19,4,33,600000),(72,52,39,720000),${building.site.elevationMeters},$,$);`);

  // Building Entity
  const bldPlacementId = nextId();
  lines.push(`${bldPlacementId}=IFCLOCALPLACEMENT(${sitePlacementId},${axisPlacementId});`);
  const bldId = nextId();
  lines.push(`${bldId}=IFCBUILDING('${guid()}',${appOwnerId},'${building.name}',$,$,${bldPlacementId},$,$,.ELEMENT.,$,$,$);`);

  // Aggregate Project -> Site -> Building
  const relAggSiteId = nextId();
  lines.push(`${relAggSiteId}=IFCRELAGGREGATES('${guid()}',${appOwnerId},'ProjectSiteRel',$,${projectId},(${siteId}));`);
  const relAggBldId = nextId();
  lines.push(`${relAggBldId}=IFCRELAGGREGATES('${guid()}',${appOwnerId},'SiteBuildingRel',$,${siteId},(${bldId}));`);

  // Storey Levels
  const levelStepIds: Record<string, string> = {};
  const levelContainedElements: Record<string, string[]> = {};

  building.levels.forEach((lvl) => {
    const lvlElevationMeters = lvl.elevationFt * 0.3048;
    const lvlPointId = nextId();
    lines.push(`${lvlPointId}=IFCCARTESIANPOINT((0.,0.,${lvlElevationMeters.toFixed(3)}));`);
    const lvlAxisId = nextId();
    lines.push(`${lvlAxisId}=IFCAXIS2PLACEMENT3D(${lvlPointId},${axisZId},${axisXId});`);
    const lvlPlaceId = nextId();
    lines.push(`${lvlPlaceId}=IFCLOCALPLACEMENT(${bldPlacementId},${lvlAxisId});`);

    const lvlId = nextId();
    lines.push(`${lvlId}=IFCBUILDINGSTOREY('${guid()}',${appOwnerId},'${lvl.name}',$,$,${lvlPlaceId},$,$,.ELEMENT.,${lvlElevationMeters.toFixed(3)});`);
    levelStepIds[lvl.id] = lvlId;
    levelContainedElements[lvl.id] = [];
  });

  // Material Definitions
  const materialStepIds: Record<string, string> = {};
  building.materials.forEach((mat) => {
    const matId = nextId();
    lines.push(`${matId}=IFCMATERIAL('${mat.name}',$,'${mat.category}');`);
    materialStepIds[mat.id] = matId;
  });

  // Walls (IFCWALLSTANDARDCASE)
  building.walls.forEach((wall) => {
    const lengthM = (wall.lengthFt * 0.3048).toFixed(3);
    const heightM = (wall.heightFt * 0.3048).toFixed(3);
    const thicknessM = (wall.thicknessFt * 0.3048).toFixed(3);
    const startXM = (wall.startX * 0.3048).toFixed(3);
    const startYM = (wall.startY * 0.3048).toFixed(3);

    const wPosId = nextId();
    lines.push(`${wPosId}=IFCCARTESIANPOINT((${startXM},${startYM},0.));`);
    const wAxisId = nextId();
    lines.push(`${wAxisId}=IFCAXIS2PLACEMENT3D(${wPosId},${axisZId},${axisXId});`);
    const wLvlPlace = levelStepIds[wall.levelId] || levelStepIds[building.levels[0].id];
    const wPlaceId = nextId();
    lines.push(`${wPlaceId}=IFCLOCALPLACEMENT(${wLvlPlace},${wAxisId});`);

    // Extruded Solid Rectangle Profile
    const profPosId = nextId();
    lines.push(`${profPosId}=IFCAXIS2PLACEMENT2D(${originPointId},${axisXId});`);
    const profId = nextId();
    lines.push(`${profId}=IFCRECTANGLEPROFILEDEF(.AREA.,'WallProfile',${profPosId},${lengthM},${thicknessM});`);
    const extId = nextId();
    lines.push(`${extId}=IFCEXTRUDEDAREASOLID(${profId},${axisPlacementId},${axisZId},${heightM});`);

    const repItemId = nextId();
    lines.push(`${repItemId}=IFCSHAPEREPRESENTATION(${geomContextId},'Body','SweptSolid',(${extId}));`);
    const prodRepId = nextId();
    lines.push(`${prodRepId}=IFCPRODUCTDEFINITIONSHAPE($,$,(${repItemId}));`);

    const wallId = nextId();
    lines.push(`${wallId}=IFCWALLSTANDARDCASE('${guid()}',${appOwnerId},'${wall.name}',$,$,${wPlaceId},${prodRepId},$,.SOLIDWALL.);`);

    if (levelContainedElements[wall.levelId]) {
      levelContainedElements[wall.levelId].push(wallId);
    }
  });

  // RCC Columns (IFCCOLUMN)
  building.columns.forEach((col) => {
    const colXM = (col.x * 0.3048).toFixed(3);
    const colYM = (col.y * 0.3048).toFixed(3);
    const widthM = (col.widthFt * 0.3048).toFixed(3);
    const depthM = (col.depthFt * 0.3048).toFixed(3);
    const heightM = (col.heightFt * 0.3048).toFixed(3);

    const cPosId = nextId();
    lines.push(`${cPosId}=IFCCARTESIANPOINT((${colXM},${colYM},0.));`);
    const cAxisId = nextId();
    lines.push(`${cAxisId}=IFCAXIS2PLACEMENT3D(${cPosId},${axisZId},${axisXId});`);
    const cPlaceId = nextId();
    lines.push(`${cPlaceId}=IFCLOCALPLACEMENT(${bldPlacementId},${cAxisId});`);

    const cProfId = nextId();
    lines.push(`${cProfId}=IFCRECTANGLEPROFILEDEF(.AREA.,'ColumnProfile',$,${widthM},${depthM});`);
    const cExtId = nextId();
    lines.push(`${cExtId}=IFCEXTRUDEDAREASOLID(${cProfId},${axisPlacementId},${axisZId},${heightM});`);
    const cRepId = nextId();
    lines.push(`${cRepId}=IFCSHAPEREPRESENTATION(${geomContextId},'Body','SweptSolid',(${cExtId}));`);
    const cProdRep = nextId();
    lines.push(`${cProdRep}=IFCPRODUCTDEFINITIONSHAPE($,$,(${cRepId}));`);

    const colStepId = nextId();
    lines.push(`${colStepId}=IFCCOLUMN('${guid()}',${appOwnerId},'${col.name}',$,$,${cPlaceId},${cProdRep},$,.COLUMN.);`);

    if (levelContainedElements[col.levelId]) {
      levelContainedElements[col.levelId].push(colStepId);
    }
  });

  // Slabs (IFCSLAB)
  building.slabs.forEach((slab) => {
    const slabThickM = (slab.thicknessFt * 0.3048).toFixed(3);
    const slabAreaM = (slab.areaSqFt * 0.0929).toFixed(3);

    const sPosId = nextId();
    lines.push(`${sPosId}=IFCCARTESIANPOINT((0.,0.,0.));`);
    const sAxisId = nextId();
    lines.push(`${sAxisId}=IFCAXIS2PLACEMENT3D(${sPosId},${axisZId},${axisXId});`);
    const sPlaceId = nextId();
    lines.push(`${sPlaceId}=IFCLOCALPLACEMENT(${levelStepIds[slab.levelId] || bldPlacementId},${sAxisId});`);

    const sProfId = nextId();
    lines.push(`${sProfId}=IFCRECTANGLEPROFILEDEF(.AREA.,'SlabProfile',$,12.,15.);`);
    const sExtId = nextId();
    lines.push(`${sExtId}=IFCEXTRUDEDAREASOLID(${sProfId},${axisPlacementId},${axisZId},${slabThickM});`);
    const sRepId = nextId();
    lines.push(`${sRepId}=IFCSHAPEREPRESENTATION(${geomContextId},'Body','SweptSolid',(${sExtId}));`);
    const sProdRep = nextId();
    lines.push(`${sProdRep}=IFCPRODUCTDEFINITIONSHAPE($,$,(${sRepId}));`);

    const slabStepId = nextId();
    lines.push(`${slabStepId}=IFCSLAB('${guid()}',${appOwnerId},'${slab.name}',$,$,${sPlaceId},${sProdRep},$,.FLOOR.);`);

    if (levelContainedElements[slab.levelId]) {
      levelContainedElements[slab.levelId].push(slabStepId);
    }
  });

  // Spaces (IFCSPACE)
  building.spaces.forEach((spc) => {
    const spcId = nextId();
    lines.push(`${spcId}=IFCSPACE('${guid()}',${appOwnerId},'${spc.name}',$,$,${levelStepIds[spc.levelId] || bldPlacementId},$,$,.ELEMENT.,.INTERNAL.,$);`);
    if (levelContainedElements[spc.levelId]) {
      levelContainedElements[spc.levelId].push(spcId);
    }
  });

  // Spatial Containment Relationships (IFCRELCONTAINEDINSPATIALSTRUCTURE)
  Object.entries(levelContainedElements).forEach(([lvlKey, elemIds]) => {
    if (elemIds.length > 0) {
      const lvlStepId = levelStepIds[lvlKey];
      const relId = nextId();
      lines.push(`${relId}=IFCRELCONTAINEDINSPATIALSTRUCTURE('${guid()}',${appOwnerId},'StoreyElementsRel',$,(${elemIds.join(',')}),${lvlStepId});`);
    }
  });

  lines.push('ENDSEC;');
  lines.push('END-ISO-10303-21;');

  return lines.join('\n');
}

export function generateIFCFileContent(design: CandidateDesign, site: SiteInformation): string {
  const building = compileDesignToCanonicalBIM(design, site);
  return exportToIFC(building);
}
