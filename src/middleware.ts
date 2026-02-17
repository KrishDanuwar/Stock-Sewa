import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: any[]) {
                    cookiesToSet.forEach(({ name, value }: any) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }: any) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Public paths
    const isPublicPath = request.nextUrl.pathname.startsWith('/auth');

    if (!user && !isPublicPath) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // If logged in, check subscription
    if (user && !isPublicPath) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, organizations(subscription_status)')
            .eq('id', user.id)
            .single();

        const status = (profile as any)?.organizations?.subscription_status;

        // Redirect to billing if subscription is not active or trialing
        if (status !== 'active' && status !== 'trialing' && !request.nextUrl.pathname.startsWith('/billing')) {
            return NextResponse.redirect(new URL('/billing', request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
