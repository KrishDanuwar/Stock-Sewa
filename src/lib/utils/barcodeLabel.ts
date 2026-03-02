import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';

interface BarcodeLabelData {
    name: string;
    price: number;
    barcode: string;
    mfg?: string;
    batchNumber?: string;
}

/**
 * Generates a 50×25mm barcode label PDF and opens the print dialog.
 * Uses jsPDF directly — no browser headers, footers, URL, or branding.
 */
export function printBarcodeLabel(data: BarcodeLabelData) {
    // 50mm x 25mm label
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [50, 25],
    });

    const W = 50;

    // Generate barcode as data URL via a temporary canvas
    const canvas = document.createElement('canvas');
    try {
        JsBarcode(canvas, data.barcode, {
            format: 'CODE128',
            width: 1.5,
            height: 40,
            displayValue: true,
            fontSize: 14,
            margin: 0,
            background: '#ffffff',
            textMargin: 1,
        });
    } catch (err) {
        console.error('Barcode generation failed:', err);
        return;
    }
    const barcodeDataUrl = canvas.toDataURL('image/png');

    // --- Layout (all measurements in mm) ---

    // 1. Product name at top (centered, truncated)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    let displayName = data.name.toUpperCase();
    // Truncate if too long for 48mm width
    const maxNameWidth = W - 4;
    while (doc.getTextWidth(displayName) > maxNameWidth && displayName.length > 3) {
        displayName = displayName.slice(0, -1);
    }
    if (displayName !== data.name.toUpperCase()) displayName += '…';
    doc.text(displayName, W / 2, 4, { align: 'center' });

    // 2. Barcode image in center
    const barcodeW = 40;
    const barcodeH = 11;
    const barcodeX = (W - barcodeW) / 2;
    const barcodeY = 5.5;
    doc.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, barcodeW, barcodeH);

    // 3. Bottom row: MRP left, MFG/Batch right
    const bottomY = 19.5;

    // MRP — normal weight
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`MRP: Rs.${data.price.toLocaleString()}`, 1.5, bottomY);

    // MFG & Batch — bold, right-aligned
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);

    const hasMfg = data.mfg && data.mfg.trim() !== '' && data.mfg !== 'N/A';
    const hasBatch = data.batchNumber && data.batchNumber.trim() !== '';

    if (hasMfg && hasBatch) {
        doc.text(`MFG: ${data.mfg}`, W - 1.5, bottomY - 2, { align: 'right' });
        doc.text(`B/N: ${data.batchNumber}`, W - 1.5, bottomY + 0.5, { align: 'right' });
    } else if (hasMfg) {
        doc.text(`MFG: ${data.mfg}`, W - 1.5, bottomY, { align: 'right' });
    } else if (hasBatch) {
        doc.text(`B/N: ${data.batchNumber}`, W - 1.5, bottomY, { align: 'right' });
    }

    // Trigger print via iframe (no browser chrome)
    doc.autoPrint();
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.visibility = 'hidden';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.src = url;
    document.body.appendChild(iframe);

    setTimeout(() => {
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
        URL.revokeObjectURL(url);
    }, 60000);
}
