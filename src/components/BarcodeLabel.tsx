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
                width: 1.5,
                height: 40,
                displayValue: true,
                fontSize: 10,
                margin: 0
            });
        }
    }, [barcode]);

    return (
        <div className="label-container" style={{
            width: '50mm',
            height: '25mm',
            padding: '1mm 2mm',
            backgroundColor: 'white',
            color: 'black',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontSize: '8pt',
            lineHeight: '1.1'
        }}>
            {shopName && <div style={{ fontWeight: 'bold', fontSize: '7pt', marginBottom: '1px' }}>{shopName}</div>}
            <div style={{ fontWeight: 800, textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name}
            </div>

            <canvas ref={canvasRef} style={{ maxWidth: '45mm' }}></canvas>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '1px', fontWeight: 'bold' }}>
                <span>Price: रु {price}</span>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '6pt', color: '#333' }}>
                <span>MFG: {mfg || 'N/A'}</span>
                <span>Batch: {batch || 'N/A'}</span>
            </div>

            <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .label-container, .label-container * { visibility: visible; }
          .label-container { position: absolute; left: 0; top: 0; }
        }
      `}</style>
        </div>
    );
}
