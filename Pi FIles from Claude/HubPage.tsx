/**
 * HubPage — Main Family Dashboard
 * 
 * This is what the Fire HD 10 in the common area shows.
 * It's a horizontal swipe interface with 6 panels:
 * Home → Energy → Security → Life Admin → Media → Family
 * 
 * Right now we're laying the skeleton. Each panel is a placeholder
 * that will be filled with real widgets in Phases 2–8.
 */

import { useState } from 'react';
import { SwipeContainer, type SwipePanel } from '@/components/common/SwipeContainer';
import { Card } from '@/components/common/Card';
import { useHomeAssistant } from '@/hooks/useHomeAssistant';
import styles from './HubPage.module.css';

export function HubPage() {
  const { connecting, error, entities, reconnect } = useHomeAssistant();
  const [activePanel, setActivePanel] = useState(0);

  // Count connected entities as a health check
  const entityCount = Object.keys(entities).length;

  const panels: SwipePanel[] = [
    {
      id: 'home',
      label: 'Home',
      content: (
        <div className={styles.panelGrid}>
          <Card title="Welcome" accent="var(--accent-teal)">
            <p className={styles.heroText}>Home OS</p>
            <p className={styles.subText}>
              {connecting
                ? 'Connecting to Home Assistant...'
                : error
                  ? `Connection error: ${error}`
                  : `Connected — ${entityCount} entities`}
            </p>
            {error && (
              <button className={styles.retryButton} onClick={reconnect}>
                Retry Connection
              </button>
            )}
          </Card>
          <Card title="Clock">
            <p className={styles.placeholder}>Clock + Date — Phase 2</p>
          </Card>
          <Card title="Weather">
            <p className={styles.placeholder}>5-Day Forecast — Phase 2</p>
          </Card>
          <Card title="Calendar">
            <p className={styles.placeholder}>Upcoming Events — Phase 2</p>
          </Card>
          <Card title="Commute">
            <p className={styles.placeholder}>Travel Times — Phase 2</p>
          </Card>
        </div>
      ),
    },
    {
      id: 'energy',
      label: 'Energy',
      content: (
        <div className={styles.panelGrid}>
          <Card title="Electricity" accent="var(--accent-amber)">
            <p className={styles.placeholder}>Live Usage Gauge — Phase 3</p>
          </Card>
          <Card title="Gas">
            <p className={styles.placeholder}>Gas Usage — Phase 3</p>
          </Card>
          <Card title="Bill Predictor">
            <p className={styles.placeholder}>Monthly Estimate — Phase 3</p>
          </Card>
          <Card title="Peak Hours">
            <p className={styles.placeholder}>Peak Alert — Phase 3</p>
          </Card>
          <Card title="Water">
            <p className={styles.placeholder}>Water Tracking — Phase 3</p>
          </Card>
        </div>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      content: (
        <div className={styles.panelGrid}>
          <Card title="Motion Zones" accent="var(--accent-red)">
            <p className={styles.placeholder}>Zone Status — Phase 4</p>
          </Card>
          <Card title="Alarm">
            <p className={styles.placeholder}>Arm / Disarm — Phase 4</p>
          </Card>
          <Card title="Sprinklers">
            <p className={styles.placeholder}>Zone Controls + Timers — Phase 4</p>
          </Card>
        </div>
      ),
    },
    {
      id: 'admin',
      label: 'Life Admin',
      content: (
        <div className={styles.panelGrid}>
          <Card title="Bills" accent="var(--accent-purple)">
            <p className={styles.placeholder}>Upcoming Bills — Phase 6</p>
          </Card>
          <Card title="Calendar">
            <p className={styles.placeholder}>Extended View — Phase 6</p>
          </Card>
          <Card title="Plants">
            <p className={styles.placeholder}>Soil Moisture — Phase 6</p>
          </Card>
        </div>
      ),
    },
    {
      id: 'media',
      label: 'Media',
      content: (
        <div className={styles.panelGrid}>
          <Card title="Now Playing" accent="var(--accent-green)">
            <p className={styles.placeholder}>Spotify — Phase 7</p>
          </Card>
        </div>
      ),
    },
    {
      id: 'family',
      label: 'Family',
      content: (
        <div className={styles.panelGrid}>
          <Card title="Broadcast" accent="var(--accent-blue)">
            <p className={styles.placeholder}>Send to All Screens — Phase 8</p>
          </Card>
          <Card title="Chores">
            <p className={styles.placeholder}>Chore Overview — Phase 8</p>
          </Card>
          <Card title="Screens">
            <p className={styles.placeholder}>Kid Screen Status — Phase 8</p>
          </Card>
          <Card title="Bedtime">
            <p className={styles.placeholder}>Lock Controls — Phase 8</p>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <SwipeContainer
        panels={panels}
        onSlideChange={setActivePanel}
      />
    </div>
  );
}
