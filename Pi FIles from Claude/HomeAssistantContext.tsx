/**
 * HomeAssistantContext
 * 
 * Analogy: This is like the WiFi router for HA data.
 * It sits at the top of the component tree and provides a single
 * shared connection + entity state to every component below it.
 * Components don't each open their own WebSocket — they all
 * tap into this one shared pipe.
 */

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type { Connection, HassEntities } from 'home-assistant-js-websocket';
import { connectToHA, subscribeToEntities } from '@/utils/ha';

export interface HomeAssistantContextValue {
  /** The raw HA WebSocket connection (null while connecting) */
  connection: Connection | null;
  /** Full map of all entity states, keyed by entity_id */
  entities: HassEntities;
  /** Whether we're currently trying to connect */
  connecting: boolean;
  /** Connection error message, if any */
  error: string | null;
  /** Manually retry connection */
  reconnect: () => void;
}

export const HomeAssistantContext = createContext<HomeAssistantContextValue>({
  connection: null,
  entities: {},
  connecting: true,
  error: null,
  reconnect: () => {},
});

interface Props {
  children: ReactNode;
}

export function HomeAssistantProvider({ children }: Props) {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [entities, setEntities] = useState<HassEntities>({});
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if component is mounted to avoid state updates after unmount
  const mountedRef = useRef(true);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);

    try {
      const conn = await connectToHA();
      
      if (!mountedRef.current) {
        conn.close();
        return;
      }

      setConnection(conn);

      // Subscribe to all entity state changes
      subscribeToEntities(conn, (newEntities) => {
        if (mountedRef.current) {
          setEntities(newEntities);
        }
      });

      // Handle unexpected disconnects
      conn.addEventListener('disconnected', () => {
        console.warn('[Home OS] Disconnected from HA — will auto-reconnect');
      });

      conn.addEventListener('ready', () => {
        console.log('[Home OS] HA connection ready');
      });

      setConnecting(false);
    } catch (err) {
      if (mountedRef.current) {
        const message = err instanceof Error ? err.message : 'Unknown connection error';
        console.error('[Home OS] Connection failed:', message);
        setError(message);
        setConnecting(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      // The library handles cleanup internally on connection close
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (connection) {
      connection.close();
      setConnection(null);
    }
    connect();
  }, [connection, connect]);

  return (
    <HomeAssistantContext.Provider
      value={{ connection, entities, connecting, error, reconnect }}
    >
      {children}
    </HomeAssistantContext.Provider>
  );
}
