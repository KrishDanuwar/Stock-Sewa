import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';

export interface OrgContext {
    userId: string;
    organizationId: string;
    organizationName: string;
    email: string;
}

/**
 * The gatekeeper for multi-tenancy.
 * Uses Clerk for auth and Supabase for organization mapping.
 */
export async function getOrgContext(): Promise<OrgContext> {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        redirect('/login');
    }

    const supabase = await createAdminClient();

    // With Clerk, 'id' in profiles table corresponds to Clerk's userId
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id, organizations(name)')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        console.error('Profile/Org missing for Clerk user:', userId);
        // If profile doesn't exist, they need to go through the setup/onboarding
        redirect('/setup');
    }

    const orgData = Array.isArray(profile.organizations)
        ? profile.organizations[0]
        : (profile.organizations as { name: string } | null);

    const orgName = orgData?.name ?? 'My Organization';

    return {
        userId: userId,
        organizationId: profile.organization_id,
        organizationName: orgName,
        email: user.emailAddresses[0]?.emailAddress || '',
    };
}
