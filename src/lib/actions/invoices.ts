'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getOrgContext } from '@/lib/org-context';
import { getTodayBs } from '@/utils/date-utils';
import { revalidatePath } from 'next/cache';
import { rateLimit } from '@/lib/security/rate-limit';
import { InvoicePayloadSchema } from '@/lib/security/schemas';
import { trackSecurityEvent } from '@/lib/security/audit-log';

export interface CartItem {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    cost_price: number;
}

export interface CreateInvoicePayload {
    customer_id?: string;
    invoice_type: 'normal' | 'pan' | 'vat';
    payment_method: string;
    payment_status: 'paid' | 'unpaid' | 'partial';
    amount_paid: number;
    customer_name_manual?: string;
    customer_pan_manual?: string;
    notes?: string;
    discount_amount?: number;
    items: CartItem[];
}



export async function createInvoice(payload: CreateInvoicePayload) {
    try {
        await rateLimit(30, 60000); // 30 invoices per minute
        const validatedPayload = InvoicePayloadSchema.parse(payload);

        const { organizationId } = await getOrgContext();
        const supabase = await createAdminClient();
        const today = getTodayBs();

        // ---- Calculation Engine ----
        const rawSubtotal = validatedPayload.items.reduce(
            (sum, item) => sum + item.unit_price * item.quantity,
            0
        );
        const discount_amount = validatedPayload.discount_amount || 0;
        const subtotal = Math.max(0, rawSubtotal - discount_amount);
        const taxRate = validatedPayload.invoice_type === 'vat' ? 0.13 : 0;
        const tax_amount = parseFloat((subtotal * taxRate).toFixed(2));
        const total_amount = parseFloat((subtotal + tax_amount).toFixed(2));
        const unpaid_amount = parseFloat((total_amount - validatedPayload.amount_paid).toFixed(2));

        // Audit check
        if (total_amount > 500000) {
            await trackSecurityEvent('high_value_invoice', { total_amount, orgId: organizationId });
        }

        // ---- Credit Validation ----
        if (validatedPayload.customer_id && unpaid_amount > 0) {
            const { data: customer } = await supabase
                .from('customers')
                .select('credit_balance, credit_limit')
                .eq('id', validatedPayload.customer_id)
                .single();

            if (customer) {
                const newBalance = (customer.credit_balance || 0) + unpaid_amount;
                if (customer.credit_limit > 0 && newBalance > customer.credit_limit) {
                    return { error: `Sale exceeds customer's credit limit of Rs. ${customer.credit_limit}. Current balance: Rs. ${customer.credit_balance}.` };
                }
            }
        }

        // Generate invoice number
        const { count } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId);

        const invoice_number = `INV-${today.year}-${String((count ?? 0) + 1).padStart(4, '0')}`;

        // Insert invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                organization_id: organizationId,
                customer_id: validatedPayload.customer_id || null,
                invoice_number,
                invoice_type: validatedPayload.invoice_type,
                subtotal,
                tax_amount,
                total_amount,
                payment_method: validatedPayload.payment_method,
                payment_status: validatedPayload.payment_status,
                amount_paid: validatedPayload.amount_paid,
                discount_amount: validatedPayload.discount_amount || 0,
                notes: validatedPayload.notes || null,
                customer_name_manual: validatedPayload.customer_name_manual || null,
                customer_pan_manual: validatedPayload.customer_pan_manual || null,
                date_ad: new Date().toISOString().split('T')[0],
                date_bs: today.formattedEn,
            })
            .select()
            .single();

        if (invoiceError) return { error: invoiceError.message };

        // Insert invoice items
        const { error: itemsError } = await supabase.from('invoice_items').insert(
            validatedPayload.items.map((item) => ({
                invoice_id: invoice.id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                cost_price: item.cost_price,
            }))
        );
        if (itemsError) return { error: itemsError.message };

        // Deduct stock for each product
        for (const item of validatedPayload.items) {
            await supabase.rpc('decrement_stock', {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
            });

            // Log stock movement
            await supabase.from('stock_movements').insert({
                organization_id: organizationId,
                product_id: item.product_id,
                movement_type: 'out',
                quantity: -item.quantity,
                reference_id: invoice.id,
                notes: `Sale - ${invoice_number}`,
            });
        }

        // ---- Update Customer Credit Balance ----
        if (validatedPayload.customer_id && unpaid_amount !== 0) {
            const { error: creditError } = await supabase.rpc('update_customer_credit', {
                p_customer_id: validatedPayload.customer_id,
                p_amount: unpaid_amount
            });

            if (creditError) {
                const { data: customer } = await supabase
                    .from('customers')
                    .select('credit_balance')
                    .eq('id', validatedPayload.customer_id)
                    .single();

                await supabase
                    .from('customers')
                    .update({ credit_balance: (customer?.credit_balance || 0) + unpaid_amount })
                    .eq('id', validatedPayload.customer_id);
            }
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/invoices');
        revalidatePath('/dashboard/products');

        return {
            success: true,
            invoice: {
                id: invoice.id,
                invoice_number: invoice.invoice_number,
                date_bs: invoice.date_bs,
                date_ad: invoice.date_ad,
                total_amount: invoice.total_amount
            }
        };
    } catch (err: any) {
        if (err.name === 'ZodError') return { error: err.errors[0].message };
        return { error: err.message || 'An unexpected error occurred' };
    }
}


export async function getInvoices() {
    const { organizationId } = await getOrgContext();
    const supabase = await createAdminClient();
    const { data, error } = await supabase
        .from('invoices')
        .select('*, customers(name)')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function cleanupOldInvoices() {
    try {
        const { organizationId } = await getOrgContext();
        const supabase = await createAdminClient();

        // 1. Get retention setting
        const { data: org } = await supabase
            .from('organizations')
            .select('bill_retention_months')
            .eq('id', organizationId)
            .single();

        const months = org?.bill_retention_months || 0;
        if (months === 0) return { error: 'Retention is set to "Keep Forever". No action taken.' };

        // 2. Calculate cutoff date
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);
        const cutoffIso = cutoffDate.toISOString().split('T')[0];

        // 3. Fetch all data for archival (Invoices + Items)
        const { data: invoicesToArchive, error: fetchError } = await supabase
            .from('invoices')
            .select('*, invoice_items(*)')
            .eq('organization_id', organizationId)
            .lt('date_ad', cutoffIso)
            .order('date_ad', { ascending: true });

        if (fetchError) throw fetchError;
        if (!invoicesToArchive || invoicesToArchive.length === 0) {
            return { success: true, count: 0, message: 'No old invoices found to archive.' };
        }

        // 4. Transform to JSON
        const archiveData = {
            organization_id: organizationId,
            archived_at: new Date().toISOString(),
            retention_period_months: months,
            cutoff_date: cutoffIso,
            invoices: invoicesToArchive
        };

        const fileName = `archive_${organizationId}_${new Date().getTime()}.json`;
        const jsonBlob = JSON.stringify(archiveData, null, 2);

        // 5. Upload to Supabase Storage
        // We use the logos bucket but in an archives/ folder
        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(`archives/${fileName}`, jsonBlob, {
                contentType: 'application/json',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // 6. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(`archives/${fileName}`);

        // 7. Register in archives table
        const { error: archiveDbError } = await supabase
            .from('archives')
            .insert({
                organization_id: organizationId,
                file_name: fileName,
                file_url: publicUrl,
                period_start: invoicesToArchive[0].date_ad,
                period_end: invoicesToArchive[invoicesToArchive.length - 1].date_ad,
                invoice_count: invoicesToArchive.length
            });

        if (archiveDbError) throw archiveDbError;

        // 8. Delete originals (Cascading deletes handle items and movements)
        const { error: deleteError } = await supabase
            .from('invoices')
            .delete()
            .eq('organization_id', organizationId)
            .lt('date_ad', cutoffIso);

        if (deleteError) throw deleteError;

        revalidatePath('/dashboard/invoices');
        return {
            success: true,
            count: invoicesToArchive.length,
            message: `Successfully archived ${invoicesToArchive.length} invoices to Cold Storage and cleaned up active database.`
        };
    } catch (err: any) {
        console.error('[CLEANUP_ERROR]', err);
        return { error: err.message || 'Failed to archive and cleanup invoices' };
    }
}

export async function getArchives() {
    try {
        const { organizationId } = await getOrgContext();
        const supabase = await createAdminClient();

        const { data, error } = await supabase
            .from('archives')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err: any) {
        console.error('[GET_ARCHIVES_ERROR]', err);
        return [];
    }
}
