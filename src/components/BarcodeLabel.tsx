'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface LabelProps {
    name: string;
    price: number;
    barcode: string;
    mfg?: string;
    batch?: string;
    shopName?: string;
}

export default function BarcodeLabel({ name, price, barcode, mfg, batch, shopName }: LabelProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (svgRef.current && barcode) {
            JsBarcode(svgRef.current, barcode, {
                format: "CODE128",
                width: 1.2,
                height: 35,
                displayValue: true,
                fontSize: 8,
                margin: 0
            });
        }
    }, [barcode]);

    return (
        <div className="label-container" style={{
            width: '50mm',
            height: '25mm',
            padding: '1mm 1.5mm',
            backgroundColor: 'white',
            color: 'black',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontSize: '8pt',
            lineHeight: '1',
            boxSizing: 'border-box'
        }}>
            <div style={{
                textAlign: 'center',
                width: '100%',
                fontSize: '7pt',
                marginBottom: '0.5mm',
                color: '#000',
                fontWeight: 600
            }}>
                MFG: {mfg || 'N/A'}
            </div>

            <svg ref={svgRef} style={{ width: '46mm', height: '14mm' }}></svg>

            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginTop: '0.5mm',
                fontWeight: 900,
                fontSize: '11pt',
                color: '#000'
            }}>
                <span>MRP: रु {price.toLocaleString()}</span>
            </div>

            <style jsx global>{`
                @page {
                    size: 50mm 25mm !important;
                    margin: 0 !important;
                }
                @media print {
                    /* Hide EVERYTHING by default */
                    body * {
                        visibility: hidden !important;
                        display: none !important;
                    }

                    /* Atomically show ONLY the print container and its contents */
                    html, body {
                        visibility: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    .print-only, .print-only *,
                    .label-container, .label-container * {
                        visibility: visible !important;
                        display: flex !important;
                    }

                    .print-only {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 50mm !important;
                        height: 25mm !important;
                        z-index: 9999999 !important;
                        background: white !important;
                    }

                    .label-container {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 50mm !important;
                        height: 25mm !important;
                        margin: 0 !important;
                        padding: 1mm 1.5mm !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        box-sizing: border-box !important;
                    }
                    
                    /* Reset SVG display */
                    svg {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}
