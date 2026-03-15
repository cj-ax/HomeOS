import { useMemo } from 'react';
import type { HassEntity } from 'home-assistant-js-websocket';
import { useHomeAssistant } from './useHomeAssistant';

/**
 * Subscribe to a single Home Assistant entity by ID.
 * Returns undefined if the entity doesn't exist (yet).
 */
export function useEntity(entityId: string): HassEntity | undefined {
  const { entities } = useHomeAssistant();

  const entity = useMemo(() => {
    return entities[entityId];
  }, [entities[entityId]?.last_changed, entities[entityId]?.state, entityId]);

  return entity;
}
