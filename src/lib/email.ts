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

export async function sendHostawayRequestNotification(data: { client_name: string, client_email: string, property_name: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] To: admin@premiumconnect.com, Subject: New Hostaway Access Request, Body: ${data.client_name} (${data.client_email}) requested access for ${data.property_name}.`);
        return { success: true, id: 'mock-id' };
    }

    try {
        const result = await resend.emails.send({
            from: 'Premium Booking Support <support@resend.dev>',
            to: ['admin@premiumconnect.com'],
            subject: `🚨 New Hostaway Access Request: ${data.client_name}`,
            html: `
                <h1>New Hostaway Access Request</h1>
                <p>A client has requested Hostaway access from their dashboard.</p>
                <div style="background: #f1f3f5; padding: 1.5rem; border-radius: 8px;">
                    <p><strong>Client Name:</strong> ${data.client_name}</p>
                    <p><strong>Client Email:</strong> ${data.client_email}</p>
                    <p><strong>Property/Account:</strong> ${data.property_name}</p>
                </div>
                <p>Please log in to the Admin Dashboard to manage this request.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/hostaway-requests" style="display: inline-block; background: #D63030; color: white; padding: 0.75rem 1.5rem; border-radius: 4px; text-decoration: none; font-weight: bold;">View Requests</a>
            `
        });
        return { success: true, result };
    } catch (error) {
        console.error('Email send error (Hostaway):', error);
        return { success: false, error };
    }
}

export async function sendHostawayCompletionEmail(to: string, clientName: string, password: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[MOCK EMAIL] To: ${to}, Subject: Hostaway Access Ready, Body: Hello ${clientName}, your Hostaway password is: ${password}`);
        return { success: true, id: 'mock-id' };
    }

    try {
        const result = await resend.emails.send({
            from: 'Premium Booking Support <support@resend.dev>',
            to: [to],
            subject: '✅ Your Hostaway Access is Ready',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0D1B2E;">
                    <h1 style="color: #D63030;">Hello ${clientName},</h1>
                    <p>Good news! Our team has finished setting up your Hostaway access.</p>
                    <p>You can now log in to your dashboard to manage your properties.</p>
                    
                    <div style="background: #f8fafc; padding: 2rem; border-radius: 1rem; border: 1px solid #e2e8f0; margin: 2rem 0;">
                        <h2 style="font-size: 1.1rem; margin-top: 0;">Your Credentials</h2>
                        <p style="margin-bottom: 0.5rem;"><strong>Email:</strong> ${to}</p>
                        <p style="margin-top: 0;"><strong>Password:</strong> <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">${password}</code></p>
                    </div>

                    <p>We recommend changing your password after your first login for security reasons.</p>
                    
                    <div style="margin-top: 2rem;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/dashboard" 
                           style="display: inline-block; background: #0D1B2E; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: bold;">
                           Go to My Dashboard
                        </a>
                    </div>
                    
                    <p style="margin-top: 2rem; font-size: 0.9rem; color: #64748b;">
                        If you have any questions, feel free to contact our support team.
                    </p>
                </div>
            `
        });
        return { success: true, result };
    } catch (error) {
        console.error('Email send error (Completion):', error);
        return { success: false, error };
    }
}
