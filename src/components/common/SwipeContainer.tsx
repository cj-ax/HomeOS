/**
 * SwipeContainer — Horizontal panel navigation
 *
 * Each child becomes one swipe panel. Swiper.js handles
 * the physics, snap points, and touch gestures.
 */

import { type ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y } from 'swiper/modules';
import styles from './SwipeContainer.module.css';

import 'swiper/css';
import 'swiper/css/pagination';

export interface SwipePanel {
  id: string;
  label: string;
  content: ReactNode;
}

interface SwipeContainerProps {
  panels: SwipePanel[];
  initialIndex?: number;
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
        threshold={10}
        resistance={true}
        resistanceRatio={0.85}
        speed={350}
        cssMode={false}
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
