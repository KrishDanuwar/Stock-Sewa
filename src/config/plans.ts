import { createAdminClient } from '@/lib/supabase/server';

export interface PlanConfig {
    id: string;
    name: string;
    durationDays: number;
    price: number;
    period: string;
    description: string | null;
    is_popular: boolean;
    features: {
        canExportCSV: boolean;
        hasPrioritySupport: boolean;
        hasAdvancedReports: boolean;
        canManageSuppliers: boolean;
        [key: string]: boolean;  // Allow dynamic feature keys
    };
    featureLabels: string[];  // Display labels for enabled features
}

// Hardcoded fallback (used if DB is unreachable)
const FALLBACK_PLAN: PlanConfig = {
    id: 'trial',
    name: 'Free Trial',
    durationDays: 3,
    price: 0,
    period: 'trial',
    description: null,
    is_popular: false,
    features: {
        canExportCSV: false,
        hasPrioritySupport: false,
        hasAdvancedReports: false,
        canManageSuppliers: false,
    },
    featureLabels: [],
};

/**
 * Fetch a plan config from the database by plan ID.
 * Falls back to a default trial plan if DB is unreachable.
 */
export async function getPlanConfig(planId: string): Promise<PlanConfig> {
    try {
        const supabase = await createAdminClient();

        const { data: plan } = await supabase
            .from('plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (!plan) return { ...FALLBACK_PLAN, id: planId };

        const { data: features } = await supabase
            .from('plan_features')
            .select('*')
            .eq('plan_id', planId);

        // Build features object from DB entries
        const featureFlags: Record<string, boolean> = {
            canExportCSV: false,
            hasPrioritySupport: false,
            hasAdvancedReports: false,
            canManageSuppliers: false,
        };

        const enabledLabels: string[] = [];

        if (features) {
            for (const f of features) {
                featureFlags[f.feature_key] = f.enabled;
                if (f.enabled) {
                    enabledLabels.push(f.feature_label);
                }
            }
        }

        return {
            id: plan.id,
            name: plan.name,
            durationDays: plan.duration_days,
            price: Number(plan.price),
            period: plan.period,
            description: plan.description,
            is_popular: plan.is_popular,
            features: featureFlags as PlanConfig['features'],
            featureLabels: enabledLabels,
        };
    } catch (error) {
        console.error('getPlanConfig error:', error);
        return { ...FALLBACK_PLAN, id: planId };
    }
}
