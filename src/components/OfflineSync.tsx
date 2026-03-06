'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/offline/db';
import { createInvoice } from '@/lib/actions/invoices';
import { toast } from 'sonner';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import { CloudSync } from 'lucide-react';

export default function OfflineSync() {
    const isOnline = useOnlineStatus();
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const syncInvoices = async () => {
            if (!isOnline || syncing) return;

            const pending = await db.pendingInvoices.where('status').equals('pending').toArray();
            if (pending.length === 0) return;

            setSyncing(true);
            toast.info(`Syncing ${pending.length} offline invoices...`, { id: 'syncing' });

            let successCount = 0;
            for (const invoice of pending) {
                try {
                    const result = await createInvoice(invoice.data);
                    if (result?.success) {
                        await db.pendingInvoices.update(invoice.id!, { status: 'synced' });
                        successCount++;
                    } else {
                        console.error('Sync failed for invoice:', invoice.id, result?.error);
                        await db.pendingInvoices.update(invoice.id!, { status: 'error' });
                    }
                } catch (err) {
                    console.error('Critical sync error:', err);
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully synced ${successCount} invoices!`, { id: 'syncing' });
                // Clean up synced invoices older than 24h
                const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
                await db.pendingInvoices.where('timestamp').below(oneDayAgo).delete();
            } else {
                toast.dismiss('syncing');
            }

            setSyncing(false);
        };

        syncInvoices();
    }, [isOnline]);

    if (!syncing) return null;

    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: 30, display: 'flex', alignItems: 'center', gap: 10, color: 'white', border: '1px solid var(--brand-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontSize: '0.875rem' }}>
            <CloudSync size={18} className="animate-pulse" color="var(--brand-primary)" />
            <span>Syncing Data...</span>
        </div>
    );
}
