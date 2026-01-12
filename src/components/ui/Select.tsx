import React from 'react';
import styles from './Input.module.css'; // Reusing Input styles

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
    return (
        <div className={styles.wrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <select
                className={`${styles.input} ${error ? styles.hasError : ''} ${className}`}
                {...props}
            >
                <option value="" disabled>Select an option</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
