import { useMemo } from 'react';
import type { HassEntity } from 'home-assistant-js-websocket';
import { useHomeAssistant } from './useHomeAssistant';

/**
 * Subscribe to a single Home Assistant entity by ID.
 * 
 * Analogy: If useHomeAssistant() gives you the full newspaper,
 * useEntity() clips out just the one article you care about.
 * It re-renders your component only when that entity changes.
 * 
 * Usage:
 *   const thermostat = useEntity('climate.living_room');
 *   if (thermostat) {
 *     console.log(thermostat.state);           // "heat"
 *     console.log(thermostat.attributes.temperature); // 72
 *   }
 * 
 * Returns undefined if the entity doesn't exist (yet).
 */
export function useEntity(entityId: string): HassEntity | undefined {
  const { entities } = useHomeAssistant();

  // Memoize so downstream components don't re-render unless
  // the specific entity's last_changed timestamp actually differs
  const entity = useMemo(() => {
    return entities[entityId];
  }, [entities[entityId]?.last_changed, entities[entityId]?.state, entityId]);

  return entity;
}
