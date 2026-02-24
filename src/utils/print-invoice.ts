export function printInvoice(invoice: any) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const org = invoice.organizations || {};
    const customer = invoice.customers || {};
    const items = invoice.items || [];
    const invoiceType = invoice.invoice_type || 'normal';

    const subtotal = Number(invoice.total_amount) - Number(invoice.tax_amount || 0);
    const tax = Number(invoice.tax_amount || 0);
    const grandTotal = Number(invoice.total_amount);

    let headerTitle = 'BILL';
    let note = '';
    if (invoiceType === 'vat') {
        headerTitle = 'TAX INVOICE';
        note = 'Note: VAT Charged as per Nepal IRD Rules.';
    } else if (invoiceType === 'pan') {
        headerTitle = 'BILL (PAN Registered)';
        note = 'Note: VAT Not Applicable (Business is PAN registered only).';
    }

    const itemsHtml = items.map((item: any, index: number) => `
        <tr>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #000; padding: 8px;">${item.products?.name || 'N/A'}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.quantity}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${Number(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
    `).join('');

    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice - ${invoice.invoice_number}</title>
                <style>
                    body {
                        font-family: 'Inter', sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #000;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .company-name {
                        font-size: 24px;
                        font-weight: 900;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                    }
                    .company-details {
                        font-size: 12px;
                        line-height: 1.5;
                    }
                    .invoice-title {
                        font-size: 18px;
                        font-weight: 800;
                        margin: 20px 0;
                        text-transform: uppercase;
                    }
                    .meta-section {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        font-size: 12px;
                    }
                    .meta-block p {
                        margin: 4px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        font-size: 13px;
                    }
                    th {
                        background-color: #f1f1f1;
                        border: 1px solid #000;
                        padding: 10px;
                        text-align: left;
                        text-transform: uppercase;
                        font-size: 11px;
                        font-weight: 800;
                    }
                    .summary {
                        float: right;
                        width: 250px;
                        font-size: 13px;
                    }
                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 5px 0;
                    }
                    .grand-total {
                        font-weight: 900;
                        font-size: 16px;
                        border-top: 2px solid #000;
                        margin-top: 10px;
                        padding-top: 10px;
                    }
                    .footer-note {
                        margin-top: 50px;
                        font-size: 11px;
                        font-style: italic;
                    }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="company-name">${org.name || 'STOCK SEWA'}</div>
                        <div class="company-details">
                            ${org.address ? `Address: ${org.address}<br>` : ''}
                            ${org.pan_no ? `PAN No: ${org.pan_no}` : ''}
                            ${org.vat_no ? ` | VAT No: ${org.vat_no}` : ''}
                            ${org.phone ? `<br>Phone: ${org.phone}` : ''}
                        </div>
                    </div>

                    <div class="invoice-title">${headerTitle}</div>

                    <div class="meta-section">
                        <div class="meta-block">
                            <p><strong>Invoice No:</strong> ${invoice.invoice_number}</p>
                            <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString('en-GB')}</p>
                        </div>
                        <div class="meta-block">
                            <p><strong>Customer Name:</strong> ${customer.name || 'Walk-in'}</p>
                            ${invoice.customer_pan ? `<p><strong>Customer PAN/VAT:</strong> ${invoice.customer_pan}</p>` : ''}
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px; text-align: center;">S.N</th>
                                <th>Description</th>
                                <th style="width: 60px; text-align: center;">Qty</th>
                                <th style="width: 100px; text-align: right;">Rate</th>
                                <th style="width: 120px; text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div class="summary">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>Rs. ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        ${invoiceType === 'vat' ? `
                        <div class="summary-row">
                            <span>VAT (13%):</span>
                            <span>Rs. ${tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        ` : ''}
                        <div class="summary-row grand-total">
                            <span>Grand Total:</span>
                            <span>Rs. ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div class="summary-row" style="margin-top: 10px; font-size: 11px; color: #666;">
                            <span>Payment Mode:</span>
                            <span>Cash</span>
                        </div>
                    </div>

                    <div style="clear: both;"></div>

                    <div class="footer-note">
                        ${note}<br>
                        Generated via ${org.name || 'Stock Sewa'} POS System
                    </div>
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                        setTimeout(() => window.close(), 500);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}
