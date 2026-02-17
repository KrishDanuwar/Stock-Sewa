import { createClient } from '@/utils/supabase/server';

export function getOrgContext() {
    // AUTHENTICATION REMOVED: Using a stable, anonymous context
    const DEFAULT_ID = '00000000-0000-0000-0000-000000000000';

    return {
        userId: DEFAULT_ID,
        userEmail: 'guest@merostock.local',
        organizationId: DEFAULT_ID,
        organizationName: 'MeroStock Shop',
        subscriptionStatus: 'active',
    };
}
