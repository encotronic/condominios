import React from 'react';
import { motion } from 'framer-motion';
import styles from './ui.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: boolean;
  rounded?: boolean;
}

export const Card: React.FC<React.PropsWithChildren<CardProps>> = ({
  children,
  className = '',
  shadow = true,
  rounded = true,
  ...props
}) => {
  const classNames = `${styles.card} ${shadow ? styles.cardShadow : ''} ${rounded ? styles.cardRounded : ''} ${className}`.trim();
  return (
    <motion.div
      layout
      whileHover={{ translateY: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={classNames}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className = '',
  ...props
}) => <div className={`${styles.cardHeader} ${className}`.trim()} {...props}>{children}</div>;

export const CardContent: React.FC<React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className = '',
  ...props
}) => <div className={`${styles.cardContent} ${className}`.trim()} {...props}>{children}</div>;

export const CardTitle: React.FC<React.PropsWithChildren<any>> = ({ children, className = '' }) => (
  <h3 className={`${styles.cardTitle} ${className}`.trim()}>{children}</h3>
);

export const CardDescription: React.FC<React.PropsWithChildren<any>> = ({ children, className = '' }) => (
  <p className={`${styles.cardDescription} ${className}`.trim()}>{children}</p>
);

export default Card;
