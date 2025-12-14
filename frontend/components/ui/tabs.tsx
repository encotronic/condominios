import React, { createContext, useContext, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './ui.module.css';

type TabsContextType = {
	value: string | null;
	setValue: (v: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

export interface TabsProps {
	value?: string;
	defaultValue?: string;
	onValueChange?: (v: string) => void;
	children?: React.ReactNode;
	className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, defaultValue, onValueChange, children, className = '' }) => {
	const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
	const isControlled = typeof value !== 'undefined';
	const current = isControlled ? (value as string) : internal;

	const setValue = (v: string) => {
		if (!isControlled) setInternal(v);
		onValueChange?.(v);
	};

	const ctx = useMemo(() => ({ value: current ?? null, setValue }), [current]);

	return (
		<TabsContext.Provider value={ctx}>
			<div className={`${styles.tabsRoot} ${className}`.trim()}>{children}</div>
		</TabsContext.Provider>
	);
};

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
	<div className={`${styles.tabsList} ${className}`.trim()} {...props}>{children}</div>
);

export const TabsTrigger: React.FC<{ value: string } & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ value, children, className = '', ...props }) => {
	const ctx = useContext(TabsContext);
	const active = ctx?.value === value;
	return (
		<button
			type="button"
			className={`${styles.tabTrigger} ${active ? styles.tabTriggerActive : ''} ${className}`.trim()}
			onClick={() => ctx?.setValue(value)}
			{...props}
		>
			{children}
			{active && <motion.span layoutId="tab-underline" className={styles.tabUnderline} />}
		</button>
	);
};

export const TabsContent: React.FC<{ value: string } & React.HTMLAttributes<HTMLDivElement>> = ({ value, children, className = '', ...props }) => {
	const ctx = useContext(TabsContext);
	if (ctx?.value !== value) return null;
	return (
		<div className={`${styles.tabsContent} ${className}`.trim()} {...props}>{children}</div>
	);
};

export default Tabs;
