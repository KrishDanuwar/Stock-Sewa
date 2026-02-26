'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import JsBarcode from 'jsbarcode';

interface LabelProps {
    name: string;
    price: number;
    barcode: string;
    mfg?: string;
}

export default function BarcodeLabel({ name, price, barcode, mfg }: LabelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imgData, setImgData] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    // Separated generator to ensure it runs AFTER mount and whenever barcode changes
    useEffect(() => {
        if (mounted && canvasRef.current && barcode) {
            try {
                // High-resolution rendering but scaled for 50x25mm
                JsBarcode(canvasRef.current, barcode, {
                    format: "CODE128",
                    width: 1.5,
                    height: 35,
                    displayValue: true,
                    fontSize: 12,
                    margin: 0,
                    background: "#ffffff"
                });
                setImgData(canvasRef.current.toDataURL("image/png"));
            } catch (err) {
                console.error("Barcode generation failed:", err);
            }
        }
    }, [mounted, barcode]);

    if (!mounted) return null;

    return createPortal(
        <div className="print-portal-root">
            <div className="label-container">
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="label-content">
                    <div className="barcode-zone">
                        {imgData ? (
                            <img src={imgData} className="barcode-img" alt="barcode" />
                        ) : (
                            <div className="barcode-placeholder">Generating Barcode...</div>
                        )}
                    </div>

                    <div className="product-name">
                        {name}
                    </div>

                    <div className="details-row">
                        <span>MRP: Rs {price.toLocaleString()}</span>
                        <span>MFG: {mfg || 'N/A'}</span>
                    </div>
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .label-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    height: 25mm;
                    width: 48mm;
                    padding: 1mm 0;
                    box-sizing: border-box;
                }
                .barcode-zone {
                    width: 48mm;
                    height: 14mm;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1mm;
                }
                .barcode-img {
                    max-width: 48mm;
                    max-height: 14mm;
                    image-rendering: auto;
                }
                .barcode-placeholder {
                    font-size: 6pt;
                    color: #666;
                }
                .product-name {
                    font-size: 8pt;
                    font-weight: 700;
                    color: #000;
                    margin: 0;
                    text-transform: uppercase;
                    text-align: center;
                    width: 48mm;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.1;
                    max-height: 18pt;
                    margin-bottom: 0.5mm;
                }
                .details-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 48mm;
                    font-size: 6pt;
                    font-weight: 700;
                    color: #000;
                    margin-top: auto;
                    padding: 0 1mm;
                    box-sizing: border-box;
                }
            `}</style>

            <style jsx global>{`
                @page {
                    size: 50mm 25mm !important;
                    margin: 0 !important;
                }
                @media print {
                    /* Nuclear isolation at the root */
                    body > *:not(.print-portal-root) {
                        display: none !important;
                    }

                    html, body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 25mm !important;
                        width: 50mm !important;
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
                        overflow: hidden !important;
                    }

                    .label-container {
                        width: 50mm !important;
                        height: 25mm !important;
                    }

                    *::before, *::after {
                        display: none !important;
                        content: none !important;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
}
