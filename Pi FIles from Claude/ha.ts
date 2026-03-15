/**
 * Home Assistant Connection Utilities
 * 
 * Analogy: If HA is a radio station broadcasting on many channels,
 * this file is the radio tuner. It connects to the station (WebSocket),
 * and the hooks below let individual components tune into specific 
 * channels (entity state subscriptions).
 */

import {
  createConnection,
  createLongLivedTokenAuth,
  type Connection,
  type HassEntities,
  type HassEntity,
  subscribeEntities,
  type HassEvent,
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

  // Convert ws:// URL to http:// for the auth handshake
  // The WS library handles upgrading back to WebSocket internally
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

/** Subscribe to all entity state changes and invoke callback with full state map */
export function subscribeToEntities(
  connection: Connection,
  callback: (entities: HassEntities) => void
): () => void {
  // subscribeEntities returns an unsubscribe function
  const unsub = subscribeEntities(connection, callback);
  return unsub;
}

/** Subscribe to a specific HA event type (e.g., 'ring_doorbell_press') */
export function subscribeToEvent(
  connection: Connection,
  eventType: string,
  callback: (event: HassEvent) => void
): () => void {
  let unsubPromise: Promise<() => void>;

  unsubPromise = connection.subscribeEvents(callback, eventType);

  // Return a sync unsub that resolves the promise internally
  return () => {
    unsubPromise.then((unsub) => unsub());
  };
}

/** Call a Home Assistant service (e.g., turning on a light, triggering TTS) */
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
