import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './numberToWords';

export interface InvoiceData {
    organization: {
        name: string;
        pan_vat: string | null;
        pan_vat_type?: 'pan' | 'vat';
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

    // PAN/VAT below org name (centered)
    let detailY = 26;
    if (data.organization.pan_vat) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const taxLabel = data.organization.pan_vat_type === 'vat' ? 'VAT No' : 'PAN No';
        doc.text(`${taxLabel}: ${data.organization.pan_vat}`, pageWidth / 2, detailY, { align: 'center' });
        detailY += 5;
    }

    // Header Details - Left Aligned below
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (data.organization.address) {
        doc.text(`Address: ${data.organization.address}`, 15, detailY);
        detailY += 5;
    }

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

    // Grand Total in Words
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const totalNum = typeof data.total_amount === 'number' ? data.total_amount : parseFloat(data.total_amount);
    doc.text(`In Words: ${numberToWords(totalNum)}`, 15, finalY);
    finalY += 8;

    // Reset font
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (data.amount_paid !== undefined) {
        const paidAmount = Number(data.amount_paid);
        doc.text(`Amount Paid: Rs. ${paidAmount.toLocaleString()}`, 15, finalY);
        finalY += 5;

        // Amount Paid in Words
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(`(${numberToWords(paidAmount)})`, 15, finalY);
        finalY += 6;

        const due = data.due_amount !== undefined ? Number(data.due_amount) : Number(data.total_amount) - paidAmount;

        doc.setFontSize(10);
        if (due > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text(`Due Amount: Rs. ${due.toLocaleString()}`, 15, finalY);
            finalY += 5;

            // Due Amount in Words
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.text(`(${numberToWords(due)})`, 15, finalY);
            doc.setFont('helvetica', 'normal');
        } else {
            doc.setFont('helvetica', 'normal');
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
 * Triggers the system print dialog using a hidden iframe.
 * This keeps the user on the current page while printing.
 */
export function printInvoicePDF(data: InvoiceData) {
    try {
        const doc = prepareInvoiceDoc(data);
        doc.autoPrint();

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);

        const hiddFrame = document.createElement('iframe');
        hiddFrame.style.position = 'absolute';
        hiddFrame.style.left = '-9999px';
        hiddFrame.style.top = '-9999px';
        hiddFrame.style.width = '0';
        hiddFrame.style.height = '0';
        hiddFrame.src = url;

        document.body.appendChild(hiddFrame);

        // Cleanup after a longer delay (60s) to ensure print dialog isn't affected
        setTimeout(() => {
            if (document.body.contains(hiddFrame)) {
                document.body.removeChild(hiddFrame);
            }
            URL.revokeObjectURL(url);
        }, 60000);
    } catch (err) {
        console.error('Print trigger failed:', err);
        // Fallback to download if print fails
        downloadInvoicePDF(data);
    }
}

// Deprecated alias to maintain compatibility if referenced elsewhere
export const generateInvoicePDF = downloadInvoicePDF;
