import { createServerClient } from '@supabase/ssr';

export async function createClient() {
    // Dynamic import to avoid issues with some build environments 
    // or potentialTy weird Next.js versions
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Called from a Server Component - can be ignored
                    }
                },
            },
        }
    );
}

/**
 * Creates a Supabase client that uses the SERVICE ROLE KEY.
 * WARNING: This bypasses all RLS. Use ONLY in server-side actions for admin tasks.
 */
export async function createAdminClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return []; },
                setAll() { },
            },
        }
    );
}
