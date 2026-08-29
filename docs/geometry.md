# Geometry Engine Specification

ArchAI Studio v3 transforms spatial floor plan polygons into clean 3D architectural solids.

## Geometry Pipeline
1. **Building Model Input**: Receives canonical spaces, levels, and site polygons.
2. **2D Topology**: Computes room adjacencies and derives shared vs exterior wall centerlines.
3. **Wall Synthesis**: Extrudes linear segments with specified thickness and story height.
4. **Opening Cutouts**: Slices door and window openings into three-segment assemblies (left/right jambs, bottom sill, top lintel header).
5. **Slabs & Balconies**: Extrudes floor perimeters and cuts stair openings.
6. **Roof Generation**: Generates parapets, sloping planes, and PV panel arrays.
7. **Column Grid Regularization**: Places structural RCC columns at primary load-bearing intersections.
8. **3D Mesh Output**: Produces Three.js BufferGeometry for browser rendering and trimesh / OBJ / IFC4 for backend pipelines.
