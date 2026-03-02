import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './numberToWords';

export interface InvoiceData {
    organization: {
        name: string;
        pan_vat: string | null;
        address: string | null;
        phone: string | null;
    };
    invoice_number: string;
    invoice_type: 'normal' | 'pan' | 'vat';
    date_ad: string;
    date_bs: string;
    customer_name?: string;
    customer_pan?: string;
    customer_tax_type?: 'pan' | 'vat';
    raw_subtotal?: number;
    discount_amount?: number;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    amount_paid?: number;
    due_amount?: number;
    payment_mode: string;
    items: {
        product_name: string;
        quantity: number;
        unit_price: number;
    }[];
}

/**
 * Internal helper to create the jsPDF instance with IRD-compliant content
 */
function prepareInvoiceDoc(data: InvoiceData): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header - Center Name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(data.organization.name, pageWidth / 2, 20, { align: 'center' });

    // Header Details - Left Aligned below Name
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let detailY = 26;
    if (data.organization.address) {
        doc.text(`Address: ${data.organization.address}`, 15, detailY);
        detailY += 5;
    }

    // Header PAN/VAT logic based on invoice type
    if (data.invoice_type === 'vat' && data.organization.pan_vat) {
        doc.text(`PAN No: ${data.organization.pan_vat}`, 15, detailY);
        detailY += 5;
        doc.text(`VAT No: ${data.organization.pan_vat}`, 15, detailY);
        detailY += 5;
    } else if (data.invoice_type === 'pan' && data.organization.pan_vat) {
        doc.text(`PAN No: ${data.organization.pan_vat}`, 15, detailY);
        detailY += 5;
    }
    // Normal bills (matching Sample 2) hide PAN/VAT in header

    if (data.organization.phone) {
        doc.text(`Phone: ${data.organization.phone}`, 15, detailY);
        detailY += 5;
    }

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const title = data.invoice_type === 'vat' ? 'TAX INVOICE (VAT BILL)' :
        data.invoice_type === 'pan' ? 'BILL (PAN Registered)' : 'BILL';
    doc.text(title, 15, 48);
    doc.line(15, 52, pageWidth - 15, 52);

    // Invoice Meta
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${data.invoice_number}`, 15, 60);
    doc.text(`Date: ${data.date_bs}`, 15, 65);

    // Customer Info
    doc.text(`Customer Name: ${data.customer_name || '-'}`, 15, 72);
    if (data.customer_pan) {
        const panLabel = data.customer_tax_type === 'vat' ? 'Customer VAT' : 'Customer PAN';
        doc.text(`${panLabel}: ${data.customer_pan}`, 15, 77);
    }

    // Table
    const tableHeaders = [['S.N', 'Description', 'Qty', 'Rate', 'Amount']];
    const tableData = data.items.map((item, index) => [
        index + 1,
        item.product_name,
        item.quantity,
        item.unit_price.toLocaleString(),
        (item.quantity * item.unit_price).toLocaleString()
    ]);

    autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: 85,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0] },
        columnStyles: {
            0: { cellWidth: 15 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' }
        }
    });

    let finalY = ((doc as unknown) as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Totals
    doc.setFont('helvetica', 'bold');

    // Optionally show raw subtotal and discount if applicable
    if (data.discount_amount && data.discount_amount > 0 && data.raw_subtotal) {
        doc.text(`Gross Subtotal: Rs. ${data.raw_subtotal.toLocaleString()}`, 15, finalY);
        finalY += 6;
        doc.text(`Discount: Rs. ${data.discount_amount.toLocaleString()}`, 15, finalY);
        finalY += 6;
        doc.text(`Net Subtotal: Rs. ${data.subtotal.toLocaleString()}`, 15, finalY);
        finalY += 6;
    } else {
        doc.text(`Subtotal: Rs. ${data.subtotal.toLocaleString()}`, 15, finalY);
        finalY += 6;
    }

    if (data.invoice_type === 'vat') {
        doc.text(`VAT (13%): Rs. ${data.tax_amount.toLocaleString()}`, 15, finalY);
        finalY += 1;
    } else if (data.invoice_type === 'pan') {
        // Just the total, which might just be subtotal anyway
        finalY -= 5;
    }

    doc.setFontSize(11);
    doc.text(`Grand Total: Rs. ${data.total_amount.toLocaleString()}`, 15, finalY + 5);
    finalY += 12;

    // Amount in Words
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const amountWords = numberToWords(typeof data.total_amount === 'number' ? data.total_amount : parseFloat(data.total_amount));
    doc.text(`In Words: ${amountWords}`, 15, finalY);
    finalY += 8;

    if (data.amount_paid !== undefined) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Amount Paid: Rs. ${Number(data.amount_paid).toLocaleString()}`, 15, finalY);
        finalY += 5;

        const due = data.due_amount !== undefined ? Number(data.due_amount) : Number(data.total_amount) - Number(data.amount_paid);

        if (due > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text(`Due Amount: Rs. ${due.toLocaleString()}`, 15, finalY);
            doc.setFont('helvetica', 'normal');
        } else {
            doc.text(`Due Amount: Rs. 0`, 15, finalY);
        }
        finalY += 7;
    } else {
        finalY += 3;
    }

    // notes
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Mode: ${data.payment_mode}`, 15, finalY);
    finalY += 6;

    if (data.invoice_type === 'vat') {
        doc.text('Note: VAT Charged as per Nepal IRD Rules.', 15, finalY);
    } else if (data.invoice_type === 'pan') {
        doc.text('Note: VAT Not Applicable (Business is PAN registered only).', 15, finalY);
    }

    // branding at the very bottom
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Software by Stock Sewa', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    return doc;
}

/**
 * Generates and triggers a file download
 */
export function downloadInvoicePDF(data: InvoiceData) {
    const doc = prepareInvoiceDoc(data);
    const safeName = (data.customer_name || 'Walk-in').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Invoice_${data.invoice_number}_${safeName}.pdf`);
}

/**
 * Triggers the system print dialog without saving a file
 */
export function printInvoicePDF(data: InvoiceData) {
    try {
        const doc = prepareInvoiceDoc(data);
        doc.autoPrint();

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);

        const hiddFrame = document.createElement('iframe');
        hiddFrame.style.position = 'fixed';
        hiddFrame.style.visibility = 'hidden';
        hiddFrame.style.width = '0';
        hiddFrame.style.height = '0';
        hiddFrame.src = url;

        document.body.appendChild(hiddFrame);

        // Cleanup
        setTimeout(() => {
            if (document.body.contains(hiddFrame)) {
                document.body.removeChild(hiddFrame);
            }
            URL.revokeObjectURL(url);
        }, 10000);
    } catch (err) {
        console.error('Print trigger failed:', err);
        // Fallback to download if print fails
        downloadInvoicePDF(data);
    }
}

// Deprecated alias to maintain compatibility if referenced elsewhere
export const generateInvoicePDF = downloadInvoicePDF;
