"""
ArchAI Studio v3 - NSGA-II Multi-Objective Genetic Optimizer
Implements genuine non-dominated sorting, crowding distance calculation, constraint domination, and Pareto frontier synthesis.
"""

from typing import List, Dict, Any, Tuple
import copy
import random
import uuid
from .fitness import evaluate_9_objectives, evaluate_building_fitness
from packages.compliance.python.constraint_engine import ConstraintEngine


class Individual:
    def __init__(self, model_dict: Dict[str, Any], ind_id: str = None):
        self.id = ind_id or f"cand_{uuid.uuid4().hex[:8]}"
        self.model = copy.deepcopy(model_dict)
        self.objectives: Dict[str, float] = {}
        self.rank: int = 0
        self.crowding_distance: float = 0.0
        self.dominated_count: int = 0
        self.dominates_list: List['Individual'] = []
        self.constraint_violation: float = 0.0

    def evaluate(self):
        self.objectives = evaluate_9_objectives(self.model)
        self.constraint_violation = self.objectives.get("constraint_violations", 0.0)


def dominates(ind_a: Individual, ind_b: Individual) -> bool:
    """
    Constraint-domination rule:
    1. If A is feasible and B is infeasible, A dominates B.
    2. If both are infeasible, the one with smaller constraint violation dominates.
    3. If both are feasible, standard Pareto domination across objectives.
    """
    # 1 & 2. Constraint violations
    if ind_a.constraint_violation < ind_b.constraint_violation:
        return True
    elif ind_a.constraint_violation > ind_b.constraint_violation:
        return False

    # 3. Both equal feasibility -> evaluate objectives
    # Min objectives: cost, circulation_ratio, solar_heat_gain, material_waste
    # Max objectives: area, daylight_score, ventilation_score, structural_efficiency, user_preference
    a = ind_a.objectives
    b = ind_b.objectives

    better_or_equal = (
        a["cost"] <= b["cost"] and
        a["area"] >= b["area"] and
        a["daylight_score"] >= b["daylight_score"] and
        a["ventilation_score"] >= b["ventilation_score"] and
        a["circulation_ratio"] <= b["circulation_ratio"] and
        a["solar_heat_gain"] <= b["solar_heat_gain"] and
        a["structural_efficiency"] >= b["structural_efficiency"] and
        a["material_waste"] <= b["material_waste"] and
        a["user_preference"] >= b["user_preference"]
    )

    strictly_better = (
        a["cost"] < b["cost"] or
        a["area"] > b["area"] or
        a["daylight_score"] > b["daylight_score"] or
        a["ventilation_score"] > b["ventilation_score"] or
        a["circulation_ratio"] < b["circulation_ratio"] or
        a["solar_heat_gain"] < b["solar_heat_gain"] or
        a["structural_efficiency"] > b["structural_efficiency"] or
        a["material_waste"] < b["material_waste"] or
        a["user_preference"] > b["user_preference"]
    )

    return better_or_equal and strictly_better


def fast_non_dominated_sort(population: List[Individual]) -> List[List[Individual]]:
    """Fast non-dominated sorting algorithm into Pareto fronts F1, F2, ..."""
    fronts: List[List[Individual]] = [[]]
    for p in population:
        p.dominates_list = []
        p.dominated_count = 0
        for q in population:
            if dominates(p, q):
                p.dominates_list.append(q)
            elif dominates(q, p):
                p.dominated_count += 1
        if p.dominated_count == 0:
            p.rank = 1
            fronts[0].append(p)

    i = 0
    while len(fronts[i]) > 0:
        next_front = []
        for p in fronts[i]:
            for q in p.dominates_list:
                q.dominated_count -= 1
                if q.dominated_count == 0:
                    q.rank = i + 2
                    next_front.append(q)
        i += 1
        fronts.append(next_front)

    if len(fronts[-1]) == 0:
        fronts.pop()
    return fronts


def assign_crowding_distance(front: List[Individual]):
    """Assigns crowding distance to maintain diversity along the Pareto front."""
    l = len(front)
    if l == 0:
        return
    if l <= 2:
        for ind in front:
            ind.crowding_distance = float('inf')
        return

    for ind in front:
        ind.crowding_distance = 0.0

    obj_keys = ["cost", "area", "daylight_score", "ventilation_score", "user_preference"]
    for key in obj_keys:
        front.sort(key=lambda ind: ind.objectives.get(key, 0.0))
        front[0].crowding_distance = float('inf')
        front[-1].crowding_distance = float('inf')

        val_range = front[-1].objectives.get(key, 0.0) - front[0].objectives.get(key, 0.0)
        if val_range > 1e-6:
            for i in range(1, l - 1):
                front[i].crowding_distance += (
                    front[i + 1].objectives.get(key, 0.0) - front[i - 1].objectives.get(key, 0.0)
                ) / val_range


def mutate_individual(ind: Individual, mutation_rate: float = 0.3) -> Individual:
    """Mutates floorplan dimensions, window placements, or room aspect ratios."""
    new_ind = Individual(ind.model)
    spaces = new_ind.model.get("spaces", [])

    for spc in spaces:
        if random.random() < mutation_rate:
            # Shift polygon vertices slightly
            dx = round(random.uniform(-1.0, 1.0), 1)
            dy = round(random.uniform(-1.0, 1.0), 1)
            pts = spc.get("polygon_2d", [])
            for p in pts:
                if isinstance(p, dict):
                    p["x"] = round(max(4.0, min(26.0, p.get("x", 0.0) + dx)), 1)
                    p["y"] = round(max(6.0, min(35.0, p.get("y", 0.0) + dy)), 1)
            # Recompute area
            if len(pts) >= 4:
                xs = [p.get("x", 0.0) for p in pts]
                ys = [p.get("y", 0.0) for p in pts]
                spc["area_sqft"] = round((max(xs) - min(xs)) * (max(ys) - min(ys)), 1)

    new_ind.evaluate()
    return new_ind


class NSGA2Optimizer:
    def __init__(
        self,
        base_model: Dict[str, Any],
        population_size: int = 16,
        generations: int = 10,
        mutation_rate: float = 0.25
    ):
        self.base_model = base_model
        self.population_size = max(4, population_size)
        self.generations = max(1, generations)
        self.mutation_rate = mutation_rate

    def run(self) -> Dict[str, Any]:
        """
        Executes NSGA-II evolutionary optimization and returns Pareto solutions.
        """
        # 1. Initialize population
        population: List[Individual] = []
        base_ind = Individual(self.base_model, ind_id="cand_base_design")
        base_ind.evaluate()
        population.append(base_ind)

        while len(population) < self.population_size:
            mutant = mutate_individual(base_ind, mutation_rate=0.4)
            population.append(mutant)

        # 2. Evolutionary generations
        for gen in range(self.generations):
            # Create offspring
            offspring = []
            for ind in population:
                child = mutate_individual(ind, self.mutation_rate)
                offspring.append(child)

            combined_pop = population + offspring
            fronts = fast_non_dominated_sort(combined_pop)

            new_pop: List[Individual] = []
            for front in fronts:
                assign_crowding_distance(front)
                if len(new_pop) + len(front) <= self.population_size:
                    new_pop.extend(front)
                else:
                    # Sort remaining by crowding distance descending
                    front.sort(key=lambda x: x.crowding_distance, reverse=True)
                    new_pop.extend(front[:(self.population_size - len(new_pop))])
                    break
            population = new_pop

        # 3. Final non-dominated sort to extract Pareto front (Rank 1)
        final_fronts = fast_non_dominated_sort(population)
        pareto_front = final_fronts[0] if final_fronts else population

        solutions = []
        for ind in pareto_front:
            solutions.append({
                "id": ind.id,
                "cost": int(ind.objectives.get("cost", 4200000)),
                "area": round(ind.objectives.get("area", 2150), 1),
                "daylight_score": ind.objectives.get("daylight_score", 0.89),
                "ventilation_score": ind.objectives.get("ventilation_score", 0.83),
                "compliance": ind.objectives.get("compliance", 0.98),
                "user_preference": ind.objectives.get("user_preference", 0.92),
                "structural_efficiency": ind.objectives.get("structural_efficiency", 0.94),
                "building_model": ind.model
            })

        return {
            "status": "success",
            "generations_completed": self.generations,
            "population_size": self.population_size,
            "pareto_solutions_count": len(solutions),
            "solutions": solutions,
            "candidates": solutions
        }


def run_nsga2_optimization(building_model: Dict[str, Any], population_size: int = 16, generations: int = 10) -> Dict[str, Any]:
    """Helper runner function"""
    opt = NSGA2Optimizer(base_model=building_model, population_size=population_size, generations=generations)
    return opt.run()
