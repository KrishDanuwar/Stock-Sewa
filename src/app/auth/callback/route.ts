import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

function getBaseURL(request: Request) {
    const { origin } = new URL(request.url);
    if (origin && !origin.includes('localhost')) return origin;

    // Fallback to headers for more robustness
    const host = headers().get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${host}`;
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const origin = getBaseURL(request);
    const code = url.searchParams.get('code');
    const next = url.searchParams.get('next') ?? '/';

    if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=OAuth callback failed`);
}
