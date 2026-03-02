import { getOrgContext } from '@/lib/org-context';
import { createAdminClient } from '@/lib/supabase/server';
import { Truck, Lock } from 'lucide-react';
import { getSuppliers, getPurchases } from '@/lib/actions/suppliers';
import { getProducts } from '@/lib/actions/products';
import SuppliersClient from './SuppliersClient';

export default async function SuppliersPage() {
    const { organizationId, plan } = await getOrgContext();

    // Plan gate check
    if (!plan.features.canManageSuppliers) {
        return (
            <div className="animate-fade-in-up">
                <div className="page-header">
                    <h1 className="page-title">Suppliers</h1>
                    <p className="page-subtitle">Supplier & Purchase Management</p>
                </div>
                <div className="glass-card" style={{ padding: 48, textAlign: 'center', marginTop: 24 }}>
                    <Lock size={48} style={{ margin: '0 auto 16px', color: 'var(--brand-primary)', opacity: 0.5 }} />
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
                        Premium Feature
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 500, margin: '0 auto 20px' }}>
                        Supplier management and purchase tracking is available exclusively on the <strong>Premium Yearly</strong> plan.
                        Upgrade in Settings to unlock this feature.
                    </p>
                    <a href="/dashboard/settings" className="glass-button glass-button-primary" style={{ display: 'inline-flex', padding: '12px 28px', textDecoration: 'none' }}>
                        Upgrade Plan
                    </a>
                </div>
            </div>
        );
    }

    const [suppliers, purchases, products] = await Promise.all([
        getSuppliers(),
        getPurchases(),
        getProducts(),
    ]);

    return (
        <div className="animate-fade-in-up">
            <SuppliersClient
                suppliers={suppliers}
                purchases={purchases}
                products={products}
            />
        </div>
    );
}
