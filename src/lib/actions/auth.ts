'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUp(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const orgName = formData.get('org_name') as string;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username, org_name: orgName },
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.user) {
        redirect('/dashboard');
    }
}

export async function signIn(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return { error: error.message };
    }

    redirect('/dashboard');
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const newPassword = formData.get('new_password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (!newPassword || newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters long' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'Passwords do not match' };
    }

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
