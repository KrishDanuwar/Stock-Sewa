'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const supabase = createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/');
}

export async function signup(formData: FormData) {
    const supabase = createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const orgName = formData.get('orgName') as string;

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError || !authData.user) {
        return { error: authError?.message || 'Signup failed' };
    }

    // 2. Create the organization
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
            name: orgName,
            owner_id: authData.user.id,
            subscription_status: 'trialing', // Start with a trial
        })
        .select()
        .single();

    if (orgError) {
        return { error: orgError.message };
    }

    // 3. Create the profile
    const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        organization_id: org.id,
        email: email,
    });

    if (profileError) {
        return { error: profileError.message };
    }

    revalidatePath('/', 'layout');
    redirect('/');
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
}

import { revalidatePath } from 'next/cache';
