import { NextResponse } from 'next/server';
import { sendOnboardingEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { propertyId, propertyName, ownerEmail } = body;

        // In a real app, you might want to send to the admin, not just the owner, or both.
        // For now, let's send to a hardcoded admin email or just log it.
        // The user said "when a client finish onboarding email sent like i told you".
        // Use a placeholder admin email.
        const adminEmail = 'yanis@premiumbooking.ca';

        const result = await sendOnboardingEmail(adminEmail, propertyName, propertyId);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
