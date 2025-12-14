import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ui.module.css';

type SelectContextType = {
	value: string | null;
	setValue: (v: string) => void;
	open: boolean;
	setOpen: (b: boolean) => void;
};

const SelectContext = createContext<SelectContextType | null>(null);

export interface SelectProps {
	value?: string | null;
	defaultValue?: string | null;
	onValueChange?: (v: string) => void;
	children?: React.ReactNode;
	className?: string;
}

export const Select: React.FC<SelectProps> = ({ value, defaultValue = null, onValueChange, children, className = '' }) => {
	const [internalValue, setInternalValue] = useState<string | null>(defaultValue);
	const isControlled = typeof value !== 'undefined';
	const currentValue = isControlled ? (value as string | null) : internalValue;
	const [open, setOpen] = useState(false);

	const setValue = (v: string) => {
		if (!isControlled) setInternalValue(v);
		onValueChange?.(v);
	};

	const ctx = useMemo(() => ({ value: currentValue ?? null, setValue, open, setOpen }), [currentValue, open]);

	return (
		<SelectContext.Provider value={ctx}>
			<div className={`${styles.selectRoot} ${className}`.trim()}>{children}</div>
		</SelectContext.Provider>
	);
};

export const SelectTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => {
	const ctx = useContext(SelectContext);
	if (!ctx) return <button {...props}>{children}</button>;
	return (
		<button className={`${styles.selectTrigger} ${className}`.trim()} onClick={() => ctx.setOpen(!ctx.open)} type="button" {...props}>
			{children}
		</button>
	);
};

export const SelectValue: React.FC<{ placeholder?: React.ReactNode } & React.HTMLAttributes<HTMLSpanElement>> = ({ children, placeholder, className = '', ...props }) => {
	const ctx = useContext(SelectContext);
	if (!ctx) return <span {...props}>{children ?? placeholder}</span>;
	const display = children && React.Children.count(children) > 0 ? children : (ctx.value ?? placeholder);
	return <span className={`${styles.selectValue} ${className}`.trim()} {...props}>{display}</span>;
};

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
	const ctx = useContext(SelectContext);
	if (!ctx) return <div {...props}>{children}</div>;
	return (
		<AnimatePresence>
			{ctx.open && (
				<motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }} className={`${styles.selectContent} ${className}`.trim()} {...(props as any)}>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export const SelectItem: React.FC<{ value: string } & React.HTMLAttributes<HTMLDivElement>> = ({ value, children, className = '', ...props }) => {
	const ctx = useContext(SelectContext);
	const handleClick = () => {
		ctx?.setValue(value);
		ctx?.setOpen(false);
	};
	const active = ctx?.value === value;
	return (
		<div role="option" aria-selected={active} onClick={handleClick} className={`${styles.selectItem} ${className}`.trim()} {...props}>
			{children}
		</div>
	);
};

export default Select;
