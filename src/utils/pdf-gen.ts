import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateInvoicePDF(invoice: any) {
    const doc = new jsPDF();

    // Company Info (Placeholder - could be from organization data)
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('StockSewa SaaS', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Your Trusted Inventory Partner', 14, 28);
    doc.text('Email: billing@stocksewa.com', 14, 33);

    // Invoice Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`INVOICE: ${invoice.invoice_number}`, 140, 22);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 140, 28);
    doc.text(`Status: ${invoice.status?.toUpperCase()}`, 140, 33);

    // Bill To
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customers?.name || 'Cash Customer', 14, 56);
    if (invoice.customers?.phone) doc.text(`Phone: ${invoice.customers.phone}`, 14, 61);
    if (invoice.customers?.address) doc.text(`Address: ${invoice.customers.address}`, 14, 66);

    // Items Table
    const tableData = invoice.items.map((item: any, index: number) => [
        index + 1,
        item.products.name,
        item.quantity,
        `Rs. ${item.price}`,
        `Rs. ${item.subtotal}`,
    ]);

    autoTable(doc, {
        startY: 80,
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Subtotal']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    });

    // Totals
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: Rs. ${invoice.total_amount}`, 140, finalY);
    doc.text(`Paid: Rs. ${invoice.paid_amount}`, 140, finalY + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`Remaining: Rs. ${invoice.remaining_amount}`, 140, finalY + 12);

    // Save the PDF
    doc.save(`${invoice.invoice_number}.pdf`);
}
