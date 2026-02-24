'use client';

import { useEffect, useRef, useState } from 'react';
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
    const [imgData, setImgData] = useState<string>('');

    useEffect(() => {
        if (canvasRef.current && barcode) {
            try {
                // Generate onto hidden canvas
                JsBarcode(canvasRef.current, barcode, {
                    format: "CODE128",
                    width: 2, // Higher density for canvas
                    height: 60,
                    displayValue: true,
                    fontSize: 14,
                    margin: 0,
                    background: "#ffffff"
                });
                setImgData(canvasRef.current.toDataURL("image/png"));
            } catch (err) {
                console.error("Barcode generation failed:", err);
            }
        }
    }, [barcode]);

    return (
        <div className="label-container">
            {/* Hidden canvas for generation */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="label-content">
                <div className="mfg-text">MFG: {mfg || 'N/A'}</div>

                {imgData ? (
                    <img src={imgData} className="barcode-img" alt="barcode" />
                ) : (
                    <div className="barcode-placeholder">Generating...</div>
                )}

                <div className="mrp-text">
                    MRP: रु {price.toLocaleString()}
                </div>
            </div>

            <style jsx>{`
                .label-container {
                    width: 50mm;
                    height: 25mm;
                    background: white;
                    color: black;
                    overflow: hidden;
                    box-sizing: border-box;
                }
                .label-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    width: 100%;
                    padding: 1mm 1.5mm;
                    box-sizing: border-box;
                }
                .mfg-text {
                    font-size: 7pt;
                    font-weight: 600;
                    margin-bottom: 0.5mm;
                    text-align: center;
                    color: #000;
                }
                .barcode-img {
                    width: 46mm;
                    height: 14mm;
                    object-fit: contain;
                }
                .mrp-text {
                    font-size: 11pt;
                    font-weight: 900;
                    margin-top: 0.5mm;
                    text-align: center;
                    color: #000;
                }
            `}</style>

            <style jsx global>{`
                @page {
                    size: 50mm 25mm !important;
                    margin: 0 !important;
                }
                @media print {
                    /* EXTREME ISOLATION: Hide every single thing in the body */
                    body > *:not(.print-only) {
                        display: none !important;
                    }

                    /* Suppress all layout artifacts (the "semi-circle" elements) */
                    *::before, *::after {
                        display: none !important;
                        content: none !important;
                    }

                    html, body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 25mm !important;
                        width: 50mm !important;
                        overflow: hidden !important;
                    }

                    .print-only {
                        display: block !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 50mm !important;
                        height: 25mm !important;
                        background: white !important;
                        z-index: 99999999 !important;
                    }

                    .label-container {
                        width: 50mm !important;
                        height: 25mm !important;
                        display: flex !important;
                        visibility: visible !important;
                    }
                    
                    .label-content * {
                        visibility: visible !important;
                        display: block !important;
                    }

                    .barcode-img {
                        display: block !important;
                        width: 46mm !important;
                        height: 14mm !important;
                        image-rendering: crisp-edges;
                    }
                }
            `}</style>
        </div>
    );
}
