import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateInvoicePDF(invoice: any) {
    const doc = new jsPDF();
    const org = invoice.organizations || {};
    const customer = invoice.customers || {};
    const invoiceType = invoice.invoice_type || 'normal';

    let headerTitle = 'BILL';
    if (invoiceType === 'vat') headerTitle = 'TAX INVOICE';
    else if (invoiceType === 'pan') headerTitle = 'BILL (PAN Registered)';

    // Company Info
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(org.name || 'G.K Paints POS', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(org.address || 'Global Enterprise SaaS', 14, 28);
    if (org.pan_no) doc.text(`PAN: ${org.pan_no}`, 14, 33);
    if (org.vat_no) doc.text(`VAT: ${org.vat_no}`, 60, 33);
    if (org.phone) doc.text(`Phone: ${org.phone}`, 14, 38);

    // Invoice Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${headerTitle}: ${invoice.invoice_number}`, 140, 22);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 140, 28);
    doc.text(`Status: ${invoice.status?.toUpperCase()}`, 140, 33);

    // Bill To
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.name || 'Cash Customer', 14, 56);
    if (customer.phone) doc.text(`Phone: ${customer.phone}`, 14, 61);
    if (customer.address) doc.text(`Address: ${customer.address}`, 14, 66);
    if (invoice.customer_pan) doc.text(`PAN/VAT: ${invoice.customer_pan}`, 14, 71);

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
        head: [['#', 'Description', 'Qty', 'Rate', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const subtotal = Number(invoice.total_amount) - Number(invoice.tax_amount || 0);

    doc.setFontSize(10);
    doc.text(`Subtotal: Rs. ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 140, finalY);
    if (invoiceType === 'vat') {
        doc.text(`VAT (13%): Rs. ${Number(invoice.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 140, finalY + 6);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`Grand Total: Rs. ${Number(invoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 140, finalY + 12);
    doc.text(`Paid: Rs. ${Number(invoice.paid_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 140, finalY + 18);
    doc.text(`Balance: Rs. ${Number(invoice.remaining_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 140, finalY + 24);

    // Save the PDF
    doc.save(`${invoice.invoice_number}.pdf`);
}
