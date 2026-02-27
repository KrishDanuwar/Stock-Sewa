import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';

export interface OrgContext {
    userId: string;
    organizationId: string;
    organizationName: string;
    logoUrl: string | null;
    email: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    trialEndsAt: string | null;
    subscriptionEndsAt: string | null;
    isTrialExpired: boolean;
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
        .select(`
            organization_id, 
            organizations(
                name, 
                logo_url, 
                subscription_plan, 
                subscription_status, 
                trial_ends_at, 
                subscription_ends_at
            )
        `)
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        console.error('Profile/Org missing for Clerk user:', userId);
        redirect('/setup');
    }

    const orgData = Array.isArray(profile.organizations)
        ? profile.organizations[0]
        : (profile.organizations as any);

    const orgName = orgData?.name ?? 'My Organization';

    // Subscription Check
    const subStatus = orgData?.subscription_status || 'expired';
    const trialEndsAt = orgData?.trial_ends_at;
    const subEndsAt = orgData?.subscription_ends_at;

    const now = new Date();
    const isTrialExpired = trialEndsAt ? new Date(trialEndsAt) < now : true;
    const isSubExpired = subEndsAt ? new Date(subEndsAt) < now : true;

    // Decision Logic
    // Allow access if active subscription, or if trial is still active
    const hasAccess = subStatus === 'active' && (!isTrialExpired || (subEndsAt && !isSubExpired));

    return {
        userId: userId,
        organizationId: profile.organization_id,
        organizationName: orgName,
        logoUrl: orgData?.logo_url || null,
        email: user.emailAddresses[0]?.emailAddress || '',
        subscriptionPlan: orgData?.subscription_plan || 'trial',
        subscriptionStatus: subStatus,
        trialEndsAt: trialEndsAt,
        subscriptionEndsAt: subEndsAt,
        isTrialExpired,
    };
}
