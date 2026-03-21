'use client';

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  completedSaleData: any;
  onDone: () => void;
}

export default function ReceiptDownloader({ completedSaleData, onDone }: Props) {
  const generateReceiptPDF = () => {
    if (!completedSaleData) return;

    const doc = new jsPDF({ format: 'a5' });
    
    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Yenpoobi', 74, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Sales Receipt', 74, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Date: ${completedSaleData.date}`, 14, 45);
    doc.text(`Payment: ${completedSaleData.paymentMethod.toUpperCase()}`, 14, 52);

    // Items Table
    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows = completedSaleData.items.map((item: any) => [
      item.product.name,
      item.quantity.toString(),
      `GH₵ ${item.product.price.toFixed(2)}`,
      `GH₵ ${(item.quantity * item.product.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      margin: { top: 60 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 60;
    
    // Summary
    const summaryXLabel = 95;
    const summaryXValue = 134;

    doc.setFontSize(10);
    doc.text('Subtotal:', summaryXLabel, finalY + 10);
    doc.text(`GH₵ ${completedSaleData.subtotal.toFixed(2)}`, summaryXValue, finalY + 10, { align: 'right' });
    
    doc.text('Tax (12.5%):', summaryXLabel, finalY + 16);
    doc.text(`GH₵ ${completedSaleData.tax.toFixed(2)}`, summaryXValue, finalY + 16, { align: 'right' });
    
    // Draw a subtle line above total
    doc.setDrawColor(200, 200, 200);
    doc.line(summaryXLabel, finalY + 20, summaryXValue, finalY + 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', summaryXLabel, finalY + 27);
    doc.text(`GH₵ ${completedSaleData.total.toFixed(2)}`, summaryXValue, finalY + 27, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping at Yenpoobi!', 74, finalY + 45, { align: 'center' });

    doc.save('yenpoobi_receipt.pdf');
  };

  return (
    <div className="pt-4 flex flex-col gap-3">
      <button
        onClick={generateReceiptPDF}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-semibold shadow-sm"
      >
        <Download className="w-5 h-5" />
        <span>Download Receipt (PDF)</span>
      </button>
      <button
        onClick={onDone}
        className="w-full py-3 px-4 bg-secondary font-semibold hover:bg-secondary/80 border border-border rounded-lg transition-colors"
      >
        Start New Sale
      </button>
    </div>
  );
}
