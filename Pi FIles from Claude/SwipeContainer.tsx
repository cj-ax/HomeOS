/**
 * SwipeContainer — Horizontal panel navigation
 * 
 * Analogy: Think of this like a horizontal scroll of full-screen
 * "pages" — similar to swiping between home screens on a phone.
 * Each child you pass in becomes one swipe panel. Swiper.js handles
 * the physics, snap points, and touch gestures.
 * 
 * The hub screen uses this so you swipe left/right between
 * Home → Energy → Security → Life Admin → Media → Family
 */

import { type ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y } from 'swiper/modules';
import styles from './SwipeContainer.module.css';

// Swiper core + module styles
import 'swiper/css';
import 'swiper/css/pagination';

export interface SwipePanel {
  /** Unique key for this panel */
  id: string;
  /** Label shown in the pagination indicator */
  label: string;
  /** The panel content */
  content: ReactNode;
}

interface SwipeContainerProps {
  /** Array of panels to render as swipeable pages */
  panels: SwipePanel[];
  /** Which panel index to start on (default 0) */
  initialIndex?: number;
  /** Callback when active panel changes */
  onSlideChange?: (index: number) => void;
}

export function SwipeContainer({
  panels,
  initialIndex = 0,
  onSlideChange,
}: SwipeContainerProps) {
  return (
    <div className={styles.container}>
      <Swiper
        modules={[Pagination, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        initialSlide={initialIndex}
        pagination={{
          clickable: true,
          el: `.${styles.pagination}`,
          bulletClass: styles.bullet,
          bulletActiveClass: styles.bulletActive,
          renderBullet: (index: number, className: string) => {
            const label = panels[index]?.label ?? '';
            return `<button class="${className}" aria-label="${label}">${label}</button>`;
          },
        }}
        onSlideChange={(swiper) => onSlideChange?.(swiper.activeIndex)}
        // Touch settings optimized for tablet use
        threshold={10}          // Minimum drag distance before swipe triggers
        resistance={true}
        resistanceRatio={0.85}
        speed={350}
        cssMode={false}         // Hardware-accelerated transforms
        a11y={{
          prevSlideMessage: 'Previous panel',
          nextSlideMessage: 'Next panel',
        }}
        className={styles.swiper}
      >
        {panels.map((panel) => (
          <SwiperSlide key={panel.id} className={styles.slide}>
            <div className={styles.slideContent}>
              {panel.content}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Custom pagination bar at the top */}
      <div className={styles.pagination} />
    </div>
  );
}
