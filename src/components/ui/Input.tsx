import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    description?: string;
}

export function Input({ label, error, description, className = '', ...props }: InputProps) {
    return (
        <div className={styles.wrapper}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                className={`${styles.input} ${error ? styles.hasError : ''} ${className}`}
                {...props}
            />
            {description && <p className={styles.description}>{description}</p>}
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
