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
                    /* Surgically hide known layout containers to prevent bleeds */
                    .glass-sidebar, .sidebar, .sidebar-wrapper, aside, nav, footer, 
                    .page-header, .glass-card, .glass-input, table, 
                    .main-content > *:not(.print-only) {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                        height: 0 !important;
                        overflow: hidden !important;
                    }

                    /* Reset the root view */
                    html, body, .page-wrapper, .main-content {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 25mm !important;
                        width: 50mm !important;
                        background: white !important;
                        overflow: hidden !important;
                        position: relative !important;
                    }

                    /* Force the print container to the absolute surface */
                    .print-only, .label-container {
                        display: flex !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 50mm !important;
                        height: 25mm !important;
                        z-index: 9999999999 !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 1mm 1.5mm !important;
                        box-sizing: border-box !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                    }

                    /* Ensure all text inside is black and visible */
                    .label-container * {
                        visibility: visible !important;
                        color: #000 !important;
                    }

                    /* Explicitly suppress any other SVGs (icons) that might leak */
                    body svg:not(.label-container svg) {
                        display: none !important;
                    }

                    /* SVG Scaling */
                    svg {
                        display: block !important;
                        max-width: 46mm !important;
                        height: 14mm !important;
                    }
                }
            `}</style>
        </div>
    );
}
