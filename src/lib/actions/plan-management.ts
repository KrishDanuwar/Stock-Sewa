import { createAdminClient } from '@/lib/supabase/server';
import { isAuthorizedAdmin } from './admin-management';
import { revalidatePath } from 'next/cache';
import { PlanSchema } from '@/lib/security/schemas';
import { trackSecurityEvent } from '@/lib/security/audit-log';

// --- Types ---
export interface PlanWithFeatures {
    id: string;
    name: string;
    description: string | null;
    price: number;
    period: string;
    duration_days: number;
    is_popular: boolean;
    sort_order: number;
    is_active: boolean;
    features: PlanFeature[];
}

export interface PlanFeature {
    id: string;
    plan_id: string;
    feature_key: string;
    feature_label: string;
    enabled: boolean;
}

// --- Read (public) ---
export async function getPlans(): Promise<PlanWithFeatures[]> {
    const supabase = await createAdminClient();

    const { data: plans } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });

    if (!plans) return [];

    const { data: features } = await supabase
        .from('plan_features')
        .select('*')
        .order('created_at', { ascending: true });

    return plans.map(plan => ({
        ...plan,
        price: Number(plan.price),
        features: (features || []).filter(f => f.plan_id === plan.id)
    }));
}

export async function getActivePlansForPricing(): Promise<PlanWithFeatures[]> {
    const plans = await getPlans();
    return plans.filter(p => p.is_active && p.id !== 'trial');
}

export async function getPlanFromDB(planId: string): Promise<PlanWithFeatures | null> {
    const plans = await getPlans();
    return plans.find(p => p.id === planId) || null;
}



// --- Admin CRUD ---
export async function createPlan(data: any) {
    try {
        if (!(await isAuthorizedAdmin())) throw new Error('Unauthorized');

        const validatedData = PlanSchema.parse(data);
        const supabase = await createAdminClient();

        await trackSecurityEvent('create_plan', { planId: validatedData.id });

        const { error } = await supabase.from('plans').insert({
            ...validatedData,
            is_active: true,
        });

        if (error) return { error: error.message };
        revalidatePath('/admin');
        return { success: true };
    } catch (err: any) {
        if (err.name === 'ZodError') return { error: err.errors[0].message };
        return { error: err.message || 'An unexpected error occurred' };
    }
}

export async function updatePlan(id: string, data: any) {
    try {
        if (!(await isAuthorizedAdmin())) throw new Error('Unauthorized');

        // Partial validation for update
        const validatedData = PlanSchema.partial().parse(data);
        const supabase = await createAdminClient();

        await trackSecurityEvent('update_plan', { planId: id, updates: validatedData });

        const { error } = await supabase
            .from('plans')
            .update(validatedData)
            .eq('id', id);

        if (error) return { error: error.message };
        revalidatePath('/admin');
        revalidatePath('/trial-expired');
        return { success: true };
    } catch (err: any) {
        if (err.name === 'ZodError') return { error: err.errors[0].message };
        return { error: err.message || 'An unexpected error occurred' };
    }
}


export async function deletePlan(id: string) {
    if (!(await isAuthorizedAdmin())) throw new Error('Unauthorized');
    if (id === 'trial') return { error: 'Cannot delete trial plan' };
    const supabase = await createAdminClient();

    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin');
    revalidatePath('/trial-expired');
    return { success: true };
}

// --- Feature Management ---
export async function addFeatureToPlan(planId: string, featureKey: string, featureLabel: string, enabled: boolean = true) {
    if (!(await isAuthorizedAdmin())) throw new Error('Unauthorized');
    const supabase = await createAdminClient();

    const { error } = await supabase.from('plan_features').insert({
        plan_id: planId,
        feature_key: featureKey,
        feature_label: featureLabel,
        enabled,
    });

    if (error) return { error: error.message };
    revalidatePath('/admin');
    return { success: true };
}

export async function removeFeatureFromPlan(featureId: string) {
    if (!(await isAuthorizedAdmin())) throw new Error('Unauthorized');
    const supabase = await createAdminClient();

    const { error } = await supabase.from('plan_features').delete().eq('id', featureId);
    if (error) return { error: error.message };
    revalidatePath('/admin');
    return { success: true };
}

export async function toggleFeature(featureId: string, enabled: boolean) {
    if (!(await isAuthorizedAdmin())) throw new Error('Unauthorized');
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('plan_features')
        .update({ enabled })
        .eq('id', featureId);

    if (error) return { error: error.message };
    revalidatePath('/admin');
    return { success: true };
}
