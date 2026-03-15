/**
 * usePlants — Plant watering tracker via HA input_datetime helpers
 *
 * Each plant has a watering interval (days). The bar shows elapsed time
 * as a percentage of the interval. Tap "Water" to reset the timer.
 */

import { useCallback } from 'react';
import { useEntity } from './useEntity';
import { useHomeAssistant } from './useHomeAssistant';
import { callService } from '@/utils/ha';

export interface PlantConfig {
  name: string;
  entityId: string;
  intervalDays: number;
}

export interface PlantState {
  name: string;
  entityId: string;
  intervalDays: number;
  lastWatered: Date | null;
  daysSince: number;
  progress: number; // 0-1, where 1 = needs water now
  needsWater: boolean;
  overdue: boolean;
  daysUntil: number;
}

const PLANTS: PlantConfig[] = [
  { name: 'Monstera', entityId: 'input_datetime.monsterra_watered', intervalDays: 9 },
  { name: 'Blue Columnar Cactus', entityId: 'input_datetime.blue_columnar_watered', intervalDays: 21 },
  { name: 'Peruvian Apple Cactus', entityId: 'input_datetime.peruvian_apple_watered', intervalDays: 21 },
  { name: 'Prickly Pear', entityId: 'input_datetime.prickly_pear_watered', intervalDays: 21 },
  { name: 'Euphorbia', entityId: 'input_datetime.euphorbia_watered', intervalDays: 14 },
];

export function usePlants() {
  const { connection } = useHomeAssistant();

  const monstera = useEntity(PLANTS[0].entityId);
  const blueColumnar = useEntity(PLANTS[1].entityId);
  const peruvianApple = useEntity(PLANTS[2].entityId);
  const pricklyPear = useEntity(PLANTS[3].entityId);
  const euphorbia = useEntity(PLANTS[4].entityId);

  const entities = [monstera, blueColumnar, peruvianApple, pricklyPear, euphorbia];

  const plants: PlantState[] = PLANTS.map((config, i) => {
    const entity = entities[i];
    let lastWatered: Date | null = null;

    if (entity && entity.state && entity.state !== 'unknown') {
      // HA returns "YYYY-MM-DD HH:MM:SS" without timezone — parse as local
      const raw = entity.state.replace(' ', 'T');
      lastWatered = new Date(raw);
    }

    const now = Date.now();
    const daysSince = lastWatered
      ? (now - lastWatered.getTime()) / (1000 * 60 * 60 * 24)
      : config.intervalDays; // if never set, show as needing water

    const progress = Math.min(daysSince / config.intervalDays, 1.5); // cap at 150% for overdue
    const daysUntil = Math.max(0, Math.ceil(config.intervalDays - daysSince));

    return {
      name: config.name,
      entityId: config.entityId,
      intervalDays: config.intervalDays,
      lastWatered,
      daysSince: Math.floor(daysSince),
      progress: Math.min(progress, 1), // bar caps at 100%
      needsWater: daysSince >= config.intervalDays * 0.85,
      overdue: daysSince >= config.intervalDays,
      daysUntil,
    };
  });

  const water = useCallback(
    (entityId: string) => {
      if (!connection) return;
      const now = new Date();
      const date = now.toISOString().slice(0, 10);
      const time = now.toTimeString().slice(0, 8);
      callService(connection, 'input_datetime', 'set_datetime', {
        date,
        time,
      }, { entity_id: entityId });
    },
    [connection]
  );

  const setWateredDate = useCallback(
    (entityId: string, date: Date) => {
      if (!connection) return;
      const d = date.toISOString().slice(0, 10);
      const t = date.toTimeString().slice(0, 8);
      callService(connection, 'input_datetime', 'set_datetime', {
        date: d,
        time: t,
      }, { entity_id: entityId });
    },
    [connection]
  );

  return { plants, water, setWateredDate };
}
