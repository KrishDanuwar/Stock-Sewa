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
                    /* Nuclear Hide: Hide all standard layout elements */
                    .glass-sidebar, .sidebar, aside, nav, footer, .page-header, .glass-card, .glass-input, .sidebar-wrapper {
                        display: none !important;
                    }

                    /* Reset body and html for thermal paper */
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 25mm !important;
                        width: 50mm !important;
                        background: white !important;
                        overflow: hidden !important;
                    }

                    /* Ensure ONLY the label container is shown and fills the page */
                    .label-container {
                        display: flex !important;
                        visibility: visible !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 50mm !important;
                        height: 25mm !important;
                        z-index: 99999 !important;
                        margin: 0 !important;
                        background: white !important;
                    }

                    /* Hide all other siblings in the main content area */
                    .main-content > *:not(.print-only) {
                        display: none !important;
                    }
                    
                    /* Force the print-only wrapper to behave */
                    .print-only {
                        display: block !important;
                        visibility: visible !important;
                    }
                }
            `}</style>
        </div>
    );
}
