/**
 * useNWSAlerts — National Weather Service active alerts
 *
 * Fetches active weather alerts for Victoria, MN from the NWS API.
 * Free, no API key, authoritative source. Updates every 5 minutes.
 */

import { useState, useEffect, useCallback } from 'react';

const LAT = 44.8583;
const LON = -93.6616;
const URL = `https://api.weather.gov/alerts/active?point=${LAT},${LON}&status=actual`;

export interface NWSAlert {
  event: string; // "Blizzard Warning", "Tornado Watch", etc.
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  headline: string;
  description: string;
  expires: string; // ISO timestamp
}

export function useNWSAlerts() {
  const [alerts, setAlerts] = useState<NWSAlert[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(URL, {
        headers: { 'User-Agent': 'HomeOS Dashboard (personal use)' },
      });
      if (!res.ok) throw new Error(`NWS Alerts ${res.status}`);
      const json = await res.json();

      const parsed: NWSAlert[] = (json.features ?? []).map(
        (f: { properties: Record<string, string> }) => ({
          event: f.properties.event,
          severity: f.properties.severity,
          headline: f.properties.headline ?? '',
          description: f.properties.description ?? '',
          expires: f.properties.expires ?? '',
        })
      );

      setAlerts(parsed);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'NWS alerts fetch failed';
      console.warn('[Home OS] NWS alerts error:', msg);
      setError(msg);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000); // 5 min
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return { alerts, error, refetch: fetchAlerts };
}
