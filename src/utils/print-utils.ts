import JsBarcode from 'jsbarcode';

export function printProductLabel(name: string, barcode: string, price: number, mrp?: number, batchNo?: string) {
    if (typeof window === 'undefined') return;

    // Create a hidden canvas to generate the barcode image
    const canvas = document.createElement('canvas');
    const today = new Date();
    const mfgDate = today.toLocaleDateString('en-GB'); // DD/MM/YYYY

    try {
        JsBarcode(canvas, barcode, {
            format: 'EAN13',
            width: 2,
            height: 40,
            displayValue: true,
            fontSize: 14,
            margin: 0,
        });
    } catch (e) {
        // Fallback to CODE128 if EAN13 fails (e.g. invalid length or checksum)
        JsBarcode(canvas, barcode, {
            format: 'CODE128',
            width: 2,
            height: 40,
            displayValue: true,
            fontSize: 14,
            margin: 0,
        });
    }

    const imgData = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Please allow pop-ups to print labels.');
        return;
    }

    printWindow.document.write(`
        <html>
            <head>
                <title>Print Label - ${name}</title>
                <style>
                    @page {
                        size: 50mm 25mm;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 1mm 2mm;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        height: 25mm;
                        width: 50mm;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        box-sizing: border-box;
                        overflow: hidden;
                    }
                    .header {
                        width: 100%;
                        font-size: 10px;
                        font-weight: 800;
                        text-align: center;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        margin-bottom: 2px;
                        text-transform: uppercase;
                    }
                    .barcode-container {
                        width: 100%;
                        height: 12mm;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    .details {
                        width: 100%;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        font-size: 7px;
                        font-weight: 600;
                        margin-top: 1px;
                        border-top: 0.2px solid #000;
                        padding-top: 1px;
                    }
                    .mrp-section {
                        grid-column: span 2;
                        text-align: center;
                        font-size: 9px;
                        font-weight: 900;
                        margin-top: 1px;
                    }
                    .field {
                        display: flex;
                        gap: 2px;
                    }
                    .label { color: #555; }
                </style>
            </head>
            <body>
                <div class="header">${name}</div>
                <div class="barcode-container">
                    <img src="${imgData}" />
                </div>
                <div class="details">
                    <div class="field"><span class="label">MFG:</span> ${mfgDate}</div>
                    <div class="field"><span class="label">BATCH:</span> ${batchNo || 'N/A'}</div>
                </div>
                <div class="mrp-section">
                    MRP: Rs. ${mrp ? mrp.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
