import { createAdminClient } from '@/lib/supabase/server';
import { currentUser } from '@clerk/nextjs/server';

export async function trackSecurityEvent(
    event: string,
    metadata: any = {}
) {
    const user = await currentUser();
    const supabase = await createAdminClient();

    const logEntry = {
        event_type: event,
        user_id: user?.id || 'anonymous',
        user_email: user?.emailAddresses[0]?.emailAddress || 'anonymous',
        metadata: metadata,
        timestamp: new Date().toISOString(),
    };

    // For now, we log to console and a dedicated table if it exists
    console.log(`[SECURITY AUDIT] ${event}:`, JSON.stringify(logEntry, null, 2));

    try {
        await supabase.from('security_audit_logs').insert(logEntry);
    } catch (err) {
        // Table might not exist yet, ignore silently as it's a non-blocking operation
        console.warn('Could not write to security_audit_logs table. Ensure it exists in the database.');
    }
}
