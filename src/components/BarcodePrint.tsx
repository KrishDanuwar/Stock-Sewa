'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodePrintProps {
    value: string;
    name: string;
    price: number;
}

export default function BarcodePrint({ value, name, price }: BarcodePrintProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && value) {
            try {
                JsBarcode(canvasRef.current, value, {
                    format: 'EAN13',
                    width: 2,
                    height: 40,
                    displayValue: true,
                    fontSize: 14,
                    margin: 0,
                });
            } catch (e) {
                // If not valid EAN13, fallback to CODE128
                JsBarcode(canvasRef.current, value, {
                    format: 'CODE128',
                    width: 2,
                    height: 40,
                    displayValue: true,
                    fontSize: 14,
                    margin: 0,
                });
            }
        }
    }, [value]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const imgData = canvas.toDataURL('image/png');

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
                        }
                        .price {
                            font-size: 12px;
                            font-weight: bold;
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
                    <div class="price">Rs. ${price.toLocaleString('en-IN')}</div>
                    <script>
                        window.onload = () => {
                            window.print();
                            window.onafterprint = () => window.close();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-surface-200 shadow-sm group">
            <canvas ref={canvasRef} className="max-w-full h-auto"></canvas>
            <button
                onClick={handlePrint}
                className="mt-2 text-xs font-bold text-primary-600 hover:text-primary-700 underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                Print Thermal Label
            </button>
        </div>
    );
}
