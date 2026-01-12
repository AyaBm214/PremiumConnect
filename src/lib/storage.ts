import { Property, TOTAL_ONBOARDING_STEPS } from './types';

const STORAGE_KEY = 'premiumConnectProperties';

export const storage = {
    /** @deprecated Use Supabase client instead */
    getProperties: (ownerId: string): Property[] => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        try {
            const allProps: Property[] = JSON.parse(stored);
            return allProps.filter(p => p.ownerId === ownerId).sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        } catch (e) {
            console.error('Failed to parse properties', e);
            return [];
        }
    },

    getAllProperties: (): Property[] => { // For admin
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    getProperty: (id: string): Property | undefined => {
        if (typeof window === 'undefined') return undefined;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return undefined;
        const allProps: Property[] = JSON.parse(stored);
        return allProps.find(p => p.id === id);
    },

    saveProperty: (property: Property) => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allProps: Property[] = stored ? JSON.parse(stored) : [];

        const index = allProps.findIndex(p => p.id === property.id);
        if (index >= 0) {
            allProps[index] = property;
        } else {
            allProps.push(property);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(allProps));
    },

    createProperty: (ownerId: string): Property => {
        const newProp: Property = {
            id: Math.random().toString(36).substr(2, 9),
            ownerId,
            name: 'New Property',
            status: 'draft',
            currentStep: 1,
            totalSteps: TOTAL_ONBOARDING_STEPS,
            progress: 0,
            updatedAt: new Date().toISOString(),
            data: {}
        };
        storage.saveProperty(newProp);
        return newProp;
    }
};
