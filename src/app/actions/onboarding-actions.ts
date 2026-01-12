'use server';

import { sendOnboardingEmail } from '@/lib/email';

export async function notifyAdminOnCompletion(propertyId: string, propertyName: string) {
    // Determine admin email - for now we use a hardcoded testing email or environment variable
    // In a real app, this would be the admin's email.
    const adminEmail = 'admin@example.com';

    console.log(`[ACTION] Notifying admin about property ${propertyId} completion`);

    const result = await sendOnboardingEmail(adminEmail, propertyName || 'New Property', propertyId);
    return result;
}
