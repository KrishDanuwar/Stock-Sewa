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

    try {
        // 1. Attempt full query with subscription fields
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

        if (!profileError && profile) {
            const orgData = Array.isArray(profile.organizations)
                ? profile.organizations[0]
                : (profile.organizations as any);

            const orgName = orgData?.name ?? 'My Organization';
            const subStatus = orgData?.subscription_status || 'active';
            const trialEndsAt = orgData?.trial_ends_at;
            const subEndsAt = orgData?.subscription_ends_at;

            const now = new Date();
            const isTrialExpired = trialEndsAt ? new Date(trialEndsAt) < now : false;

            return {
                userId,
                organizationId: profile.organization_id,
                organizationName: orgName,
                logoUrl: orgData?.logo_url || null,
                email: user.emailAddresses[0]?.emailAddress || '',
                subscriptionPlan: orgData?.subscription_plan || 'trial',
                subscriptionStatus: subStatus,
                trialEndsAt,
                subscriptionEndsAt: subEndsAt,
                isTrialExpired,
            };
        }

        // 2. Fallback: If subscription columns are missing, try basic fetch
        console.warn('getOrgContext: Primary query failed, attempting fallback...', profileError);
        const { data: basicProfile, error: fallbackError } = await supabase
            .from('profiles')
            .select(`
                organization_id,
                organizations(name)
            `)
            .eq('id', userId)
            .single();

        if (fallbackError || !basicProfile) {
            console.error('getOrgContext Error (Primary & Fallback failed):', { userId, profileError, fallbackError });
            redirect('/setup');
        }

        const fallbackOrg = Array.isArray(basicProfile.organizations) ? basicProfile.organizations[0] : basicProfile.organizations as any;

        return {
            userId,
            organizationId: basicProfile.organization_id,
            organizationName: fallbackOrg?.name || 'My Shop',
            logoUrl: null,
            email: user.emailAddresses[0]?.emailAddress || '',
            subscriptionPlan: 'trial',
            subscriptionStatus: 'active',
            trialEndsAt: null,
            subscriptionEndsAt: null,
            isTrialExpired: false,
        };
    } catch (error) {
        if (error instanceof Error && (error as any).digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error('getOrgContext Exception:', error);
        redirect('/setup');
    }
}
