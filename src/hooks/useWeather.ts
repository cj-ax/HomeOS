/**
 * useWeather — Open-Meteo weather data hook
 *
 * Fetches current conditions + 7-day forecast for Victoria, MN.
 * Updates every 30 minutes. No API key required.
 */

import { useState, useEffect, useCallback } from 'react';

// Victoria, MN coordinates
const LAT = 44.8583;
const LON = -93.6616;

const API = 'https://api.open-meteo.com/v1/forecast';

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
  dewPoint: number;
  uvIndex: number;
  apparentTemperature: number;
  pressure: number;
  visibility: number;
  cloudCover: number;
}

export interface DailyForecast {
  date: string;
  day: string;
  hi: number;
  lo: number;
  weatherCode: number;
  precipProbability: number;
  precipSum: number;
  snowfallSum: number;
  rainSum: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  precipProbability: number;
  humidity: number;
  windSpeed: number;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  lastUpdated: Date;
}

/** Map WMO weather codes to simple type strings for icons */
export function wmoToType(code: number): string {
  if (code <= 1) return 'sun';
  if (code <= 3) return 'cloud';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95) return 'rain'; // thunderstorm
  return 'cloud';
}

/** Map WMO weather codes to human-readable descriptions */
export function wmoToDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildUrl(): string {
  const params = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'is_day',
      'surface_pressure',
      'cloud_cover',
    ].join(','),
    hourly: [
      'temperature_2m',
      'weather_code',
      'precipitation_probability',
      'relative_humidity_2m',
      'wind_speed_10m',
      'dew_point_2m',
      'uv_index',
      'visibility',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'snowfall_sum',
      'rain_sum',
      'wind_speed_10m_max',
      'sunrise',
      'sunset',
      'uv_index_max',
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'America/Chicago',
    forecast_days: '7',
    forecast_hours: '24',
  });
  return `${API}?${params}`;
}

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch(buildUrl());
      if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
      const json = await res.json();

      // Find current hour index for dew point / UV from hourly data
      const now = new Date();
      const currentHour = now.getHours();

      const current: CurrentWeather = {
        temperature: Math.round(json.current.temperature_2m),
        humidity: Math.round(json.current.relative_humidity_2m),
        windSpeed: Math.round(json.current.wind_speed_10m),
        windDirection: json.current.wind_direction_10m,
        weatherCode: json.current.weather_code,
        isDay: json.current.is_day === 1,
        apparentTemperature: Math.round(json.current.apparent_temperature),
        pressure: Math.round(json.current.surface_pressure),
        cloudCover: json.current.cloud_cover,
        dewPoint: json.hourly?.dew_point_2m?.[currentHour] != null
          ? Math.round(json.hourly.dew_point_2m[currentHour])
          : 0,
        uvIndex: json.hourly?.uv_index?.[currentHour] != null
          ? Math.round(json.hourly.uv_index[currentHour] * 10) / 10
          : 0,
        visibility: json.hourly?.visibility?.[currentHour] != null
          ? Math.round(json.hourly.visibility[currentHour] / 5280) // meters to miles
          : 10,
      };

      const daily: DailyForecast[] = json.daily.time.map((date: string, i: number) => {
        const d = new Date(date + 'T12:00:00');
        const isToday = i === 0;
        return {
          date,
          day: isToday ? 'Today' : DAY_NAMES[d.getDay()],
          hi: Math.round(json.daily.temperature_2m_max[i]),
          lo: Math.round(json.daily.temperature_2m_min[i]),
          weatherCode: json.daily.weather_code[i],
          precipProbability: json.daily.precipitation_probability_max[i],
          precipSum: json.daily.precipitation_sum[i],
          snowfallSum: json.daily.snowfall_sum[i],
          rainSum: json.daily.rain_sum[i],
          windSpeedMax: Math.round(json.daily.wind_speed_10m_max[i]),
          sunrise: json.daily.sunrise[i],
          sunset: json.daily.sunset[i],
          uvIndexMax: json.daily.uv_index_max[i],
        };
      });

      const hourly: HourlyForecast[] = json.hourly.time.map((t: string, i: number) => ({
        time: t,
        temperature: Math.round(json.hourly.temperature_2m[i]),
        weatherCode: json.hourly.weather_code[i],
        precipProbability: json.hourly.precipitation_probability[i],
        humidity: Math.round(json.hourly.relative_humidity_2m[i]),
        windSpeed: Math.round(json.hourly.wind_speed_10m[i]),
      }));

      setData({ current, daily, hourly, lastUpdated: new Date() });
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Weather fetch failed';
      console.error('[Home OS] Weather error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // 30 min
    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { data, loading, error, refetch: fetchWeather };
}
