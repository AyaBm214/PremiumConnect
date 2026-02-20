import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/client/dashboard';

    console.log('[AUTH CONFIRM] Processing code exchange. Origin:', origin);

    if (code) {
        const supabase = createClient();
        const { error, data } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            console.log('[AUTH CONFIRM] Code exchange successful for user:', data.user?.email);

            const forwardedHost = request.headers.get('x-forwarded-host');
            const isLocalEnv = process.env.NODE_ENV === 'development';

            // Construct target URL
            let targetUrl = `${origin}${next}`;
            if (!isLocalEnv && forwardedHost) {
                targetUrl = `https://${forwardedHost}${next}`;
            }

            console.log('[AUTH CONFIRM] Redirecting to:', targetUrl);
            return NextResponse.redirect(targetUrl);
        } else {
            console.error('[AUTH CONFIRM] Code exchange error:', error.message);
        }
    }

    console.warn('[AUTH CONFIRM] Falling back to login due to missing code or error');
    return NextResponse.redirect(`${origin}/client/login?error=auth_code_error`);
}
