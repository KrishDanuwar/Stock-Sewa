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
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    items: {
        product_name: string;
        quantity: number;
        unit_price: number;
    }[];
}

export function generateInvoicePDF(data: InvoiceData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(data.organization.name, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (data.organization.address) doc.text(data.organization.address, pageWidth / 2, 26, { align: 'center' });
    if (data.organization.phone) doc.text(`Phone: ${data.organization.phone}`, pageWidth / 2, 31, { align: 'center' });
    if (data.organization.pan_vat) {
        doc.setFont('helvetica', 'bold');
        doc.text(`PAN/VAT No: ${data.organization.pan_vat}`, pageWidth / 2, 37, { align: 'center' });
    }

    // Title
    doc.setFontSize(14);
    const title = data.invoice_type === 'vat' ? 'TAX INVOICE' :
        data.invoice_type === 'pan' ? 'PAN INVOICE' : 'ABBREVIATED TAX INVOICE (SALES BILL)';
    doc.text(title, pageWidth / 2, 48, { align: 'center' });
    doc.line(20, 50, pageWidth - 20, 50);

    // Invoice Meta
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${data.invoice_number}`, 15, 60);
    doc.text(`Date (AD): ${data.date_ad}`, pageWidth - 15, 60, { align: 'right' });
    doc.text(`Date (BS): ${data.date_bs}`, pageWidth - 15, 65, { align: 'right' });

    // Customer Info
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customer_name || 'Walk-in Customer', 30, 75);
    if (data.customer_pan) doc.text(`Buyer's PAN: ${data.customer_pan}`, 30, 80);

    // Table
    const tableHeaders = [['S.N.', 'Particulars', 'Qty', 'Rate', 'Amount']];
    const tableData = data.items.map((item, index) => [
        index + 1,
        item.product_name,
        item.quantity,
        `रु ${item.unit_price.toLocaleString()}`,
        `रु ${(item.quantity * item.unit_price).toLocaleString()}`
    ]);

    autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: 85,
        theme: 'grid',
        headStyles: { fillColor: [79, 142, 247], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 10 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    const leftPad = pageWidth - 60;
    doc.text('Subtotal:', leftPad, finalY);
    doc.text(`रु ${data.subtotal.toLocaleString()}`, pageWidth - 15, finalY, { align: 'right' });

    if (data.tax_amount > 0) {
        doc.text('VAT (13%):', leftPad, finalY + 6);
        doc.text(`रु ${data.tax_amount.toLocaleString()}`, pageWidth - 15, finalY + 6, { align: 'right' });
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', leftPad, finalY + (data.tax_amount > 0 ? 12 : 6));
    doc.text(`रु ${data.total_amount.toLocaleString()}`, pageWidth - 15, finalY + (data.tax_amount > 0 ? 12 : 6), { align: 'right' });

    // Amount in Words
    const wordsY = finalY + 25;
    doc.text('Amount in words:', 15, wordsY);
    doc.setFont('helvetica', 'normal');
    doc.text(numberToWords(data.total_amount), 15, wordsY + 6);

    // Footer
    doc.setFontSize(8);
    doc.text('This is a computer generated invoice.', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    const safeName = (data.customer_name || 'Walk-in').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Invoice_${data.invoice_number}_${safeName}.pdf`);
}
