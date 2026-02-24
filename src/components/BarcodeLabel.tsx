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
                marginBottom: '1mm',
                color: '#333',
                fontWeight: 500
            }}>
                MFG: {mfg || 'N/A'}
            </div>

            <svg ref={svgRef} style={{ width: '100%', maxWidth: '46mm', height: 'auto' }}></svg>

            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginTop: '1.5mm',
                fontWeight: 800,
                fontSize: '10pt'
            }}>
                <span>MRP: रु {price.toLocaleString()}</span>
            </div>

            <style jsx global>{`
                @page {
                    size: 50mm 25mm !important;
                    margin: 0 !important;
                }
                @media print {
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 25mm !important;
                        width: 50mm !important;
                    }
                    body {
                        visibility: hidden !important;
                    }
                    .label-container {
                        visibility: visible !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        margin: 0 !important;
                        padding: 1mm 1.5mm !important;
                        width: 50mm !important;
                        height: 25mm !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background: white !important;
                    }
                    .label-container * {
                        visibility: visible !important;
                    }
                }
            `}</style>
        </div>
    );
}
