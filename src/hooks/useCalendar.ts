/**
 * useCalendar — Fetches events from HA Google Calendar entities
 *
 * Uses the HA REST API (GET /api/calendars/{entity_id}) to get events,
 * since the WebSocket calendar/list_events command isn't available in all versions.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useHomeAssistant } from './useHomeAssistant';

const CALENDAR_ENTITIES = [
  'calendar.hello_chrisaxelson_com',
  'calendar.birthdays',
  'calendar.holidays_in_united_states',
];

const HA_TOKEN = import.meta.env.VITE_HA_TOKEN ?? '';

export interface CalendarEvent {
  summary: string;
  start: string; // ISO datetime or date
  end: string;
  allDay: boolean;
  calendar: string; // entity_id source
  location?: string;
  description?: string;
}

/** Format event time for display — "3:00 PM" or "All day" */
export function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) return 'All day';
  const d = new Date(event.start);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Format a date for upcoming events — "Mon, Mar 17" */
export function formatEventDate(event: CalendarEvent): string {
  const d = event.allDay ? new Date(event.start + 'T00:00:00') : new Date(event.start);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

/** Check if an event is today (local time) */
export function isToday(event: CalendarEvent): boolean {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return event.start.startsWith(todayStr);
}

/** Get a color for a calendar entity */
export function calendarColor(entityId: string): string {
  if (entityId.includes('birthday')) return '#f472b6'; // pink
  if (entityId.includes('holiday')) return '#60a5fa'; // blue
  return '#c4b5fd'; // purple (default/personal)
}

/** Friendly label for a calendar entity */
export function calendarLabel(entityId: string): string {
  if (entityId.includes('birthday')) return 'Birthday';
  if (entityId.includes('holiday')) return 'Holiday';
  return 'Personal';
}

export function useCalendar() {
  const { connection } = useHomeAssistant();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!connection) return;

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59);

      const pad = (n: number) => String(n).padStart(2, '0');
      const toLocal = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      const start = toLocal(startOfDay);
      const end = toLocal(endOfWeek);

      const allEvents: CalendarEvent[] = [];

      for (const entityId of CALENDAR_ENTITIES) {
        try {
          const url = `/ha-api/calendars/${entityId}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
          const resp = await fetch(url, {
            headers: { Authorization: `Bearer ${HA_TOKEN}` },
          });

          if (!resp.ok) {
            console.warn(`[Home OS] Calendar ${entityId}: HTTP ${resp.status}`);
            continue;
          }

          const data: {
            summary: string;
            start: { dateTime?: string; date?: string };
            end: { dateTime?: string; date?: string };
            location?: string;
            description?: string;
          }[] = await resp.json();

          for (const ev of data) {
            const startVal = ev.start.dateTime ?? ev.start.date ?? '';
            const endVal = ev.end.dateTime ?? ev.end.date ?? '';
            const allDay = !ev.start.dateTime;

            allEvents.push({
              summary: ev.summary,
              start: startVal,
              end: endVal,
              allDay,
              calendar: entityId,
              location: ev.location,
              description: ev.description,
            });
          }
        } catch (err) {
          console.warn(`[Home OS] Failed to fetch calendar ${entityId}:`, err);
        }
      }

      // Sort: all-day events first, then by start time
      allEvents.sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        return a.start.localeCompare(b.start);
      });

      setEvents(allEvents);
    } catch (err) {
      console.error('[Home OS] Calendar fetch error:', err);
      setError('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [connection]);

  // Fetch on mount and every 5 minutes
  useEffect(() => {
    fetchEvents();
    intervalRef.current = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchEvents]);

  return { events, loading, error, refresh: fetchEvents };
}
