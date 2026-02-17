'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

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

    // 1. Sign up the user (Database trigger handles Org/Profile creation)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                org_name: orgName,
            },
        },
    });

    if (authError || !authData.user) {
        return { error: authError?.message || 'Signup failed' };
    }

    revalidatePath('/', 'layout');
    redirect('/');
}

export async function signInWithGoogle() {
    const supabase = createClient();
    const host = headers().get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const origin = `${protocol}://${host}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.url) {
        redirect(data.url);
    }
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
}


