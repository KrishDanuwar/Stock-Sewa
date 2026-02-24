import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface OrgContext {
    userId: string;
    organizationId: string;
    organizationName: string;
}

/**
 * The gatekeeper for multi-tenancy.
 * Call this at the top of every server action and protected server component.
 * Throws a redirect to /login if the user is not authenticated.
 */
export async function getOrgContext(): Promise<OrgContext> {
    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id, organizations(name)')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        console.error('Profile missing for user:', user.id);
        redirect('/setup');
    }

    const orgName =
        (profile.organizations as unknown as { name: string } | null)?.name ?? 'My Organization';

    return {
        userId: user.id,
        organizationId: profile.organization_id,
        organizationName: orgName,
    };
}
