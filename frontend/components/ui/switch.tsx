import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './ui.module.css';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	label?: React.ReactNode;
}

export const Switch: React.FC<SwitchProps> = ({ checked, defaultChecked, onCheckedChange, label, className = '', ...props }) => {
	const isControlled = typeof checked !== 'undefined';
	const [internal, setInternal] = useState<boolean>(!!defaultChecked);
	const value = isControlled ? !!checked : internal;

	const toggle = () => {
		const next = !value;
		if (!isControlled) setInternal(next);
		onCheckedChange?.(next);
	};

	return (
		<label className={`${styles.switchRoot} ${className}`.trim()}>
			<div
				role="switch"
				aria-checked={value}
				onClick={toggle}
				className={`${styles.switchTrack} ${value ? styles.switchOn : ''}`.trim()}
			>
				<motion.div className={styles.switchThumb} layout transition={{ type: 'spring', stiffness: 700, damping: 30 }} style={{ x: value ? 18 : 0 }} />
			</div>
			{label && <span style={{ marginLeft: 8 }}>{label}</span>}
			<input type="checkbox" checked={value} onChange={() => {}} style={{ display: 'none' }} {...(props as any)} />
		</label>
	);
};

export default Switch;
