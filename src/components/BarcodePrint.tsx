'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { printProductLabel } from '@/utils/print-utils';

interface BarcodePrintProps {
    value: string;
    name: string;
    price: number;
    onPrint?: () => void;
}

export default function BarcodePrint({ value, name, price, onPrint }: BarcodePrintProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && value) {
            try {
                JsBarcode(canvasRef.current, value, {
                    format: 'EAN13',
                    width: 2,
                    height: 40,
                    displayValue: true,
                    fontSize: 14,
                    margin: 0,
                });
            } catch (e) {
                // If not valid EAN13, fallback to CODE128
                JsBarcode(canvasRef.current, value, {
                    format: 'CODE128',
                    width: 2,
                    height: 40,
                    displayValue: true,
                    fontSize: 14,
                    margin: 0,
                });
            }
        }
    }, [value]);

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            printProductLabel(name, value, price);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-surface-200 shadow-sm group">
            <canvas ref={canvasRef} className="max-w-full h-auto"></canvas>
            <button
                onClick={handlePrint}
                className="mt-2 text-xs font-bold text-brand-primary hover:text-brand-primary/80 underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                Print Thermal Label
            </button>
        </div>
    );
}
