'use client';
import React, { useRef, useState } from 'react';
import styles from './FileUploader.module.css';

interface FileUploaderProps {
    label?: string;
    accept?: string;
    multiple?: boolean;
    onChange?: (files: File[]) => void;
    description?: React.ReactNode;
    disabled?: boolean;
}

export function FileUploader({
    label,
    accept,
    multiple = false,
    onChange,
    description,
    disabled = false
}: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileNames, setFileNames] = useState<string[]>([]);

    const handleFiles = (files: FileList | null) => {
        if (disabled || !files || files.length === 0) return;
        const fileArray = Array.from(files);
        setFileNames(prev => multiple ? [...prev, ...fileArray.map(f => f.name)] : [fileArray[0].name]);
        if (onChange) onChange(fileArray);
    };

    const onDrag = (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className={`${styles.wrapper} ${disabled ? styles.disabled : ''}`}>
            {label && <label className={styles.label}>{label}</label>}
            <div
                className={`${styles.dropzone} ${dragActive ? styles.active : ''} ${disabled ? styles.disabledDropzone : ''}`}
                onDragEnter={onDrag}
                onDragLeave={onDrag}
                onDragOver={onDrag}
                onDrop={onDrop}
                onClick={() => !disabled && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className={styles.hiddenInput}
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <div className={styles.content}>
                    <span className={styles.icon}>☁️</span>
                    <p className={styles.text}>
                        <span className={styles.link}>Click to upload</span> or drag and drop
                    </p>
                    {description && <p className={styles.subtext}>{description}</p>}
                </div>
            </div>
            {fileNames.length > 0 && (
                <ul className={styles.fileList}>
                    {fileNames.map((name, i) => (
                        <li key={i} className={styles.fileItem}>📄 {name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
