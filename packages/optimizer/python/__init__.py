"""
ArchAI Studio v3 - NSGA-II Multi-Objective Genetic Optimizer Package
"""

from .nsga2 import NSGA2Optimizer, fast_non_dominated_sort, Individual
from .fitness import evaluate_9_objectives, evaluate_building_fitness


def run_nsga2_optimization(building_model, population_size=16, generations=10):
    opt = NSGA2Optimizer(base_model=building_model, population_size=population_size, generations=generations)
    return opt.run()


__all__ = [
    "NSGA2Optimizer",
    "run_nsga2_optimization",
    "fast_non_dominated_sort",
    "Individual",
    "evaluate_9_objectives",
    "evaluate_building_fitness",
]
