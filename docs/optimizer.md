# NSGA-II Genetic Optimizer Specification

## Multi-Objective Pareto Optimization

ArchAI Studio v3 optimizes architectural layouts across 7 competing fitness dimensions:

1. **Space Target Area Satisfaction**: Minimizes error between client requirements and synthesized room square footage.
2. **Natural Daylight & Solar Access**: Rewards living areas and bedrooms facing optimal sun facades with adequate window ratios.
3. **Functional Adjacency**: Enforces direct access between kitchen/dining, master bedroom/bath, foyer/living, while prohibiting improper adjacencies.
4. **Privacy Zoning**: Ensures bedrooms are placed on upper floors or away from main street access.
5. **Structural Column Regularity**: Maximizes collinear alignment of vertical RCC columns to avoid transfer beams.
6. **Economic Compactness**: Optimizes surface area to volume ratio to reduce construction costs.
7. **Non-Overlapping Room Boundary Constraints**: Hard penalty for any intersecting polygon areas.
