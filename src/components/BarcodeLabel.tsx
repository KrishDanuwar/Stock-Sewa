'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import JsBarcode from 'jsbarcode';

interface LabelProps {
    name: string;
    price: number;
    barcode: string;
    mfg?: string;
    batchNumber?: string;
}

export default function BarcodeLabel({ name, price, barcode, mfg, batchNumber }: LabelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imgData, setImgData] = useState<string>('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (mounted && canvasRef.current && barcode) {
            try {
                JsBarcode(canvasRef.current, barcode, {
                    format: "CODE128",
                    width: 1,
                    height: 22,
                    displayValue: true,
                    fontSize: 8,
                    margin: 0,
                    background: "#ffffff",
                    textMargin: 0
                });
                setImgData(canvasRef.current.toDataURL("image/png"));
            } catch (err) {
                console.error("Barcode generation failed:", err);
            }
        }
    }, [mounted, barcode]);

    if (!mounted) return null;

    const hasMfg = mfg && mfg !== 'N/A' && mfg.trim() !== '';
    const hasBatch = batchNumber && batchNumber.trim() !== '';

    return createPortal(
        <div className="print-portal-root">
            <div className="label-container">
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="label-content">
                    {/* Product Name */}
                    <div className="product-name">{name}</div>

                    {/* Barcode */}
                    <div className="barcode-zone">
                        {imgData ? (
                            <img src={imgData} className="barcode-img" alt="barcode" />
                        ) : (
                            <div className="barcode-placeholder">...</div>
                        )}
                    </div>

                    {/* Bottom row */}
                    <div className="details-row">
                        <span className="mrp-text">MRP: Rs.{price.toLocaleString()}</span>
                        <div className="meta-col">
                            {hasMfg && <span className="meta-highlight">MFG: {mfg}</span>}
                            {hasBatch && <span className="meta-highlight">B/N: {batchNumber}</span>}
                        </div>
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
                    padding: 0;
                    margin: 0;
                }
                .label-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    height: 24mm;
                    width: 48mm;
                    padding: 0.5mm 0;
                    box-sizing: border-box;
                }
                .product-name {
                    font-size: 6pt;
                    font-weight: 600;
                    color: #000;
                    text-transform: uppercase;
                    text-align: center;
                    width: 48mm;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.1;
                    letter-spacing: 0.2pt;
                }
                .barcode-zone {
                    width: 44mm;
                    height: 10mm;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0.3mm 0;
                }
                .barcode-img {
                    max-width: 44mm;
                    max-height: 10mm;
                    image-rendering: auto;
                }
                .barcode-placeholder {
                    font-size: 5pt;
                    color: #999;
                }
                .details-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    width: 48mm;
                    padding: 0 0.5mm;
                    box-sizing: border-box;
                    line-height: 1.15;
                }
                .mrp-text {
                    font-size: 5.5pt;
                    font-weight: 400;
                    color: #222;
                    white-space: nowrap;
                }
                .meta-col {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0;
                }
                .meta-highlight {
                    font-size: 5.5pt;
                    font-weight: 800;
                    color: #000;
                    line-height: 1.15;
                }
            `}</style>

            <style jsx global>{`
                @page {
                    size: 50mm 25mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                @media print {
                    body > *:not(.print-portal-root) {
                        display: none !important;
                    }
                    html, body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 50mm !important;
                        height: 25mm !important;
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
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .label-container {
                        width: 50mm !important;
                        height: 25mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
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
