/**
 * useCommute — Commute times via Waze Travel Time HA sensors
 *
 * Tile visibility rules:
 *   - Downtown MPLS: always shown
 *   - Sheridan Hills: M–F 6:30a–8a & 1:30p–2:30p, until June 10 2026
 *   - MTKA Middle West + Excelsior: M–F 7a–9a & 2p–4p, starting June 10 2026
 * Detail page shows all 6 destinations.
 */

import { useMemo } from 'react';
import { useEntity } from './useEntity';

export interface CommuteDestination {
  key: string;
  label: string;
  entityId: string;
  minutes: number | null;
  route: string | null;
  distance: string | null;
}

export interface CommuteState {
  visible: CommuteDestination[];
  all: CommuteDestination[];
}

const DESTINATIONS = [
  { key: 'downtown_mpls', label: 'Downtown MPLS', entityId: 'sensor.ids_tower' },
  { key: 'sheridan_hills', label: 'Sheridan Hills Elementary', entityId: 'sensor.sheridan_hills_elementary' },
  { key: 'moms_house', label: "Mom's House", entityId: 'sensor.waze_travel_time' },
  { key: 'excelsior', label: 'Excelsior Elementary', entityId: 'sensor.excelsior_elementary' },
  { key: 'mmw', label: 'MMW Middle School', entityId: 'sensor.mtka_middle_west' },
  { key: 'victoria', label: 'Downtown Victoria', entityId: 'sensor.victoria_burrow' },
] as const;

// June 10, 2026 — school schedule switch date
const SUMMER_SWITCH = new Date(2026, 5, 10); // months are 0-indexed

function getVisibleKeys(now: Date): string[] {
  const keys: string[] = ['downtown_mpls']; // always visible
  const day = now.getDay();
  const t = now.getHours() * 60 + now.getMinutes();
  const isWeekday = day >= 1 && day <= 5;

  let schoolActive = false;

  if (isWeekday && now < SUMMER_SWITCH) {
    // Sheridan Hills: M–F 6:30a–8a & 1:30p–2:30p
    const isMorning = t >= 390 && t < 480;
    const isAfternoon = t >= 870 && t < 930;
    if (isMorning || isAfternoon) {
      keys.push('sheridan_hills');
      schoolActive = true;
    }
  } else if (isWeekday) {
    // MTKA Middle West + Excelsior: M–F 7a–9a & 2p–4p
    const isMorning = t >= 420 && t < 540;
    const isAfternoon = t >= 840 && t < 960;
    if (isMorning || isAfternoon) {
      keys.push('mmw', 'excelsior');
      schoolActive = true;
    }
  }

  // Victoria shows when schools aren't active
  if (!schoolActive) keys.push('victoria');

  return keys;
}

export function trafficColor(minutes: number | null): string {
  if (minutes == null) return '#8b949e';
  if (minutes <= 25) return '#4ade80'; // green — light
  if (minutes <= 40) return '#fbbf24'; // amber — moderate
  return '#f87171'; // red — heavy
}

export function trafficLabel(minutes: number | null): string {
  if (minutes == null) return 'Unavailable';
  if (minutes <= 25) return 'Light traffic';
  if (minutes <= 40) return 'Moderate traffic';
  return 'Heavy traffic';
}

export function useCommute(now: Date): CommuteState {
  const e0 = useEntity(DESTINATIONS[0].entityId);
  const e1 = useEntity(DESTINATIONS[1].entityId);
  const e2 = useEntity(DESTINATIONS[2].entityId);
  const e3 = useEntity(DESTINATIONS[3].entityId);
  const e4 = useEntity(DESTINATIONS[4].entityId);
  const e5 = useEntity(DESTINATIONS[5].entityId);
  const entities = [e0, e1, e2, e3, e4, e5];

  const visibleKeys = getVisibleKeys(now);

  return useMemo(() => {
    const all: CommuteDestination[] = DESTINATIONS.map((d, i) => {
      const ent = entities[i];
      const mins = ent && ent.state !== 'unavailable' && ent.state !== 'unknown'
        ? Math.round(Number(ent.state))
        : null;
      return {
        key: d.key,
        label: d.label,
        entityId: d.entityId,
        minutes: Number.isNaN(mins) ? null : mins,
        route: (ent?.attributes?.route as string) ?? null,
        distance: (ent?.attributes?.distance as string) ?? null,
      };
    });

    const visible = all.filter((d) => visibleKeys.includes(d.key));

    return { visible, all };
  }, [
    e0?.state, e1?.state, e2?.state, e3?.state, e4?.state, e5?.state,
    visibleKeys.join(','),
  ]);
}
