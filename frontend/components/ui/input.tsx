import React from 'react';
import { motion } from 'framer-motion';
import styles from './ui.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	hint?: string;
	error?: string | null;
	icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
	label,
	hint,
	error,
	icon,
	className = '',
	...props
}) => {
	const inputClass = `${styles.input} ${error ? styles.inputError : ''} ${className}`.trim();
	return (
		<div className={styles.field}>
			{label && <label className={styles.label}>{label}</label>}
			<motion.div whileFocus={{ scale: 1 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<input className={inputClass} {...props} />
					{icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
				</div>
			</motion.div>
			{hint && !error && <div className={styles.inputHint}>{hint}</div>}
			{error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
		</div>
	);
};

export default Input;
