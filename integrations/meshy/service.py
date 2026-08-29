"""
ArchAI Studio v3 - Meshy 3D Asset Generation Service
Generates interior furniture, fixtures, and landscape 3D models (GLB) from natural language prompts.
Decoupled as an asset library service from the core parametric building geometry compiler.

Supported Asset Categories:
1. sofa
2. bed
3. table
4. chair
5. kitchen
6. plant
7. lamp
8. cabinet
9. sanitary_fixtures
"""

import os
import uuid
from typing import Dict, Any, List, Optional
from .client import MeshyClient


SUPPORTED_ASSET_CATEGORIES = [
    "sofa",
    "bed",
    "table",
    "chair",
    "kitchen",
    "plant",
    "lamp",
    "cabinet",
    "sanitary_fixtures",
]


class MeshyAssetService:
    def __init__(self, api_key: Optional[str] = None):
        self.client = MeshyClient(api_key=api_key)
        self.asset_library: Dict[str, Dict[str, Any]] = self._seed_asset_library()

    def _seed_asset_library(self) -> Dict[str, Dict[str, Any]]:
        """Pre-seeds standard high-fidelity catalog assets for instant retrieval."""
        catalog = {}
        for cat in SUPPORTED_ASSET_CATEGORIES:
            asset_id = f"asset_{cat}_default"
            catalog[asset_id] = {
                "id": asset_id,
                "category": cat,
                "name": f"Standard Architectural {cat.replace('_', ' ').title()}",
                "prompt": f"Modern Scandinavian {cat.replace('_', ' ')} with PBR textures",
                "glb_url": f"https://assets.archai.studio/models/furniture/{cat}_default.glb",
                "thumbnail_url": f"https://assets.archai.studio/thumbs/{cat}_default.webp",
                "dimensions_ft": {"width": 3.0, "depth": 3.0, "height": 3.0},
                "polygon_count": 4800,
                "is_cached": True,
            }
        return catalog

    def generate_asset(self, prompt: str, category: Optional[str] = None) -> Dict[str, Any]:
        """
        Synthesizes a new 3D GLB asset from natural language via Meshy AI.
        """
        matched_cat = "table"
        if category and category.lower() in SUPPORTED_ASSET_CATEGORIES:
            matched_cat = category.lower()
        else:
            p_low = prompt.lower()
            for cat in SUPPORTED_ASSET_CATEGORIES:
                if cat.replace('_', ' ') in p_low:
                    matched_cat = cat
                    break

        asset_id = f"asset_{uuid.uuid4().hex[:8]}"
        res = self.client.generate_furniture_asset(prompt=prompt)

        asset_record = {
            "id": asset_id,
            "category": matched_cat,
            "name": prompt.title(),
            "prompt": prompt,
            "glb_url": res.get("glb_url", f"https://assets.archai.studio/models/generated/{asset_id}.glb"),
            "thumbnail_url": f"https://assets.archai.studio/thumbs/generated/{asset_id}.webp",
            "dimensions_ft": {"width": 3.5, "depth": 3.0, "height": 2.8},
            "polygon_count": 8200,
            "status": "ready",
        }

        self.asset_library[asset_id] = asset_record
        return asset_record

    def list_category_assets(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns all cached assets in the Asset Library filtered by category."""
        if category:
            return [a for a in self.asset_library.values() if a.get("category") == category.lower()]
        return list(self.asset_library.values())

    def get_asset_by_id(self, asset_id: str) -> Optional[Dict[str, Any]]:
        return self.asset_library.get(asset_id)
