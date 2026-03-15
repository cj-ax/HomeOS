/**
 * YoungestPage — Age 7 Dashboard
 * 
 * This is the simplest, most kid-friendly interface.
 * Giant icon buttons only: Music, Chores, Call Mom/Dad, Bedtime.
 * Bedtime color countdown (green → yellow → red), album art 
 * Spotify with a big play/pause, and a time-triggered morning
 * greeting screen.
 * 
 * Touch targets here are 64px+ minimum (--touch-kid-min).
 * Phase 11 placeholder — the big buttons are stubbed out now.
 */

import { Card } from '@/components/common/Card';
import styles from './KidPage.module.css';

export function YoungestPage() {
  return (
    <div className={styles.pageYoungest}>
      <div className={styles.header}>
        <span className={styles.greeting} style={{ fontSize: 'var(--font-2xl)' }}>
          Good morning! ☀️
        </span>
      </div>
      <div className={styles.grid}>
        <Card accent="var(--accent-green)" interactive>
          <div className={styles.bigButton}>
            <span className={styles.bigIcon}>🎵</span>
            Music
          </div>
        </Card>
        <Card accent="var(--accent-amber)" interactive>
          <div className={styles.bigButton}>
            <span className={styles.bigIcon}>✅</span>
            Chores
          </div>
        </Card>
        <Card accent="var(--accent-blue)" interactive>
          <div className={styles.bigButton}>
            <span className={styles.bigIcon}>📞</span>
            Call Mom & Dad
          </div>
        </Card>
        <Card accent="var(--accent-purple)" interactive>
          <div className={styles.bigButton}>
            <span className={styles.bigIcon}>🌙</span>
            Bedtime
          </div>
        </Card>
      </div>
    </div>
  );
}
