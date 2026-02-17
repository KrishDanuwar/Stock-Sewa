import { createClient } from '@/utils/supabase/server';

// AUTH REMOVED: Returns org context by querying the first organization directly.
// When re-adding auth, restore the original getUser() + profile query logic.
export async function getOrgContext() {
    try {
        const supabase = createClient();

        // Fetch the first available organization from the database
        const { data: org, error } = await supabase
            .from('organizations')
            .select('id, name, subscription_status')
            .limit(1)
            .single();

        if (error || !org) {
            console.warn('getOrgContext: No organization found in database.', error?.message);
            return {
                userId: 'no-auth',
                userEmail: 'user@stocksewa.local',
                organizationId: null,
                organizationName: 'StockSewa Shop',
                subscriptionStatus: 'active',
            };
        }

        return {
            userId: 'no-auth',
            userEmail: 'user@stocksewa.local',
            organizationId: org.id,
            organizationName: org.name || 'StockSewa Shop',
            subscriptionStatus: org.subscription_status || 'active',
        };
    } catch (err) {
        console.error('getOrgContext: Critical error', err);
        return {
            userId: 'no-auth',
            userEmail: 'user@stocksewa.local',
            organizationId: null,
            organizationName: 'StockSewa Shop',
            subscriptionStatus: 'active',
        };
    }
}
