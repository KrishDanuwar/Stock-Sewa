import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;
    const next = requestUrl.searchParams.get('next') ?? '/';

    if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }

        console.error('Auth error:', error.message);
        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`);
    }

    return NextResponse.redirect(`${origin}/auth/login?error=No code provided`);
}
