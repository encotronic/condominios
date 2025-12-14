import React from 'react';
import styles from './ui.module.css';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	children?: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ children, className = '', ...props }) => (
	<label className={`${styles.formLabel} ${className}`.trim()} {...props}>
		{children}
	</label>
);

export default Label;
