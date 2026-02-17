import JsBarcode from 'jsbarcode';

export function printProductLabel(name: string, barcode: string, price: number) {
    if (typeof window === 'undefined') return;

    // Create a hidden canvas to generate the barcode image
    const canvas = document.createElement('canvas');

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
                        size: 50mm 30mm;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 30mm;
                        width: 50mm;
                        font-family: sans-serif;
                        text-align: center;
                    }
                    .name {
                        font-size: 10px;
                        font-weight: bold;
                        margin-bottom: 2px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        width: 100%;
                        padding: 0 2mm;
                        box-sizing: border-box;
                    }
                    .price {
                        font-size: 12px;
                        font-weight: bold;
                        margin-top: 2px;
                    }
                    img {
                        max-width: 45mm;
                        height: auto;
                    }
                </style>
            </head>
            <body>
                <div class="name">${name}</div>
                <img src="${imgData}" />
                <div class="price">Rs. ${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
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
