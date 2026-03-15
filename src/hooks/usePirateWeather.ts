/**
 * usePirateWeather — Pirate Weather precipitation data via HA WebSocket
 *
 * Subscribes to the weather.pirateweather entity for current conditions
 * and calls weather/subscribe_forecast for hourly/daily precipitation forecasts.
 * API key stays on the Pi — never touches the frontend.
 */

import { useState, useEffect } from 'react';
import { useHomeAssistant } from './useHomeAssistant';
import { useEntity } from './useEntity';

const ENTITY_ID = 'weather.pirateweather';

export interface PirateHourlyForecast {
  datetime: string;
  precipitation: number;
  precipitation_probability: number;
  condition: string;
  temperature: number;
  wind_speed: number;
}

export interface PirateDailyForecast {
  datetime: string;
  precipitation: number;
  precipitation_probability: number;
  condition: string;
  temperature: number;
  templow: number;
  wind_speed: number;
}

export interface PrecipNow {
  /** Human-readable summary, e.g. "Snow for 42 min" */
  summary: string | null;
  /** Current precipitation intensity in inches/hr */
  intensity: number;
  /** Current condition from HA (snowy, rainy, cloudy, etc.) */
  condition: string;
}

export function usePirateWeather() {
  const { connection } = useHomeAssistant();
  const entity = useEntity(ENTITY_ID);

  const [hourly, setHourly] = useState<PirateHourlyForecast[]>([]);
  const [daily, setDaily] = useState<PirateDailyForecast[]>([]);

  // Subscribe to hourly forecast
  useEffect(() => {
    if (!connection) return;

    let unsub: (() => void) | null = null;

    connection
      .subscribeMessage(
        (msg: { type: string; forecast: PirateHourlyForecast[] }) => {
          if (msg.forecast) {
            setHourly(msg.forecast);
          }
        },
        {
          type: 'weather/subscribe_forecast',
          forecast_type: 'hourly',
          entity_id: ENTITY_ID,
        }
      )
      .then((unsubFn) => {
        unsub = unsubFn;
      })
      .catch((err) => {
        console.warn('[Home OS] Pirate Weather hourly forecast subscription failed:', err);
      });

    return () => {
      unsub?.();
    };
  }, [connection]);

  // Subscribe to daily forecast
  useEffect(() => {
    if (!connection) return;

    let unsub: (() => void) | null = null;

    connection
      .subscribeMessage(
        (msg: { type: string; forecast: PirateDailyForecast[] }) => {
          if (msg.forecast) {
            setDaily(msg.forecast);
          }
        },
        {
          type: 'weather/subscribe_forecast',
          forecast_type: 'daily',
          entity_id: ENTITY_ID,
        }
      )
      .then((unsubFn) => {
        unsub = unsubFn;
      })
      .catch((err) => {
        console.warn('[Home OS] Pirate Weather daily forecast subscription failed:', err);
      });

    return () => {
      unsub?.();
    };
  }, [connection]);

  // Current precipitation info from entity attributes
  const precip: PrecipNow = {
    summary: entity?.attributes?.minutely_summary ?? null,
    intensity: entity?.attributes?.precip_intensity ?? 0,
    condition: entity?.state ?? 'unknown',
  };

  return {
    available: !!entity,
    precip,
    hourly,
    daily,
    entity,
  };
}
