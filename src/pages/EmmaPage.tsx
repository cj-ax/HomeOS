/**
 * EmmaPage — Age 11 Dashboard
 * Phase 9 placeholder
 */

import { Card } from '@/components/common/Card';
import styles from './KidPage.module.css';

export function EmmaPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.greeting}>Hey Emma</span>
      </div>
      <div className={styles.grid}>
        <Card title="Spotify" accent="var(--accent-green)">
          <p className={styles.placeholder}>Music — Phase 9</p>
        </Card>
        <Card title="Chores" accent="var(--accent-amber)">
          <p className={styles.placeholder}>Streak Counter — Phase 9</p>
        </Card>
        <Card title="Calendar" accent="var(--accent-blue)">
          <p className={styles.placeholder}>Homework — Phase 9</p>
        </Card>
        <Card title="Weather" accent="var(--accent-teal)">
          <p className={styles.placeholder}>Forecast — Phase 9</p>
        </Card>
      </div>
    </div>
  );
}
