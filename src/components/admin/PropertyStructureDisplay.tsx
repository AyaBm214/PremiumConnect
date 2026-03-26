'use client';
import React from 'react';
import styles from './PropertyStructureDisplay.module.css';
import { useLanguage } from '@/lib/LanguageContext';

interface PropertyStructureDisplayProps {
    numFloors?: number;
    numRooms?: number;
    roomsPerFloor?: number[];
    bedsPerBedroom?: number[];
}

export default function PropertyStructureDisplay({ 
    numFloors = 0, 
    numRooms = 0, 
    roomsPerFloor = [], 
    bedsPerBedroom = [] 
}: PropertyStructureDisplayProps) {
    const { t } = useLanguage();

    const totalBeds = bedsPerBedroom.reduce((a, b) => a + b, 0);

    return (
        <div className={styles.container}>
            <div className={styles.summary}>
                <div className={styles.pill}>
                    {t('onboarding.step1.floors')} : {numFloors}
                </div>
                <div className={styles.pill}>
                    {t('onboarding.step1.bedrooms')} : {numRooms}
                </div>
                <div className={styles.pill}>
                    {t('admin.details.info.total_beds')} : {totalBeds}
                </div>
            </div>

            <div className={styles.grid}>
                {roomsPerFloor.map((roomsCount, floorIdx) => {
                    const prevRooms = roomsPerFloor.slice(0, floorIdx).reduce((a, b) => a + b, 0);
                    
                    return (
                        <div key={floorIdx} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.floorHeaderTitle}>
                                    <span>🏢</span> {t('onboarding.step1.floor')} {floorIdx + 1}
                                </div>
                                <span className={styles.roomCount}>{roomsCount} {roomsCount > 1 ? t('onboarding.step1.bedrooms').toLowerCase() : 'chambre'}</span>
                            </div>
                            <div className={styles.roomList}>
                                {Array.from({ length: roomsCount }).map((_, roomIdx) => {
                                    const globalRoomIdx = prevRooms + roomIdx;
                                    const bedsCount = bedsPerBedroom[globalRoomIdx] || 0;
                                    const visibleSquares = Math.min(bedsCount, 4);
                                    const extraCount = bedsCount > 4 ? bedsCount - 4 : 0;

                                    return (
                                        <div key={roomIdx} className={styles.roomItem}>
                                            <div className={styles.roomLabel}>
                                                <span>🛏️</span> {t('onboarding.step1.bedroom')} {roomIdx + 1}
                                            </div>
                                            <div className={styles.bedInfo}>
                                                <span>{bedsCount} {bedsCount > 1 ? t('onboarding.step1.beds').toLowerCase() : t('onboarding.step1.bed').toLowerCase()}</span>
                                                <div className={styles.bedSquares}>
                                                    {Array.from({ length: visibleSquares }).map((_, i) => (
                                                        <div key={i} className={styles.square} />
                                                    ))}
                                                    {extraCount > 0 && (
                                                        <span className={styles.moreBeds}>+{extraCount}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
