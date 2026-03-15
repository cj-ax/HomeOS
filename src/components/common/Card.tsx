/**
 * Card — Glassmorphism container
 *
 * Every data widget on every screen is wrapped in a Card.
 * Handles blur, border, shadow, and optional header/accent color.
 */

import { type ReactNode, type CSSProperties } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
  title?: string;
  icon?: ReactNode;
  accent?: string;
  size?: 'default' | 'compact' | 'large';
  interactive?: boolean;
  fullHeight?: boolean;
  children: ReactNode;
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
  const sizeClass = styles[`size-${size}`] ?? '';

  const cardStyle: CSSProperties = {
    ...style,
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
