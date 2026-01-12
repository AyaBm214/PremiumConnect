import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Property } from '@/lib/types';
import styles from './Step.module.css';
import { useLanguage } from '@/lib/LanguageContext';

interface Step2Props {
    data?: string[];
    poolOpeningDate?: string;
    hotTubOpeningDate?: string;
    info?: any; // Received from Step 1
    onUpdate: (data: { amenities: string[], poolOpeningDate?: string, hotTubOpeningDate?: string }) => void;
    onNext: () => void;
    onBack: () => void;
}

const AMENITY_CATEGORIES = [
    {
        titleKey: 'amenity.cat.living',
        items: ['Sofa', 'Sofa bed', 'Armchair', 'Coffee table', 'TV', 'Smart TV', 'Cable TV', 'Streaming services', 'Sound system', 'Board games', 'Books', 'Fireplace', 'Air conditioning', 'Heating', 'Fan', 'Curtains / blackout curtains', 'Extra pillows & blankets']
    },
    // Bedroom and Bathroom removed from here to be dynamic
    {
        titleKey: 'amenity.cat.kitchen',
        items: ['Refrigerator', 'Freezer', 'Oven', 'Microwave', 'Stove', 'Dishwasher', 'Coffee machine', 'Kettle', 'Toaster', 'Blender', 'Rice cooker', 'Pots & pans', 'Cooking utensils', 'Plates & bowls', 'Cutlery', 'Wine glasses', 'Cups & mugs', 'Basic cooking essentials', 'Dining table']
    },
    {
        titleKey: 'amenity.cat.internet',
        items: ['WiFi', 'High-speed WiFi', 'Ethernet connection', 'Desk', 'Office chair', 'Printer']
    },
    {
        titleKey: 'amenity.cat.heating',
        items: ['Central heating', 'Portable heater']
    },
    {
        titleKey: 'amenity.cat.laundry',
        items: ['Washing machine', 'Dryer', 'Laundry detergent', 'Drying rack']
    },
    {
        titleKey: 'amenity.cat.baby',
        items: ['High chair', 'Baby bath', 'Baby monitor', 'Changing table', 'Baby safety gates', 'Outlet covers', 'Children\'s books', 'Toys']
    },
    {
        titleKey: 'amenity.cat.safety',
        items: ['Smoke detector', 'Carbon monoxide detector', 'Fire extinguisher', 'First aid kit', 'Security cameras (outside only)', 'Alarm system', 'Smart lock', 'Keypad lock', 'Lockbox', 'Safe']
    },
    {
        titleKey: 'amenity.cat.outdoor',
        items: ['Balcony', 'Terrace', 'Patio', 'Garden', 'Outdoor furniture', 'BBQ grill', 'Outdoor dining area', 'Fire pit', 'Hammock']
    },
    {
        titleKey: 'amenity.cat.wellness',
        items: ['Swimming pool (private)', 'Swimming pool (shared)', 'Hot tub / Jacuzzi', 'Sauna', 'Gym / fitness equipment', 'Yoga mat', 'Massage chair']
    },
    {
        titleKey: 'amenity.cat.parking',
        items: ['Free parking on premises', 'Free street parking', 'Paid parking nearby', 'EV charger', 'Elevator', 'Wheelchair accessible']
    },
    {
        titleKey: 'amenity.cat.pets',
        items: ['Pets allowed', 'Pet bowls', 'Pet bed', 'Fenced yard']
    },
    {
        titleKey: 'amenity.cat.features',
        items: ['Smoking allowed', 'Long-term stays allowed', 'Self check-in', 'Keyless entry']
    },
    {
        titleKey: 'amenity.cat.location',
        items: ['Beach access', 'Lake access', 'Ski-in / Ski-out', 'Hiking trails nearby', 'Bike paths', 'Restaurants nearby', 'Public transport nearby', 'Grocery store nearby', 'Tourist attractions nearby']
    },
    {
        titleKey: 'amenity.cat.services',
        items: ['Cleaning service available', 'Breakfast available', 'Concierge service', 'Airport pickup']
    }
];

const BEDROOM_ITEMS = ['Queen bed', 'King bed', 'Double bed', 'Single bed', 'Bunk bed', 'Crib (baby)', 'Bedside table', 'Reading lamp', 'Wardrobe / closet', 'Hangers', 'Iron', 'Ironing board', 'Extra pillows', 'Extra blankets', 'Desk / workspace'];
const BATHROOM_ITEMS = ['Shower', 'Bathtub', 'Hot water', 'Shampoo', 'Conditioner', 'Body soap', 'Towels', 'Toilet paper', 'Hair dryer', 'Bidet', 'Mirror', 'Cleaning products'];

export default function Step2Amenities({ data = [], poolOpeningDate, hotTubOpeningDate, info, onUpdate, onNext, onBack }: Step2Props) {
    const { t } = useLanguage();
    const [selected, setSelected] = useState<string[]>(data || []);
    const [customAmenity, setCustomAmenity] = useState('');
    const [poolDate, setPoolDate] = useState(poolOpeningDate || '');
    const [hotTubDate, setHotTubDate] = useState(hotTubOpeningDate || '');

    const handleUpdate = (newSelected: string[], newPoolDate?: string, newHotTubDate?: string) => {
        onUpdate({
            amenities: newSelected,
            poolOpeningDate: newPoolDate !== undefined ? newPoolDate : poolDate,
            hotTubOpeningDate: newHotTubDate !== undefined ? newHotTubDate : hotTubDate
        });
    };

    const toggleAmenity = (item: string) => {
        let newSelected;
        if (selected.includes(item)) {
            newSelected = selected.filter(i => i !== item);
        } else {
            newSelected = [...selected, item];
        }
        setSelected(newSelected);
        handleUpdate(newSelected);
    };

    const addCustomAmenity = () => {
        if (customAmenity && !selected.includes(customAmenity)) {
            const added = [...selected, customAmenity];
            setSelected(added);
            handleUpdate(added);
            setCustomAmenity('');
        }
    };

    // Helper to translate amenity
    const translateAmenity = (item: string) => {
        const key = `amenity.${item}`;
        const translated = t(key);
        // If translation is missing (or equals key), return item
        return translated !== key ? translated : item;
    };

    // Build categories dynamic list
    const numBedrooms = info?.numRooms || 1;
    const numBathrooms = info?.numBathrooms || 1;

    const dynamicCategories = [
        ...AMENITY_CATEGORIES.slice(0, 1).map(c => ({ ...c, title: t(c.titleKey) })), // Living Room
        // Dynamic Bedrooms
        ...Array.from({ length: numBedrooms }).map((_, i) => ({
            title: t('photos.zone.bedroom') + ` ${i + 1}`,
            items: BEDROOM_ITEMS,
            prefix: `Bedroom ${i + 1}: `
        })),
        // Dynamic Bathrooms
        ...Array.from({ length: numBathrooms }).map((_, i) => ({
            title: t('photos.zone.bathroom') + ` ${i + 1}`,
            items: BATHROOM_ITEMS,
            prefix: `Bathroom ${i + 1}: `
        })),
        ...AMENITY_CATEGORIES.slice(1).map(c => ({ ...c, title: t(c.titleKey) })) // Rest
    ];

    // Flatten all standard to check against for custom
    // Note: dynamic items are prefixed in storage but raw in list. 
    // We need to handle the toggle logic carefuly.

    const getStorageKey = (item: string, prefix?: string) => prefix ? `${prefix}${item}` : item;
    const isSelected = (item: string, prefix?: string) => selected.includes(getStorageKey(item, prefix));

    const toggleDynamic = (item: string, prefix?: string) => {
        const key = getStorageKey(item, prefix);
        toggleAmenity(key);
    };

    // For custom filter, we treat unknown strings as custom
    // This logic might need relaxing if we use prefixes.
    const allKnownKeys = new Set([
        ...AMENITY_CATEGORIES.flatMap(c => c.items),
        ...Array.from({ length: numBedrooms }).flatMap((_, i) => BEDROOM_ITEMS.map(item => `${t('photos.zone.bedroom') || 'Bedroom'} ${i + 1}: ${item}`)),
        ...Array.from({ length: numBathrooms }).flatMap((_, i) => BATHROOM_ITEMS.map(item => `${t('photos.zone.bathroom') || 'Bathroom'} ${i + 1}: ${item}`)),
    ]);

    // It's tricky with translations to filter "custom" perfectly if language changes, but for now relies on current lang keys.
    // Actually, keep it simple: just show selected strings that are not found in current view? 
    // Let's rely on the simple check: if it's in the `selected` list but not in any `dynamicCategories` items (constructed keys), it's custom.
    // IMPROVEMENT: Filter out known prefixed items more robustly if needed, but for now assuming "Custom" are just the ones added manually.
    // We can filter by checking if it starts with "Bedroom X:" or "Bathroom X:" or exists in standard lists.

    const standardItems = new Set(AMENITY_CATEGORIES.flatMap(c => c.items));
    const customSelected = selected.filter(s => {
        if (standardItems.has(s)) return false;
        if (s.startsWith('Bedroom') || s.startsWith('Bathroom') || s.startsWith('Chambre') || s.startsWith('Salle de bain')) return false;
        return true;
    });

    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>{t('step.amenity')}</h3>

            {dynamicCategories.map((category, idx) => (
                <div key={`${category.title}-${idx}`} className={styles.categoryBlock}>
                    <h4 className={styles.categoryTitle}>{category.title}</h4>
                    <div className={styles.amenityGrid}>
                        {category.items.map(item => {
                            // @ts-ignore
                            const key = getStorageKey(item, category.prefix);
                            return (
                                <label
                                    key={key}
                                    className={`${styles.amenityCard} ${selected.includes(key) ? styles.selected : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(key)}
                                        // @ts-ignore
                                        onChange={() => toggleDynamic(item, category.prefix)}
                                        className={styles.hiddenCheckbox}
                                    />
                                    <span className={styles.amenityLabel}>{translateAmenity(item)}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Custom / Other Amenities */}
            <div className={styles.categoryBlock}>
                <h4 className={styles.categoryTitle}>{t('amenity.cat.other')}</h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Input
                        placeholder="e.g. Pool table, EV Charger..."
                        value={customAmenity}
                        onChange={(e) => setCustomAmenity(e.target.value)}
                    />
                    <Button onClick={addCustomAmenity} variant="outline" disabled={!customAmenity}>Add</Button>
                </div>

                {customSelected.length > 0 && (
                    <div className={styles.amenityGrid}>
                        {customSelected.map(item => (
                            <label
                                key={item}
                                className={`${styles.amenityCard} ${styles.selected}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={() => toggleAmenity(item)}
                                    className={styles.hiddenCheckbox}
                                />
                                <span className={styles.amenityLabel}>{item}</span>
                            </label>
                        ))}
                    </div>
                )}

                {/* Pool Date Conditional */}
                {(selected.some(s => s.toLowerCase().includes('pool') || s.toLowerCase().includes('piscine'))) && (
                    <div className={styles.categoryBlock}>
                        <h4 className={styles.categoryTitle}>{t('amenity.pool_date')}</h4>
                        <Input
                            label={t('amenity.pool_date')}
                            type="date"
                            value={poolDate}
                            onChange={e => {
                                setPoolDate(e.target.value);
                                handleUpdate(selected, e.target.value, hotTubDate);
                            }}
                        />
                    </div>
                )}

                {/* Hot Tub Date Conditional */}
                {(selected.some(s => s.toLowerCase().includes('hot tub') || s.toLowerCase().includes('jacuzzi') || s.toLowerCase().includes('spa'))) && (
                    <div className={styles.categoryBlock}>
                        <h4 className={styles.categoryTitle}>{t('amenity.hottub_date')}</h4>
                        <Input
                            label={t('amenity.hottub_date')}
                            type="date"
                            value={hotTubDate}
                            onChange={e => {
                                setHotTubDate(e.target.value);
                                handleUpdate(selected, poolDate, e.target.value);
                            }}
                        />
                    </div>
                )}
            </div>

            <div className={styles.actions} style={{ justifyContent: 'space-between' }}>
                <Button variant="outline" onClick={onBack}>{t('step.back')}</Button>
                <Button size="lg" onClick={onNext} className={styles.nextBtn}>
                    {t('step.next')} →
                </Button>
            </div>
        </div>
    );
}
