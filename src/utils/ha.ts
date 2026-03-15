/**
 * Home Assistant Connection Utilities
 */

import {
  createConnection,
  createLongLivedTokenAuth,
  type Connection,
  type HassEntities,
  type HassEntity,
  subscribeEntities,
  ERR_CANNOT_CONNECT,
  ERR_INVALID_AUTH,
} from 'home-assistant-js-websocket';

/** Create an authenticated HA WebSocket connection */
export async function connectToHA(): Promise<Connection> {
  const url = import.meta.env.VITE_HA_URL;
  const token = import.meta.env.VITE_HA_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Missing VITE_HA_URL or VITE_HA_TOKEN in environment. ' +
      'Copy .env.example to .env and fill in your HA details.'
    );
  }

  const httpUrl = url.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');
  const auth = createLongLivedTokenAuth(httpUrl, token);

  try {
    const connection = await createConnection({ auth });
    console.log('[Home OS] Connected to Home Assistant');
    return connection;
  } catch (err) {
    if (err === ERR_CANNOT_CONNECT) {
      throw new Error(`Cannot connect to Home Assistant at ${url}. Is it running?`);
    }
    if (err === ERR_INVALID_AUTH) {
      throw new Error('Invalid Home Assistant token. Generate a new Long-Lived Access Token.');
    }
    throw err;
  }
}

/** Subscribe to all entity state changes */
export function subscribeToEntities(
  connection: Connection,
  callback: (entities: HassEntities) => void
): () => void {
  const unsub = subscribeEntities(connection, callback);
  return unsub;
}

/** Subscribe to a specific HA event type */
export function subscribeToEvent(
  connection: Connection,
  eventType: string,
  callback: (event: { data: Record<string, unknown> }) => void
): () => void {
  const unsubPromise = connection.subscribeEvents(callback, eventType);
  return () => {
    unsubPromise.then((unsub) => unsub());
  };
}

/** Call a Home Assistant service */
export async function callService(
  connection: Connection,
  domain: string,
  service: string,
  serviceData?: Record<string, unknown>,
  target?: { entity_id: string | string[] }
): Promise<void> {
  await connection.sendMessagePromise({
    type: 'call_service',
    domain,
    service,
    service_data: serviceData,
    target,
  });
}

/** Type guard: check if an entity exists and has a usable state */
export function isEntityAvailable(entity: HassEntity | undefined): entity is HassEntity {
  return entity !== undefined && entity.state !== 'unavailable' && entity.state !== 'unknown';
}
