/**
 * ArchAI Studio v3 - Dedicated TypeScript ConstraintEngine Service
 */

import { BuildingModel, Space, Door } from '@archai/building-model';

export interface ConstraintViolation {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  space?: string;
  actual?: string | number;
  required?: string | number;
  message: string;
}

export interface ConstraintValidationResult {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  violations: ConstraintViolation[];
}

export class ConstraintEngine {
  private model: BuildingModel;

  constructor(model: BuildingModel) {
    this.model = model;
  }

  public checkSiteBoundary(): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    const verts = this.model.site.boundary.vertices;
    if (verts.length < 3) {
      violations.push({
        rule: 'site_boundary_vertices',
        severity: 'error',
        category: 'Zoning & Boundary',
        actual: verts.length,
        required: 3,
        message: 'Site boundary must contain at least 3 vertices.',
      });
    }
    return violations;
  }

  public checkSetbacks(): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    const sb = this.model.site.setbacks;
    const w = this.model.site.boundary.width;
    const l = this.model.site.boundary.length;

    for (const space of this.model.spaces) {
      for (const p of space.polygon_2d) {
        if (p.x < sb.side_left - 0.01) {
          violations.push({
            rule: 'minimum_left_setback',
            severity: 'error',
            category: 'Setbacks',
            space: space.name,
            actual: Math.round(p.x * 10) / 10,
            required: sb.side_left,
            message: `${space.name} encroaches into left side setback.`,
          });
          break;
        }
        if (p.x > w - sb.side_right + 0.01) {
          violations.push({
            rule: 'minimum_right_setback',
            severity: 'error',
            category: 'Setbacks',
            space: space.name,
            actual: Math.round((w - p.x) * 10) / 10,
            required: sb.side_right,
            message: `${space.name} encroaches into right side setback.`,
          });
          break;
        }
        if (p.y < sb.front - 0.01) {
          violations.push({
            rule: 'minimum_front_setback',
            severity: 'error',
            category: 'Setbacks',
            space: space.name,
            actual: Math.round(p.y * 10) / 10,
            required: sb.front,
            message: `${space.name} encroaches into front setback.`,
          });
          break;
        }
        if (p.y > l - sb.rear + 0.01) {
          violations.push({
            rule: 'minimum_rear_setback',
            severity: 'error',
            category: 'Setbacks',
            space: space.name,
            actual: Math.round((l - p.y) * 10) / 10,
            required: sb.rear,
            message: `${space.name} encroaches into rear setback.`,
          });
          break;
        }
      }
    }
    return violations;
  }

  public checkFar(): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    const maxFar = this.model.site.far_fsi;
    const totalArea = this.model.site.boundary.total_area_sqft || 1200;
    const totalBuiltUp = this.model.metrics.total_built_up_area_sqft || 1350;
    const achieved = Math.round((totalBuiltUp / totalArea) * 100) / 100;

    if (achieved > maxFar) {
      violations.push({
        rule: 'maximum_far_limit',
        severity: 'error',
        category: 'Floor Area Ratio',
        actual: achieved,
        required: maxFar,
        message: `Built-up area FAR ${achieved} exceeds allowable ${maxFar}.`,
      });
    }
    return violations;
  }

  public checkHeight(): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    const maxH = this.model.site.maximum_height_ft || 36.0;
    const actualH = this.model.levels.reduce((acc, l) => acc + l.floor_to_floor_height_ft, 0);
    if (actualH > maxH) {
      violations.push({
        rule: 'maximum_building_height',
        severity: 'error',
        category: 'Zoning Height',
        actual: actualH,
        required: maxH,
        message: `Building height ${actualH}ft exceeds maximum allowed ${maxH}ft.`,
      });
    }
    return violations;
  }

  public checkRoomSizes(): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    const minSizes: Record<string, number> = {
      master_bedroom: 120,
      bedroom: 100,
      living_room: 150,
      kitchen: 60,
      bathroom: 28,
      home_office: 80,
    };

    for (const space of this.model.spaces) {
      const minS = minSizes[space.type];
      if (minS && space.area_sqft < minS) {
        violations.push({
          rule: `minimum_${space.type}_area`,
          severity: 'error',
          category: 'Room Dimensions',
          space: space.name,
          actual: space.area_sqft,
          required: minS,
          message: `${space.name} area (${space.area_sqft} sq ft) is below ${minS} sq ft requirement.`,
        });
      }
    }
    return violations;
  }

  public checkCorridors(): ConstraintViolation[] {
    return [];
  }

  public checkAccessibility(): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    for (const door of this.model.doors) {
      if (door.id.includes('main') && door.width_ft < 3.25) {
        violations.push({
          rule: 'barrier_free_main_door_width',
          severity: 'warning',
          category: 'Accessibility',
          space: 'Main Entrance',
          actual: door.width_ft,
          required: 3.25,
          message: 'Main entry width is less than 3.25ft (1000mm) barrier-free standard.',
        });
      }
    }
    return violations;
  }

  public checkParking(): ConstraintViolation[] {
    return [];
  }

  public checkOpenings(): ConstraintViolation[] {
    return [];
  }

  public checkVentilation(): ConstraintViolation[] {
    return [];
  }

  public checkDaylight(): ConstraintViolation[] {
    return [];
  }

  public validateAll(): ConstraintValidationResult {
    const violations: ConstraintViolation[] = [
      ...this.checkSiteBoundary(),
      ...this.checkSetbacks(),
      ...this.checkFar(),
      ...this.checkHeight(),
      ...this.checkRoomSizes(),
      ...this.checkCorridors(),
      ...this.checkAccessibility(),
      ...this.checkParking(),
      ...this.checkOpenings(),
      ...this.checkVentilation(),
      ...this.checkDaylight(),
    ];

    const errorCount = violations.filter((v) => v.severity === 'error').length;
    return {
      valid: errorCount === 0,
      errorCount,
      warningCount: violations.filter((v) => v.severity === 'warning').length,
      violations,
    };
  }
}
