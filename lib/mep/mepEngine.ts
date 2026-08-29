import { CandidateDesign, RoomPolygon } from '@/types/architecture';

export interface MEPElectricalPoint {
  id: string;
  type: 'switch_board' | 'socket_6a' | 'power_socket_16a' | 'ceiling_fan' | 'led_downlight' | 'main_db';
  x: number;
  y: number;
  floor: number;
  circuitTag: string;
  loadWatts: number;
}

export interface MEPHvacPoint {
  id: string;
  type: 'indoor_hi_wall_ac' | 'outdoor_condenser_unit' | 'condensate_drain';
  x: number;
  y: number;
  floor: number;
  capacityTonnage: number; // e.g. 1.5 Ton
}

export interface MEPPlumbingPoint {
  id: string;
  type: 'cold_water_inlet' | 'hot_water_inlet' | 'soil_stack_110mm' | 'waste_stack_75mm' | 'floor_trap_nahani';
  x: number;
  y: number;
  floor: number;
  fixtureLabel: string;
}

export interface MEPShaft {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  servesFloors: string;
  description: string;
}

export interface MEPLayout {
  electricalPoints: MEPElectricalPoint[];
  hvacPoints: MEPHvacPoint[];
  plumbingPoints: MEPPlumbingPoint[];
  shafts: MEPShaft[];
  summary: {
    totalLightPoints: number;
    totalSockets6A: number;
    totalPowerSockets16A: number;
    totalAcUnits: number;
    totalConnectedLoadKw: number;
    totalPlumbingFixtures: number;
    totalVerticalShafts: number;
  };
}

/**
 * Automatically synthesizes comprehensive MEP (Mechanical, Electrical, Plumbing, HVAC, Solar) systems
 */
export function generateMEPLayout(design: CandidateDesign): MEPLayout {
  const electricalPoints: MEPElectricalPoint[] = [];
  const hvacPoints: MEPHvacPoint[] = [];
  const plumbingPoints: MEPPlumbingPoint[] = [];
  const shafts: MEPShaft[] = [];

  let lightCount = 0;
  let socket6ACount = 0;
  let socket16ACount = 0;
  let acUnitCount = 0;
  let plumbingCount = 0;

  design.floors.forEach((fl) => {
    // Add Main DB on Ground Floor near Foyer / Staircase
    if (fl.floorNumber === 0) {
      electricalPoints.push({
        id: 'main_db_f0',
        type: 'main_db',
        x: 2,
        y: 2,
        floor: 0,
        circuitTag: 'MAIN-MDB-01',
        loadWatts: 14000,
      });
    }

    fl.rooms.forEach((rm) => {
      const centerX = +(rm.x + rm.width / 2).toFixed(1);
      const centerY = +(rm.y + rm.height / 2).toFixed(1);

      // 1. Electrical Lighting & Fan Points
      electricalPoints.push({
        id: `light_${rm.id}_center`,
        type: 'led_downlight',
        x: centerX,
        y: centerY,
        floor: fl.floorNumber,
        circuitTag: `CKT-L-${fl.floorNumber}`,
        loadWatts: 36,
      });
      lightCount++;

      if (rm.type === 'living' || rm.type === 'bedroom' || rm.type === 'dining' || rm.type === 'office') {
        electricalPoints.push({
          id: `fan_${rm.id}`,
          type: 'ceiling_fan',
          x: centerX,
          y: centerY,
          floor: fl.floorNumber,
          circuitTag: `CKT-F-${fl.floorNumber}`,
          loadWatts: 75,
        });

        // 6A Convenience Sockets
        electricalPoints.push(
          {
            id: `sock6a_${rm.id}_1`,
            type: 'socket_6a',
            x: rm.x + 1,
            y: rm.y + 1,
            floor: fl.floorNumber,
            circuitTag: `CKT-P-${fl.floorNumber}`,
            loadWatts: 100,
          },
          {
            id: `sock6a_${rm.id}_2`,
            type: 'socket_6a',
            x: +(rm.x + rm.width - 1).toFixed(1),
            y: +(rm.y + rm.height - 1).toFixed(1),
            floor: fl.floorNumber,
            circuitTag: `CKT-P-${fl.floorNumber}`,
            loadWatts: 100,
          }
        );
        socket6ACount += 2;

        // Switchboard near entrance door
        electricalPoints.push({
          id: `sb_${rm.id}`,
          type: 'switch_board',
          x: +(rm.x + 0.5).toFixed(1),
          y: +(rm.y + rm.height - 0.5).toFixed(1),
          floor: fl.floorNumber,
          circuitTag: `SB-${rm.name.toUpperCase().slice(0, 4)}`,
          loadWatts: 0,
        });
      }

      // 2. Heavy Power Points (16A) & HVAC
      if (rm.type === 'bedroom' || rm.type === 'living' || rm.type === 'office') {
        electricalPoints.push({
          id: `ac_power_${rm.id}`,
          type: 'power_socket_16a',
          x: +(rm.x + rm.width - 1).toFixed(1),
          y: +(rm.y + 2).toFixed(1),
          floor: fl.floorNumber,
          circuitTag: `CKT-AC-${rm.id}`,
          loadWatts: 1800,
        });
        socket16ACount++;

        hvacPoints.push({
          id: `hvac_id_${rm.id}`,
          type: 'indoor_hi_wall_ac',
          x: +(rm.x + rm.width - 0.5).toFixed(1),
          y: +(rm.y + 2).toFixed(1),
          floor: fl.floorNumber,
          capacityTonnage: rm.type === 'living' ? 2.0 : 1.5,
        });
        acUnitCount++;
      }

      if (rm.type === 'kitchen') {
        // Kitchen 16A points for Microwave, Refrigerator, Dishwasher, Induction
        electricalPoints.push(
          {
            id: 'pwr_fridge',
            type: 'power_socket_16a',
            x: rm.x + 1,
            y: rm.y + 1,
            floor: fl.floorNumber,
            circuitTag: 'CKT-KT-FRIDGE',
            loadWatts: 500,
          },
          {
            id: 'pwr_oven',
            type: 'power_socket_16a',
            x: rm.x + 3,
            y: rm.y + 1,
            floor: fl.floorNumber,
            circuitTag: 'CKT-KT-OVEN',
            loadWatts: 2000,
          }
        );
        socket16ACount += 2;

        plumbingPoints.push(
          {
            id: `plumb_ksink_${fl.floorNumber}`,
            type: 'cold_water_inlet',
            x: rm.x + 2,
            y: rm.y + 1,
            floor: fl.floorNumber,
            fixtureLabel: 'Kitchen Sink Double Bowl Mixer',
          },
          {
            id: `drain_ksink_${fl.floorNumber}`,
            type: 'waste_stack_75mm',
            x: rm.x + 2,
            y: rm.y + 0.5,
            floor: fl.floorNumber,
            fixtureLabel: 'Kitchen Sink 75mm Waste Trap',
          }
        );
        plumbingCount += 2;
      }

      if (rm.type === 'bathroom') {
        // Geyser 16A power point
        electricalPoints.push({
          id: `pwr_geyser_${rm.id}`,
          type: 'power_socket_16a',
          x: rm.x + 1,
          y: rm.y + 1,
          floor: fl.floorNumber,
          circuitTag: `CKT-GEYSER-${fl.floorNumber}`,
          loadWatts: 2000,
        });
        socket16ACount++;

        plumbingPoints.push(
          {
            id: `plumb_wc_${rm.id}`,
            type: 'soil_stack_110mm',
            x: rm.x + 1.5,
            y: rm.y + 1.5,
            floor: fl.floorNumber,
            fixtureLabel: 'Wall-Hung EWC Concealed Cistern & 110mm Soil Stack',
          },
          {
            id: `plumb_shower_${rm.id}`,
            type: 'hot_water_inlet',
            x: +(rm.x + rm.width - 1.5).toFixed(1),
            y: +(rm.y + 1.5).toFixed(1),
            floor: fl.floorNumber,
            fixtureLabel: 'Thermostatic Shower Diverter Hot/Cold',
          },
          {
            id: `drain_trap_${rm.id}`,
            type: 'floor_trap_nahani',
            x: +(rm.x + rm.width - 1.5).toFixed(1),
            y: +(rm.y + 1.5).toFixed(1),
            floor: fl.floorNumber,
            fixtureLabel: 'Anti-Odor Multi-Inlet Nahani Floor Trap',
          }
        );
        plumbingCount += 3;
      }
    });
  });

  // 3. Vertical MEP Utility Shafts
  shafts.push(
    {
      id: 'mep_shaft_wet_01',
      x: 12.0,
      y: 8.0,
      width: 2.0,
      height: 2.5,
      servesFloors: 'Ground to Roof Slab',
      description: 'Primary Plumbing & Drainage Shaft (110mm Soil + 75mm Waste + 32mm CPVC Riser)',
    },
    {
      id: 'mep_shaft_elec_02',
      x: 6.0,
      y: 4.0,
      width: 1.5,
      height: 2.0,
      servesFloors: 'Ground to Roof Slab',
      description: 'Electrical & Solar PV DC Cable Shaft (Main Sub-Mains & Inverter Line)',
    }
  );

  const totalConnectedLoadKw = +(
    electricalPoints.reduce((sum, p) => sum + p.loadWatts, 0) / 1000
  ).toFixed(1);

  return {
    electricalPoints,
    hvacPoints,
    plumbingPoints,
    shafts,
    summary: {
      totalLightPoints: lightCount,
      totalSockets6A: socket6ACount,
      totalPowerSockets16A: socket16ACount,
      totalAcUnits: acUnitCount,
      totalConnectedLoadKw,
      totalPlumbingFixtures: plumbingCount,
      totalVerticalShafts: shafts.length,
    },
  };
}
