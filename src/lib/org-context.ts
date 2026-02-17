import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function getOrgContext() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('organization_id, organizations(name, subscription_status)')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        // If no profile, maybe handle logout/error
        return null;
    }

    return {
        userId: user.id,
        userEmail: user.email,
        organizationId: profile.organization_id,
        organizationName: (profile as any).organizations.name,
        subscriptionStatus: (profile as any).organizations.subscription_status,
    };
}
