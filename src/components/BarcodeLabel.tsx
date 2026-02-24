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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && barcode) {
            JsBarcode(canvasRef.current, barcode, {
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
                fontWeight: 700,
                textAlign: 'center',
                width: '100%',
                fontSize: '8pt',
                marginBottom: '1mm',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {name}
            </div>

            <canvas ref={canvasRef} style={{ width: '46mm', height: '14mm' }}></canvas>

            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                marginTop: '1mm',
                fontWeight: 800,
                fontSize: '9pt'
            }}>
                <span>रु {price.toLocaleString()}</span>
            </div>

            <style jsx global>{`
                @page {
                    size: 50mm 25mm !important;
                    margin: 0 !important;
                }
                @media print {
                    body { margin: 0 !important; padding: 0 !important; }
                    .label-container { 
                        position: absolute !important; 
                        left: 0 !important; 
                        top: 0 !important;
                        margin: 0 !important;
                        visibility: visible !important;
                    }
                    body * { visibility: hidden; }
                    .label-container, .label-container * { visibility: visible; }
                }
            `}</style>
        </div>
    );
}
