/**
 * useNWSForecast — National Weather Service snowfall + rain data
 *
 * Fetches quantitative precipitation from the NWS gridpoint API.
 * Free, no API key, authoritative source for US weather.
 * Updates every 30 minutes.
 */

import { useState, useEffect, useCallback } from 'react';

// Victoria, MN → NWS grid: MPX office, grid 95,66
const GRIDPOINT_URL = 'https://api.weather.gov/gridpoints/MPX/95,66';

interface DailyPrecip {
  date: string; // YYYY-MM-DD
  snowfall: number; // inches
  rain: number; // inches
}

export function useNWSForecast() {
  const [daily, setDaily] = useState<DailyPrecip[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(GRIDPOINT_URL, {
        headers: { 'User-Agent': 'HomeOS Dashboard (personal use)' },
      });
      if (!res.ok) throw new Error(`NWS API ${res.status}`);
      const json = await res.json();

      const snowValues: { time: string; hours: number; value: number }[] =
        (json.properties?.snowfallAmount?.values ?? []).map(parseTimeValue);
      const rainValues: { time: string; hours: number; value: number }[] =
        (json.properties?.quantitativePrecipitation?.values ?? []).map(parseTimeValue);

      // Aggregate into daily totals (mm → inches)
      const snowByDay = aggregateByDay(snowValues);
      const rainByDay = aggregateByDay(rainValues);

      const allDates = new Set([...Object.keys(snowByDay), ...Object.keys(rainByDay)]);
      const sorted = [...allDates].sort();

      const result: DailyPrecip[] = sorted.map((date) => ({
        date,
        snowfall: mmToInches(snowByDay[date] ?? 0),
        rain: mmToInches((rainByDay[date] ?? 0) - (snowByDay[date] ?? 0) * 0.1), // subtract snow liquid equivalent
      }));

      // Ensure rain doesn't go negative
      result.forEach((d) => {
        if (d.rain < 0) d.rain = 0;
      });

      setDaily(result);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'NWS fetch failed';
      console.warn('[Home OS] NWS forecast error:', msg);
      setError(msg);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { daily, error };
}

/** Parse NWS ISO duration time values */
function parseTimeValue(v: { validTime: string; value: number }) {
  const [time, duration] = v.validTime.split('/');
  const hours = parseDuration(duration);
  return { time, hours, value: v.value };
}

/** Parse ISO 8601 duration to hours (e.g. PT6H → 6, PT1H → 1) */
function parseDuration(d: string): number {
  const match = d.match(/PT(\d+)H/);
  return match ? parseInt(match[1], 10) : 1;
}

/** Aggregate time-series values into daily totals by date */
function aggregateByDay(values: { time: string; hours: number; value: number }[]) {
  const byDay: Record<string, number> = {};
  for (const v of values) {
    const date = v.time.slice(0, 10); // YYYY-MM-DD
    byDay[date] = (byDay[date] ?? 0) + v.value;
  }
  return byDay;
}

function mmToInches(mm: number): number {
  return Math.round((mm / 25.4) * 10) / 10;
}
