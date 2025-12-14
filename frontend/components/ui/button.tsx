import React from 'react';
import { motion } from 'framer-motion';
import styles from './ui.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

export const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  disabled,
  ...props
}) => {
  const variantClass = variant === 'primary' ? styles.btnPrimary : variant === 'secondary' ? styles.btnSecondary : styles.btnGhost;
  const sizeClass = size === 'sm' ? styles.btnSm : size === 'lg' ? styles.btnLg : '';
  const disabledClass = disabled ? styles.btnDisabled : '';
  const classes = `${styles.btn} ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim();

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ translateY: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={classes}
      disabled={disabled}
      {...(props as any)}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button;
