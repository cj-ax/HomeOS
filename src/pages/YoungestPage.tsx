/**
 * YoungestPage — Age 7 Dashboard
 * Phase 11 placeholder — giant icon buttons, 64px+ touch targets
 */

import { Card } from '@/components/common/Card';
import styles from './KidPage.module.css';

export function YoungestPage() {
  return (
    <div className={styles.pageYoungest}>
      <div className={styles.header}>
        <span className={styles.greeting} style={{ fontSize: 'var(--font-2xl)' }}>
          Good morning!
        </span>
      </div>
      <div className={styles.grid}>
        <Card accent="var(--accent-green)" interactive>
          <div className={styles.bigButton}>
            <span className={styles.bigIcon}>M</span>
            Music
          </div>
        </Card>
        <Card accent="var(--accent-amber)" interactive>
          <div className={styles.bigButton}>
            <span className={styles.bigIcon}>C</span>
            Chores
          </div>
        </Card>
        <Card accent="var(--accent-blue)" interactive>
          <div className={styles.bigButton}>
            <span className={styles.bigIcon}>P</span>
            Call Mom &amp; Dad
          </div>
        </Card>
        <Card accent="var(--accent-purple)" interactive>
          <div className={styles.bigButton}>
            <span className={styles.bigIcon}>B</span>
            Bedtime
          </div>
        </Card>
      </div>
    </div>
  );
}
