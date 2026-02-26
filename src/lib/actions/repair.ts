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

    console.log(`Checking setup for Clerk User: ${userId}`);

    // 2. Check if profile already exists
    // We handle the error here because if the migration hasn't been run, 
    // passing a Clerk ID (text) to a UUID column will throw a database error.
    const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .maybeSingle();

    if (checkError) {
        console.error('Existence check failed:', checkError);
        if (checkError.code === '22P02') {
            return { error: 'Database Migration Required! Your database still expects UUIDs. Please run clerk_migration.sql in your Supabase SQL Editor.' };
        }
        return { error: `Database error: ${checkError.message}` };
    }

    if (existingProfile?.organization_id) {
        console.log('Profile found, redirecting to dashboard');
        redirect('/dashboard');
    }

    // 3. Extract metadata for creation
    const orgName = formData.get('org_name') as string || 'My Organization';
    const email = user.emailAddresses[0]?.emailAddress || '';
    const username = email.split('@')[0] || 'user';

    console.log(`Starting registration for ${userId} with Org: ${orgName}`);

    try {
        // 4. Create the organization
        const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({ name: orgName })
            .select()
            .single();

        if (orgError) {
            console.error('Org Creation Error:', orgError);
            throw new Error(`Failed to create organization: ${orgError.message}`);
        }

        // 5. Create the profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                organization_id: newOrg.id,
                username: username
            });

        if (profileError) {
            console.error('Profile Creation Error:', profileError);
            if (profileError.code === '22P02') {
                throw new Error('Database Migration Required! The profiles table is still using UUID. Please run clerk_migration.sql.');
            }
            throw new Error(`Failed to create profile: ${profileError.message}`);
        }

        console.log('Setup successful, redirecting to /dashboard');
        redirect('/dashboard');

    } catch (error: unknown) {
        if (error instanceof Error && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown setup failure';
        console.error('Setup Action Exception:', error);
        return {
            error: errorMessage
        };
    }
}
