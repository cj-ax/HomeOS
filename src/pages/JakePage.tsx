/**
 * JakePage — Age 9 Dashboard
 * Phase 10 placeholder
 */

import { Card } from '@/components/common/Card';
import styles from './KidPage.module.css';

export function JakePage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.greeting}>Hey Jake</span>
      </div>
      <div className={styles.grid}>
        <Card title="Chores" accent="var(--accent-amber)">
          <p className={styles.placeholder}>Points System — Phase 10</p>
        </Card>
        <Card title="Leaderboard" accent="var(--accent-teal)">
          <p className={styles.placeholder}>Family Rankings — Phase 10</p>
        </Card>
        <Card title="Countdowns" accent="var(--accent-blue)">
          <p className={styles.placeholder}>Events — Phase 10</p>
        </Card>
        <Card title="Spotify" accent="var(--accent-green)">
          <p className={styles.placeholder}>Music — Phase 10</p>
        </Card>
      </div>
    </div>
  );
}
