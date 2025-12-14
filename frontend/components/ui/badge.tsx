import React from 'react';
import styles from './ui.module.css';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', className = '', ...props }) => {
  const variantClass = variant === 'default' ? styles.badgeDefault : variant === 'success' ? styles.badgeSuccess : variant === 'warning' ? styles.badgeWarning : variant === 'danger' ? styles.badgeDanger : styles.badgeInfo;
  const sizeClass = size === 'sm' ? styles.badgeSm : '';
  return (
    <span className={`${styles.badge} ${variantClass} ${sizeClass} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
};

export default Badge;
