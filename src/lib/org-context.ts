import { createClient } from '@/utils/supabase/server';

export async function getOrgContext() {
    // AUTHENTICATION REMOVED: Using a stable, anonymous context
    const DEFAULT_ID = '00000000-0000-0000-0000-000000000000';

    // We attempt to verify the organization exists to prevent foreign key crashes
    try {
        const supabase = createClient();
        const { count } = await supabase
            .from('organizations')
            .select('*', { count: 'exact', head: true })
            .eq('id', DEFAULT_ID);

        if (count === 0) {
            // Self-heal: Create the default organization if missing
            await supabase.from('organizations').insert({
                id: DEFAULT_ID,
                name: 'MeroStock Shop',
                owner_id: DEFAULT_ID,
                subscription_status: 'active'
            });
        }
    } catch (e) {
        console.warn('Auto-repair failed. Ensure Organizations table exists and RLS is disabled.', e);
    }

    return {
        userId: DEFAULT_ID,
        userEmail: 'guest@merostock.local',
        organizationId: DEFAULT_ID,
        organizationName: 'MeroStock Shop',
        subscriptionStatus: 'active',
    };
}
