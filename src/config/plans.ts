export type SubscriptionPlan = 'trial' | 'monthly' | 'yearly';

export interface PlanConfig {
    id: SubscriptionPlan;
    name: string;
    durationDays: number;
    features: {
        canExportCSV: boolean;
        hasPrioritySupport: boolean;
        hasAdvancedReports: boolean;
        canManageSuppliers: boolean;
        maxInvoicesPerMonth?: number;
    };
}

export const PLANS: Record<SubscriptionPlan, PlanConfig> = {
    trial: {
        id: 'trial',
        name: 'Free Trial',
        durationDays: 3,
        features: {
            canExportCSV: false,
            hasPrioritySupport: false,
            hasAdvancedReports: false,
            canManageSuppliers: false,
            maxInvoicesPerMonth: 50,
        }
    },
    monthly: {
        id: 'monthly',
        name: 'Basic Monthly',
        durationDays: 30,
        features: {
            canExportCSV: false,
            hasPrioritySupport: false,
            hasAdvancedReports: false,
            canManageSuppliers: false,
        }
    },
    yearly: {
        id: 'yearly',
        name: 'Premium Yearly',
        durationDays: 365,
        features: {
            canExportCSV: true,
            hasPrioritySupport: true,
            hasAdvancedReports: true,
            canManageSuppliers: true,
        }
    }
};

export function getPlanConfig(planId: string): PlanConfig {
    return PLANS[planId as SubscriptionPlan] || PLANS.trial;
}
