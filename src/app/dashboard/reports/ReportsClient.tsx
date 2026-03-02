'use client';

import { Download, Lock } from 'lucide-react';
import { PlanConfig } from '@/config/plans';
import { toast } from 'sonner';

interface ProductSale {
    name: string;
    quantity: number;
    revenue: number;
}

interface InvoiceRow {
    invoice_number: string;
    date_bs: string;
    date_ad: string;
    invoice_type: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    discount_amount: number;
    payment_method: string;
    payment_status: string;
    customer_name: string;
}

interface ReportsClientProps {
    topProducts: ProductSale[];
    invoiceRows: InvoiceRow[];
    totalRevenue: number;
    totalTax: number;
    totalSubtotal: number;
    totalSales: number;
    totalProfit: number;
    plan: PlanConfig;
}

function generateCSV(invoiceRows: InvoiceRow[], topProducts: ProductSale[], totalRevenue: number, totalTax: number, totalSubtotal: number, totalSales: number, totalProfit: number): string {
    const lines: string[] = [];

    // Summary
    lines.push('STOCK SEWA — REPORT EXPORT');
    lines.push('');
    lines.push('Summary');
    lines.push(`Total Revenue,Rs. ${totalRevenue}`);
    lines.push(`VAT Collected,Rs. ${totalTax}`);
    lines.push(`Net Subtotal,Rs. ${totalSubtotal}`);
    lines.push(`Estimated Profit,Rs. ${totalProfit}`);
    lines.push(`Total Sales,${totalSales}`);
    lines.push('');

    // Top Products
    lines.push('Top Selling Products');
    lines.push('Product Name,Qty Sold,Revenue');
    topProducts.forEach(p => {
        lines.push(`"${p.name}",${p.quantity},${p.revenue}`);
    });
    lines.push('');

    // All Invoices
    lines.push('All Invoices');
    lines.push('Invoice #,Date (BS),Date (AD),Type,Subtotal,Tax,Total,Discount,Payment Method,Status,Customer');
    invoiceRows.forEach(i => {
        lines.push(`"${i.invoice_number}","${i.date_bs}","${i.date_ad}","${i.invoice_type}",${i.subtotal},${i.tax_amount},${i.total_amount},${i.discount_amount},"${i.payment_method}","${i.payment_status}","${i.customer_name}"`);
    });

    return lines.join('\n');
}

export default function ReportsClient({ topProducts, invoiceRows, totalRevenue, totalTax, totalSubtotal, totalSales, totalProfit, plan }: ReportsClientProps) {
    const handleDownload = () => {
        if (!plan.features.canExportCSV) {
            toast.error('Advanced Data Export is only available on the Premium Yearly plan.', {
                description: 'Upgrade your plan in Settings to unlock this feature.'
            });
            return;
        }
        const csv = generateCSV(invoiceRows, topProducts, totalRevenue, totalTax, totalSubtotal, totalSales, totalProfit);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-sewa-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const isLocked = !plan.features.canExportCSV;

    return (
        <button
            onClick={handleDownload}
            className={isLocked ? "glass-button" : "glass-button-primary"}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                fontSize: '0.875rem',
                fontWeight: 600,
                opacity: isLocked ? 0.7 : 1,
            }}
        >
            {isLocked ? <Lock size={16} className="text-amber-500" /> : <Download size={16} />}
            {isLocked ? "Export Locked" : "Download CSV"}
        </button>
    );
}
