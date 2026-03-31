import { NextResponse } from 'next/server';
import { sendHostawayCompletionEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { client_name, client_email, password } = body;

        if (!client_name || !client_email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await sendHostawayCompletionEmail(client_email, client_name, password);

        return NextResponse.json(result);
    } catch (error) {
        console.error('API Hostaway completion error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
