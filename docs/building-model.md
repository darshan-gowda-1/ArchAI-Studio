# Canonical Building Model Specification

The **Canonical Building Model** is the central data contract in ArchAI Studio v3.

```
BuildingModel
      │
      ├── Site (latitude, longitude, boundary polygon, setbacks, FAR, solar data)
      ├── Project (id, name, code, client, status, version)
      ├── Levels (level_index, elevation, floor_to_floor_height)
      ├── Spaces (id, name, type, polygon_2d, area, finishes, ventilation)
      ├── Walls (id, start_point, end_point, thickness, height, openings)
      ├── Openings (doors, windows, cutouts, sills, headers)
      ├── Doors (opening_type, swing, door_style, fire_rating)
      ├── Windows (opening_type, glazing, U-value, SHGC)
      ├── Columns (position, dimensions, material, grid alignment)
      ├── Slabs (boundary, thickness, elevation, cutouts)
      ├── Roof (type, pitch, parapet, solar PV count)
      ├── Furniture (name, category, 3D position, rotation, clearance radius)
      ├── Materials (density, embodied carbon, unit cost, textures)
      ├── Systems (MEP electrical, plumbing, HVAC, rainwater, solar)
      ├── Constraints (jurisdiction, setbacks, FAR, room area minimums, adjacencies)
      ├── Metrics (built-up area, carpet area, BOQ cost estimate, sustainability score)
      └── Metadata (custom JSON attributes, optimizer version, provenance)
```
