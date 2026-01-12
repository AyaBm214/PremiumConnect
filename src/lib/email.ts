import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789'); // Mock key if missing

export async function sendOnboardingEmail(to: string, propertyName: string, propertyId: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] To: ${to}, Subject: Onboarding Complete, Body: Property ${propertyName} (${propertyId}) has finished onboarding.`);
        return { success: true, id: 'mock-id' };
    }

    try {
        const data = await resend.emails.send({
            from: 'Premium Booking Connect <onboarding@resend.dev>', // Default testing domain
            to: [to],
            subject: `New Property Onboarded: ${propertyName}`,
            html: `
                <h1>Property Onboarding Complete</h1>
                <p><strong>Property Name:</strong> ${propertyName}</p>
                <p><strong>Property ID:</strong> ${propertyId}</p>
                <p>The client has finished the onboarding process. Please review the details in the Admin Dashboard.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/properties/${propertyId}">View Property</a>
            `
        });
        return { success: true, data };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
}
