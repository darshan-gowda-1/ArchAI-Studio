"""
ArchAI Studio v3 - Architectural Design Versioning & Revision Engine
Maintains Project -> Design -> Revision lineage.
Supports:
1. Compare (diff two design states)
2. Restore (rollback to a previous revision)
3. Duplicate (deep copy design branch)
4. Branch (fork revision into a new design variant)
"""

import copy
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from packages.building_model import BuildingModel, create_default_building_model


class Revision:
    def __init__(
        self,
        revision_id: str,
        revision_number: int,
        author: str,
        commit_message: str,
        building_model: Dict[str, Any],
        created_at: Optional[str] = None
    ):
        self.revision_id = revision_id
        self.revision_number = revision_number
        self.author = author
        self.commit_message = commit_message
        self.building_model = building_model
        self.created_at = created_at or datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "revision_id": self.revision_id,
            "revision_number": self.revision_number,
            "author": self.author,
            "commit_message": self.commit_message,
            "building_model": self.building_model,
            "created_at": self.created_at,
        }


class DesignVersionTree:
    def __init__(self, design_id: str, project_id: str, name: str, initial_model: Dict[str, Any]):
        self.design_id = design_id
        self.project_id = project_id
        self.name = name
        self.current_model = initial_model
        self.revisions: List[Revision] = []
        self.branches: List[str] = []

        # Create initial Revision 1
        self.create_revision(
            author="System Architect",
            commit_message="Initial design baseline",
            model=initial_model
        )

    def create_revision(self, author: str, commit_message: str, model: Dict[str, Any]) -> Revision:
        rev_num = len(self.revisions) + 1
        rev_id = f"rev_{self.design_id}_{rev_num}"
        rev = Revision(
            revision_id=rev_id,
            revision_number=rev_num,
            author=author,
            commit_message=commit_message,
            building_model=copy.deepcopy(model)
        )
        self.revisions.append(rev)
        self.current_model = copy.deepcopy(model)
        return rev

    def restore_revision(self, revision_id: str, author: str = "Architect") -> Dict[str, Any]:
        """Rolls back design state to a specific revision by creating a new revision."""
        target_rev = next((r for r in self.revisions if r.revision_id == revision_id), None)
        if not target_rev:
            raise ValueError(f"Revision {revision_id} not found in design {self.design_id}")

        new_rev = self.create_revision(
            author=author,
            commit_message=f"Restored from Revision #{target_rev.revision_number} ({target_rev.revision_id})",
            model=target_rev.building_model
        )
        return new_rev.to_dict()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "design_id": self.design_id,
            "project_id": self.project_id,
            "name": self.name,
            "current_revision_number": len(self.revisions),
            "revisions_count": len(self.revisions),
            "revisions": [r.to_dict() for r in self.revisions],
            "branches": self.branches,
        }


class VersioningEngine:
    def __init__(self):
        self.design_trees: Dict[str, DesignVersionTree] = {}

    def get_or_create_tree(self, design_id: str, project_id: str = "proj_default", name: str = "Design Variant", initial_model: Optional[Dict[str, Any]] = None) -> DesignVersionTree:
        if design_id not in self.design_trees:
            model = initial_model or create_default_building_model().dict()
            self.design_trees[design_id] = DesignVersionTree(
                design_id=design_id,
                project_id=project_id,
                name=name,
                initial_model=model
            )
        return self.design_trees[design_id]

    def create_revision(self, design_id: str, author: str, commit_message: str, model: Dict[str, Any]) -> Dict[str, Any]:
        tree = self.get_or_create_tree(design_id)
        rev = tree.create_revision(author, commit_message, model)
        return rev.to_dict()

    def restore_revision(self, design_id: str, revision_id: str, author: str = "Architect") -> Dict[str, Any]:
        tree = self.get_or_create_tree(design_id)
        return tree.restore_revision(revision_id, author)

    def duplicate_design(self, source_design_id: str, new_name: Optional[str] = None) -> Dict[str, Any]:
        """Creates an independent clone of a design with new lineage."""
        source_tree = self.get_or_create_tree(source_design_id)
        new_design_id = f"des_{uuid.uuid4().hex[:8]}"
        name = new_name or f"{source_tree.name} (Copy)"

        new_tree = DesignVersionTree(
            design_id=new_design_id,
            project_id=source_tree.project_id,
            name=name,
            initial_model=copy.deepcopy(source_tree.current_model)
        )
        self.design_trees[new_design_id] = new_tree
        return new_tree.to_dict()

    def branch_design(self, source_design_id: str, revision_id: Optional[str] = None, branch_name: Optional[str] = None) -> Dict[str, Any]:
        """Forks a specific revision into an isolated child design variant."""
        source_tree = self.get_or_create_tree(source_design_id)
        if revision_id:
            target_rev = next((r for r in source_tree.revisions if r.revision_id == revision_id), None)
            model = target_rev.building_model if target_rev else source_tree.current_model
        else:
            model = source_tree.current_model

        branch_id = f"des_branch_{uuid.uuid4().hex[:6]}"
        name = branch_name or f"{source_tree.name} / Branch"

        branch_tree = DesignVersionTree(
            design_id=branch_id,
            project_id=source_tree.project_id,
            name=name,
            initial_model=copy.deepcopy(model)
        )
        self.design_trees[branch_id] = branch_tree
        source_tree.branches.append(branch_id)

        return branch_tree.to_dict()

    @staticmethod
    def compare_models(model_a: Dict[str, Any], model_b: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates architectural differential between two designs or revisions.
        """
        spaces_a = {s.get("id"): s for s in model_a.get("spaces", [])}
        spaces_b = {s.get("id"): s for s in model_b.get("spaces", [])}

        carpet_a = sum(s.get("area_sqft", 0.0) for s in spaces_a.values()) or model_a.get("metrics", {}).get("carpet_area_sqft", 1200.0)
        carpet_b = sum(s.get("area_sqft", 0.0) for s in spaces_b.values()) or model_b.get("metrics", {}).get("carpet_area_sqft", 1200.0)

        added_spaces = [s["name"] for s_id, s in spaces_b.items() if s_id not in spaces_a]
        removed_spaces = [s["name"] for s_id, s in spaces_a.items() if s_id not in spaces_b]

        area_delta_sqft = round(carpet_b - carpet_a, 2)
        area_delta_pct = round((area_delta_sqft / (carpet_a or 1.0)) * 100, 2)

        cost_a = model_a.get("metrics", {}).get("cost_estimate", {}).get("grand_total_inr", 2200000)
        cost_b = model_b.get("metrics", {}).get("cost_estimate", {}).get("grand_total_inr", 2200000)
        cost_delta_inr = cost_b - cost_a

        return {
            "status": "success",
            "delta_summary": {
                "carpet_area_before_sqft": carpet_a,
                "carpet_area_after_sqft": carpet_b,
                "carpet_area_delta_sqft": area_delta_sqft,
                "carpet_area_delta_percent": area_delta_pct,
                "cost_delta_inr": cost_delta_inr,
                "space_count_before": len(spaces_a),
                "space_count_after": len(spaces_b),
                "added_spaces": added_spaces,
                "removed_spaces": removed_spaces,
            }
        }
