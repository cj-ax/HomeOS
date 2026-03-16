/**
 * useRing — Ring camera entities via Home Assistant
 *
 * Subscribes to camera, motion, doorbell, and battery entities
 * for four Ring cameras: Front Door (doorbell), Front Door Exterior,
 * Backyard, and Front of House.
 * Fetches camera snapshots via HA REST API with Bearer auth.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useEntity } from './useEntity';
import { useHomeAssistant } from './useHomeAssistant';
import { subscribeToEvent } from '@/utils/ha';

export interface RingCamera {
  id: string;
  name: string;
  location: string;
  isDoorbell: boolean;
  motionEnabled: boolean;
  motionDetected: boolean;
  motionDetectedAt: number | null; // timestamp
  battery: number | null;
  lastActivity: string;
  snapshotUrl: string | null;
}

const HA_TOKEN = import.meta.env.VITE_HA_TOKEN ?? '';

const CAMERA_ENTITIES = [
  { id: 'front_door', entity: 'camera.front_door_live_view' },
  { id: 'front_door_exterior', entity: 'camera.front_door_live_view_2' },
  { id: 'backyard', entity: 'camera.backyard_live_view' },
  { id: 'front_of_house', entity: 'camera.front_of_house_live_view' },
];

/** Request HA to pull a fresh snapshot from the camera */
async function requestFreshSnapshot(cameraEntity: string): Promise<void> {
  try {
    // Try update_entity first (forces HA to re-poll the camera)
    await fetch('/ha-api/services/homeassistant/update_entity', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entity_id: cameraEntity }),
    });
  } catch {
    // ignore — best-effort wake
  }
}

/** Fetch a camera snapshot as a blob URL */
async function fetchSnapshot(cameraEntity: string, wake = false): Promise<string | null> {
  try {
    if (wake) {
      await requestFreshSnapshot(cameraEntity);
      // Give Ring a moment to respond with a new frame
      await new Promise((r) => setTimeout(r, 3000));
    }
    const resp = await fetch(`/ha-api/camera_proxy/${cameraEntity}?t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${HA_TOKEN}` },
      cache: 'no-store',
    });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function useRing() {
  const { connection } = useHomeAssistant();

  // Camera 1: Front Door (doorbell)
  const motion1 = useEntity('event.front_door_motion');
  const ding1 = useEntity('event.front_door_ding');
  const battery1 = useEntity('sensor.front_door_battery');
  const lastActivity1 = useEntity('sensor.front_door_last_activity');
  const motionSwitch1 = useEntity('switch.front_door_motion_detection');

  // Camera 2: Front Door Exterior
  const motion2 = useEntity('event.front_door_motion_2');
  const ding2 = useEntity('event.front_door_ding_2');
  const battery2 = useEntity('sensor.front_door_battery_2');
  const lastActivity2 = useEntity('sensor.front_door_last_activity_2');
  const motionSwitch2 = useEntity('switch.front_door_motion_detection_2');

  // Camera 3: Backyard (no motion/ding events available)
  const battery3 = useEntity('sensor.backyard_battery');
  const lastActivity3 = useEntity('sensor.backyard_last_activity');

  // Camera 4: Front of House (no motion/ding events available)
  const battery4 = useEntity('sensor.front_of_house_battery');
  const lastActivity4 = useEntity('sensor.front_of_house_last_activity');

  // Track recent motion events (within last 30 seconds)
  const [recentMotion1, setRecentMotion1] = useState(false);
  const [recentMotion2, setRecentMotion2] = useState(false);
  const motionTimer1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionTimer2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track doorbell/motion events for overlay triggers
  const [doorbellPressed, setDoorbellPressed] = useState(false);
  const [motionAlert, setMotionAlert] = useState<string | null>(null);

  // Camera snapshots as blob URLs
  const [snapshots, setSnapshots] = useState<Record<string, string | null>>({});
  const snapshotInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const snapshotsRef = useRef<Record<string, string | null>>({});

  const refreshSnapshots = useCallback(async (wake = false) => {
    const results: Record<string, string | null> = {};
    // Fetch all cameras in parallel
    const entries = await Promise.all(
      CAMERA_ENTITIES.map(async (cam) => [cam.id, await fetchSnapshot(cam.entity, wake)] as const)
    );
    for (const [id, url] of entries) {
      results[id] = url;
    }
    // Revoke old blob URLs
    Object.values(snapshotsRef.current).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    snapshotsRef.current = results;
    setSnapshots(results);
  }, []);

  // Fetch snapshots on mount and every 30 seconds
  useEffect(() => {
    if (!connection) return;

    refreshSnapshots();
    snapshotInterval.current = setInterval(refreshSnapshots, 30000);

    return () => {
      if (snapshotInterval.current) clearInterval(snapshotInterval.current);
    };
  }, [connection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to real-time ring events
  useEffect(() => {
    if (!connection) return;

    const unsubs: (() => void)[] = [];

    unsubs.push(
      subscribeToEvent(connection, 'state_changed', (event) => {
        const data = event.data as { entity_id?: string; new_state?: { state?: string } };
        const eid = data.entity_id;
        const newState = data.new_state?.state;

        // Doorbell ding
        if ((eid === 'event.front_door_ding' || eid === 'event.front_door_ding_2') && newState && newState !== 'unknown') {
          setDoorbellPressed(true);
        }

        // Motion events
        if (eid === 'event.front_door_motion' && newState && newState !== 'unknown') {
          setRecentMotion1(true);
          if (motionTimer1.current) clearTimeout(motionTimer1.current);
          motionTimer1.current = setTimeout(() => setRecentMotion1(false), 30000);
          setMotionAlert('Front Door');
        }
        if (eid === 'event.front_door_motion_2' && newState && newState !== 'unknown') {
          setRecentMotion2(true);
          if (motionTimer2.current) clearTimeout(motionTimer2.current);
          motionTimer2.current = setTimeout(() => setRecentMotion2(false), 30000);
          setMotionAlert('Front Door Exterior');
        }
      })
    );

    return () => {
      unsubs.forEach((u) => u());
      if (motionTimer1.current) clearTimeout(motionTimer1.current);
      if (motionTimer2.current) clearTimeout(motionTimer2.current);
    };
  }, [connection]);

  const dismissDoorbell = useCallback(() => setDoorbellPressed(false), []);
  const dismissMotion = useCallback(() => setMotionAlert(null), []);

  const cameras: RingCamera[] = [
    {
      id: 'front_door',
      name: 'Front Door',
      location: 'Doorbell',
      isDoorbell: true,
      motionEnabled: motionSwitch1?.state === 'on',
      motionDetected: recentMotion1,
      motionDetectedAt: motion1?.attributes?.last_changed
        ? new Date(motion1.attributes.last_changed as string).getTime()
        : null,
      battery: battery1 ? Number(battery1.state) : null,
      lastActivity: lastActivity1?.state ?? 'Unknown',
      snapshotUrl: snapshots['front_door'] ?? null,
    },
    {
      id: 'front_door_exterior',
      name: 'Front Door Exterior',
      location: 'Exterior',
      isDoorbell: false,
      motionEnabled: motionSwitch2?.state === 'on',
      motionDetected: recentMotion2,
      motionDetectedAt: motion2?.attributes?.last_changed
        ? new Date(motion2.attributes.last_changed as string).getTime()
        : null,
      battery: battery2 ? Number(battery2.state) : null,
      lastActivity: lastActivity2?.state ?? 'Unknown',
      snapshotUrl: snapshots['front_door_exterior'] ?? null,
    },
    {
      id: 'backyard',
      name: 'Backyard',
      location: 'Backyard',
      isDoorbell: false,
      motionEnabled: false,
      motionDetected: false,
      motionDetectedAt: null,
      battery: battery3 ? Number(battery3.state) : null,
      lastActivity: lastActivity3?.state ?? 'Unknown',
      snapshotUrl: snapshots['backyard'] ?? null,
    },
    {
      id: 'front_of_house',
      name: 'Front of House',
      location: 'Front Yard',
      isDoorbell: false,
      motionEnabled: false,
      motionDetected: false,
      motionDetectedAt: null,
      battery: battery4 ? Number(battery4.state) : null,
      lastActivity: lastActivity4?.state ?? 'Unknown',
      snapshotUrl: snapshots['front_of_house'] ?? null,
    },
  ];

  const onlineCount = cameras.filter(
    (c) => c.battery !== null || c.lastActivity !== 'Unknown'
  ).length;

  const anyMotion = cameras.some((c) => c.motionDetected);
  const motionCamera = cameras.find((c) => c.motionDetected);

  return {
    cameras,
    onlineCount,
    anyMotion,
    motionCamera,
    doorbellPressed,
    motionAlert,
    dismissDoorbell,
    dismissMotion,
    refreshSnapshots,
  };
}
