import { createClient } from '@/utils/supabase/server';

export async function getOrgContext() {
    // AUTHENTICATION REMOVED: Using a stable, anonymous context
    // This function is now purely synchronous to prevent RSC crashes
    const DEFAULT_ID = '00000000-0000-0000-0000-000000000000';

    return {
        userId: DEFAULT_ID,
        userEmail: 'guest@merostock.local',
        organizationId: DEFAULT_ID,
        organizationName: 'MeroStock Shop',
        subscriptionStatus: 'active',
    };
}
