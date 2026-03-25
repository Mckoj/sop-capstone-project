'use client';

import { Download, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

interface Props {
  completedSaleData: any;
  onDone: () => void;
}

export default function ReceiptDownloader({ completedSaleData, onDone }: Props) {
  const generateReceiptPDF = async (action: 'download' | 'preview') => {
    if (!completedSaleData) return;

    const doc = new jsPDF({ format: 'a5' });
    const isCash = completedSaleData.paymentMethod === 'cash';

    // Header styling
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // Blue primary color
    doc.text('Yenpoobi', 14, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    // Using black for detail text
    doc.setTextColor(0, 0, 0);
    doc.text('Supermarket & Store', 14, 31);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20); // slightly softer black
    doc.text('RECEIPT', 134, 25, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const dateText = completedSaleData.date || new Date().toLocaleString();
    doc.text(`Date: ${dateText}`, 134, 31, { align: 'right' });

    // Separator line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 134, 38);

    // Sale Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Method:', 14, 46);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const paymentMethod = typeof completedSaleData.paymentMethod === 'string'
      ? completedSaleData.paymentMethod.toUpperCase()
      : 'CASH';
    doc.text(paymentMethod, 14, 51);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Status:', 74, 46);
    doc.setFont('helvetica', 'bold');
    if (isCash) {
      doc.setTextColor(34, 197, 94); // Green 500
    } else {
      doc.setTextColor(234, 179, 8); // Yellow 500 for pending
    }
    doc.text(isCash ? 'PAID' : 'PENDING PAYMENT', 74, 51);

    // Items Table
    const headRow = [
      { content: "Item Description", styles: { halign: 'left' as const } },
      { content: "Qty", styles: { halign: 'center' as const } },
      { content: "Unit Price", styles: { halign: 'right' as const } },
      { content: "Total", styles: { halign: 'right' as const } }
    ];
    const tableRows = completedSaleData.items.map((item: any) => [
      item.product.name,
      item.quantity.toString(),
      `GH¢ ${item.product.price.toFixed(2)}`,
      `GH¢ ${(item.quantity * item.product.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 58,
      head: [headRow],
      body: tableRows,
      theme: 'grid',
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.3
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 10,
        cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8 || 80;

    // Summary block
    const pageWidth = doc.internal.pageSize.getWidth();
    const summaryXValue = pageWidth - 14; // Matches exactly the right margin of 14
    const summaryXLabel = summaryXValue - 25; // Keep label completely relative to the value

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Subtotal
    doc.setTextColor(0, 0, 0);
    doc.text('Subtotal:', summaryXLabel, finalY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.text(`GH¢ ${(completedSaleData.subtotal || 0).toFixed(2)}`, summaryXValue, finalY, { align: 'right' });

    // Tax
    doc.setTextColor(0, 0, 0);
    doc.text('Tax (12.5%):', summaryXLabel, finalY + 6, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.text(`GH¢ ${(completedSaleData.tax || 0).toFixed(2)}`, summaryXValue, finalY + 6, { align: 'right' });

    // Separator before Total
    doc.setDrawColor(220, 220, 220);
    doc.line(summaryXLabel - 25, finalY + 9, summaryXValue, finalY + 9);

    // Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Total:', summaryXLabel, finalY + 16, { align: 'right' });
    doc.setTextColor(37, 99, 235); // Blue for total amount
    doc.text(`GH¢ ${(completedSaleData.total || 0).toFixed(2)}`, summaryXValue, finalY + 16, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // Footer & QR Code
    let footerY = finalY + 30;

    if (!isCash && completedSaleData.paystackUrl) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Scan to Pay', 74, footerY, { align: 'center' });

      try {
        const qrDataUrl = await QRCode.toDataURL(completedSaleData.paystackUrl, {
          width: 150,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        doc.addImage(qrDataUrl, 'PNG', 49, footerY + 4, 50, 50);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(37, 99, 235);
        doc.text(completedSaleData.paystackUrl, 74, footerY + 58, {
          align: 'center',
          maxWidth: 120,
        });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('Pay with MoMo, Card or Bank', 74, footerY + 65, { align: 'center' });

        footerY += 75;
      } catch (err) {
        console.error('QR generation failed:', err);
        footerY += 5;
      }
    }

    // Thank you message at the bottom
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bolditalic');
    doc.setTextColor(0, 0, 0);
    doc.text('Thank you for shopping at Yenpoobi!', 74, footerY + 5, { align: 'center' });

    if (action === 'preview') {
      window.open(doc.output('bloburl'), '_blank');
    } else {
      const dateStr = new Date().toLocaleString().replace(/[\/:]/g, '-').replace(/,/g, '').replace(/\s/g, '_');
      doc.save(`Yenpoobi_Receipt_${dateStr}.pdf`);
    }
  };

  return (
    <div className="pt-4 flex flex-col gap-3">
      <div className="flex gap-2 w-full">
        <button
          onClick={() => generateReceiptPDF('preview')}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm border border-border"
        >
          <Eye className="w-5 h-5" />
          <span>Preview</span>
        </button>
        <button
          onClick={() => generateReceiptPDF('download')}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
        >
          <Download className="w-5 h-5" />
          <span>Download</span>
        </button>
      </div>
      <button
        onClick={onDone}
        className="w-full py-3 px-4 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 border-2 border-transparent rounded-lg transition-colors mt-2"
      >
        Start New Sale
      </button>
    </div>
  );
}