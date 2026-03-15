/**
 * useMessages — Family messaging via HA input_text helpers
 *
 * Subscribes to input_text entities for real-time message state.
 * Hub writes broadcasts, reads kid messages.
 * Kid screens read broadcasts, write their own messages.
 */

import { useCallback } from 'react';
import { useEntity } from './useEntity';
import { useHomeAssistant } from './useHomeAssistant';
import { callService } from '@/utils/ha';

const ENTITIES = {
  broadcast: 'input_text.family_broadcast',
  emma: 'input_text.emma_message',
  jake: 'input_text.jake_message',
  youngest: 'input_text.youngest_message',
} as const;

export interface FamilyMessage {
  from: string;
  text: string;
  lastChanged: string; // ISO timestamp
  color: string;
}

const COLORS: Record<string, string> = {
  broadcast: '#c4b5fd', // purple
  emma: '#f472b6',      // pink
  jake: '#60a5fa',      // blue
  youngest: '#4ade80',   // green
};

const NAMES: Record<string, string> = {
  broadcast: 'Broadcast',
  emma: 'Emma',
  jake: 'Jake',
  youngest: 'Youngest',
};

export function useMessages() {
  const { connection } = useHomeAssistant();
  const broadcast = useEntity(ENTITIES.broadcast);
  const emma = useEntity(ENTITIES.emma);
  const jake = useEntity(ENTITIES.jake);
  const youngest = useEntity(ENTITIES.youngest);

  const messages: FamilyMessage[] = [
    { key: 'broadcast', entity: broadcast },
    { key: 'emma', entity: emma },
    { key: 'jake', entity: jake },
    { key: 'youngest', entity: youngest },
  ]
    .filter((m) => m.entity && m.entity.state && m.entity.state !== '' && m.entity.state !== 'unknown')
    .map((m) => ({
      from: NAMES[m.key],
      text: m.entity!.state,
      lastChanged: m.entity!.last_changed,
      color: COLORS[m.key],
    }))
    .sort((a, b) => new Date(b.lastChanged).getTime() - new Date(a.lastChanged).getTime());

  const sendBroadcast = useCallback(
    (text: string) => {
      if (!connection) return;
      callService(connection, 'input_text', 'set_value', {
        value: text,
      }, { entity_id: ENTITIES.broadcast });
    },
    [connection]
  );

  const sendAs = useCallback(
    (who: 'emma' | 'jake' | 'youngest', text: string) => {
      if (!connection) return;
      callService(connection, 'input_text', 'set_value', {
        value: text,
      }, { entity_id: ENTITIES[who] });
    },
    [connection]
  );

  return { messages, sendBroadcast, sendAs };
}
