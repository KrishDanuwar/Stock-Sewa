'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function repairOrganization(formData: FormData) {
    const supabase = await createClient();

    // 1. Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // 2. Check if profile already exists (safety check)
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (existingProfile?.organization_id) {
        redirect('/dashboard');
    }

    // 3. Extract metadata for repair
    const orgName = user.user_metadata?.org_name || 'My Organization';
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';

    try {
        // 4. Create the organization manually
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({ name: orgName })
            .select()
            .single();

        if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`);

        // 5. Create the profile linking user to organization
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                organization_id: org.id,
                username: username
            });

        if (profileError) throw new Error(`Failed to create profile: ${profileError.message}`);

    } catch (error) {
        console.error('Repair failed:', error);
    }

    // 6. Success!
    redirect('/dashboard');
}
