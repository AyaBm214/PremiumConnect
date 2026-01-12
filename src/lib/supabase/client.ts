
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('Missing Supabase Env Vars:', { url, key: key ? 'Set' : 'Missing' });
        throw new Error('Supabase URL and Key must be defined!');
    }

    return createBrowserClient(url, key);
}
