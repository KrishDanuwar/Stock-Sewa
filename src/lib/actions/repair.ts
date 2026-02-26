'use server';
import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function repairOrganization(_prevState: unknown, formData: FormData) {
    // 1. Get current authenticated Clerk user
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        redirect('/login');
    }

    const supabase = await createAdminClient();

    // 2. Check if profile already exists
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();

    if (existingProfile?.organization_id) {
        redirect('/dashboard');
    }

    // 3. Extract metadata for creation
    const orgName = formData.get('org_name') as string || 'My Organization';
    const email = user.emailAddresses[0]?.emailAddress || '';
    const username = email.split('@')[0] || 'user';

    console.log(`Initial Setup for Clerk User ${userId} (Org: ${orgName})`);

    try {
        // 4. Create the organization
        const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({ name: orgName })
            .select()
            .single();

        if (orgError) throw orgError;

        // 5. Create the profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                organization_id: newOrg.id,
                username: username
            });

        if (profileError) throw profileError;

        console.log('Setup successful, redirecting to /dashboard');
        redirect('/dashboard');

    } catch (error: unknown) {
        if (error instanceof Error && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        const errorMessage = error instanceof Error ? error.message : 'Setup failed. Please ensure the profiles table supports TEXT IDs.';
        console.error('Setup Action Exception:', error);
        return {
            error: errorMessage
        };
    }
}
