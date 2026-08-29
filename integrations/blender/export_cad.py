"""
ArchAI Studio v3 - 2D CAD & Blueprint Exporter
"""

from typing import Dict, Any, List


class CADExporter:
    def export_dxf_string(self, building_dict: Dict[str, Any]) -> str:
        """
        Generates standard AutoCAD DXF R12 ascii string representation of floor plan.
        """
        lines = [
            "0", "SECTION", "2", "HEADER", "0", "ENDSEC",
            "0", "SECTION", "2", "TABLES", "0", "ENDSEC",
            "0", "SECTION", "2", "BLOCKS", "0", "ENDSEC",
            "0", "SECTION", "2", "ENTITIES"
        ]

        # Export walls as DXF LINE entities on layer 'A-WALL'
        for w in building_dict.get("walls", []):
            p1 = w["start_point"]
            p2 = w["end_point"]
            lines.extend([
                "0", "LINE",
                "8", "A-WALL",
                "10", f"{p1['x']:.2f}",
                "20", f"{p1['y']:.2f}",
                "30", "0.0",
                "11", f"{p2['x']:.2f}",
                "21", f"{p2['y']:.2f}",
                "31", "0.0"
            ])

        lines.extend(["0", "ENDSEC", "0", "EOF"])
        return "\n".join(lines)
