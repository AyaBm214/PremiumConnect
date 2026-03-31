import { NextResponse } from 'next/server';
import { sendHostawayRequestNotification } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { client_name, client_email, property_name } = body;

        if (!client_name || !client_email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await sendHostawayRequestNotification({
            client_name,
            client_email,
            property_name: property_name || 'Main Account'
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('API Hostaway error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
