export const calculateStepProgress = (stepId: number, data: any): number => {
    if (!data) return 0;

    switch (stepId) {
        case 1: { // Property Info
            const info = data.info || {};
            const fields = ['propertyName', 'description', 'address', 'instructionDate', 'type', 'numRooms', 'numBathrooms', 'size', 'checkInTime', 'checkOutTime'];
            const filled = fields.filter(f => {
                const val = (info as any)[f];
                return val !== undefined && val !== null && val !== '';
            }).length;
            return Math.min(100, Math.round((filled / fields.length) * 100));
        }
        case 2: { // Amenities
            const count = data.amenities?.length || 0;
            // Consider 15+ amenities as 100%
            return Math.min(100, Math.round((count / 15) * 100));
        }
        case 3: { // Photos
            const photoCount = data.photos?.length || 0;
            const extLinksCount = data.externalLinks?.length || 0;
            const hasDrive = !!data.googleDriveLink;
            // Mix of photos and links: 12 units = 100%
            const totalUnits = photoCount + extLinksCount + (hasDrive ? 2 : 0);
            return Math.min(100, Math.round((totalUnits / 12) * 100));
        }
        case 4: { // Rules & Fees
            const rules = data.rules || {};
            const fields = ['smoking', 'pets', 'events', 'quietHours', 'cleaningFee', 'maxGuests'];
            const filled = fields.filter(f => {
                const val = (rules as any)[f];
                return val !== undefined && val !== null && val !== '';
            }).length;
            return Math.min(100, Math.round((filled / fields.length) * 100));
        }
        case 5: { // Guest Guide
            const guide = data.guide || {};
            const fields = ['wifiDetails', 'wifiRouterPhoto', 'wifiSpeedTestScreenshot', 'tourVideo', 'lockPhoto', 'luggageList', 'emergencyContacts'];
            const filled = fields.filter(f => {
                const val = (guide as any)[f];
                return val !== undefined && val !== null && val !== '' && (Array.isArray(val) ? val.length > 0 : true);
            }).length;
            return Math.min(100, Math.round((filled / fields.length) * 100));
        }
        case 6: { // Owner Requests
            const reqs = data.ownerRequests || {};
            const sections = ['spa', 'bedding', 'consumables', 'bbq', 'emergencyKit', 'expenseAuth'];
            const filledSections = sections.filter(s => {
                const sec = (reqs as any)[s];
                if (!sec) return false;
                return Object.values(sec).some(v => v !== undefined && v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true));
            }).length;
            return Math.min(100, Math.round((filledSections / 6) * 100));
        }
        case 7: { // Payment
            const payment = data.payment || {};
            const fields = ['bankName', 'accountHolder', 'accountNumber', 'transitInstitution', 'branchNumber'];
            const filled = fields.filter(f => {
                const val = (payment as any)[f];
                return val !== undefined && val !== null && val !== '';
            }).length;
            return Math.min(100, Math.round((filled / fields.length) * 100));
        }
        case 8: { // Contract
            return data.contract?.status === 'approved' ? 100 : 0;
        }
        default: return 0;
    }
};

export const calculateTotalProgress = (data: any): number => {
    const stepProgresses = [1, 2, 3, 4, 5, 6, 7, 8].map(id => calculateStepProgress(id, data));
    return Math.round(stepProgresses.reduce((a, b) => a + b, 0) / 8);
};
