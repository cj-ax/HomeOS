/**
 * Card — Glassmorphism container
 * 
 * Every data widget on every screen is wrapped in a Card.
 * Think of it like a frosted glass tile that floats over the
 * dark background. It handles the blur, border, shadow, and
 * optional header/accent color — so individual widgets only
 * need to worry about their content.
 */

import { type ReactNode, type CSSProperties } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
  /** Card title shown in the header area */
  title?: string;
  /** Optional icon element to show beside the title */
  icon?: ReactNode;
  /** Accent color for the top edge glow (use theme accent colors) */
  accent?: string;
  /** Render as a larger card (more padding) */
  size?: 'default' | 'compact' | 'large';
  /** Whether this card is interactive (adds hover/active states) */
  interactive?: boolean;
  /** Fill available height */
  fullHeight?: boolean;
  /** Content */
  children: ReactNode;
  /** Additional inline styles */
  style?: CSSProperties;
}

export function Card({
  title,
  icon,
  accent,
  size = 'default',
  interactive = false,
  fullHeight = false,
  children,
  style,
  ...motionProps
}: CardProps) {
  const sizeClass = styles[`size-${size}`];
  
  const cardStyle: CSSProperties = {
    ...style,
    // If an accent color is provided, add a subtle top border glow
    ...(accent
      ? {
          borderTopColor: accent,
          boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2), inset 0 1px 0 ${accent}33`,
        }
      : {}),
  };

  return (
    <motion.div
      className={`${styles.card} ${sizeClass} ${interactive ? styles.interactive : ''} ${fullHeight ? styles.fullHeight : ''}`}
      style={cardStyle}
      // Subtle entrance animation — cards fade up on mount
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...motionProps}
    >
      {(title || icon) && (
        <div className={styles.header}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {title && <h3 className={styles.title}>{title}</h3>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </motion.div>
  );
}
