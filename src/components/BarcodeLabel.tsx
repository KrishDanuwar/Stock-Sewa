'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import JsBarcode from 'jsbarcode';

interface LabelProps {
    name: string;
    price: number;
    barcode: string;
    mfg?: string;
    batch?: string;
    shopName?: string;
}

export default function BarcodeLabel({ name, price, barcode, mfg }: LabelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imgData, setImgData] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (canvasRef.current && barcode) {
            try {
                // High-resolution rendering for thermal printers
                JsBarcode(canvasRef.current, barcode, {
                    format: "CODE128",
                    width: 3,
                    height: 80,
                    displayValue: true,
                    fontSize: 18,
                    margin: 0,
                    background: "#ffffff"
                });
                setImgData(canvasRef.current.toDataURL("image/png"));
            } catch (err) {
                console.error("Barcode generation failed:", err);
            }
        }
    }, [barcode]);

    if (!mounted) return null;

    // Render into body root for maximum isolation
    return createPortal(
        <div className="print-portal-root">
            <div className="label-container">
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="label-content">
                    <div className="mfg-text">MFG: {mfg || 'N/A'}</div>
                    {imgData ? (
                        <img src={imgData} className="barcode-img" alt="barcode" />
                    ) : (
                        <div className="barcode-placeholder">Generating...</div>
                    )}
                    <div className="mrp-text">MRP: रु {price.toLocaleString()}</div>
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
                    /* PRE-CONDITION: Hide EVERY direct child of body except our Portal */
                    body > *:not(.print-portal-root) {
                        display: none !important;
                    }

                    /* Suppress layout artifacts (sidebars, markers, mini-circles) */
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

                    .print-portal-root {
                        display: block !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 50mm !important;
                        height: 25mm !important;
                        background: white !important;
                        z-index: 2147483647 !important;
                    }

                    .label-container {
                        width: 50mm !important;
                        height: 25mm !important;
                        display: flex !important;
                    }
                    
                    .label-content * {
                        display: block !important;
                        color: #000 !important;
                    }

                    .barcode-img {
                        display: block !important;
                        width: 46mm !important;
                        height: 14mm !important;
                        image-rendering: pixelated;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
}
