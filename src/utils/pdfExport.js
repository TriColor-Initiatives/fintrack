// PDF Export utility using jsPDF
import { jsPDF } from 'jspdf';

const loadImageAsDataURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

export const exportInvoiceToPDF = async (invoice) => {
  const doc = new jsPDF();
  let yPosition = 20;
  const currencySymbol = invoice.currencySymbol || '$';
  
  // Helper function to add multi-line text
  const addMultiLineText = (text, x, y, maxWidth, align = 'left') => {
    if (!text) return y;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, { align });
    return y + (lines.length * 7);
  };

  // Header Section - Company Logo and Info
  if (invoice.companyLogo) {
    try {
      const logoData = await loadImageAsDataURL(invoice.companyLogo);
      // Add image - adjust size as needed (max width 40mm, max height 20mm)
      doc.addImage(logoData, 'PNG', 20, yPosition, 40, 20);
      yPosition += 25;
    } catch (error) {
      console.log('Could not load logo image:', error);
      // If logo fails to load, just skip it
    }
  }

  if (invoice.companyName) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text(invoice.companyName, 20, yPosition);
    yPosition += 8;
  }

  if (invoice.companyDescription) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(127, 140, 141);
    yPosition = addMultiLineText(invoice.companyDescription, 20, yPosition, 170);
    yPosition += 5;
  }

  // INVOICE Title (top right)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text('INVOICE', 190, 20, { align: 'right' });

  // Top divider line
  yPosition = Math.max(yPosition, 35);
  doc.setLineWidth(0.5);
  doc.setDrawColor(44, 62, 80);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;

  // Top Left and Top Right sections
  const topSectionY = yPosition;
  
  // Top Left
  if (invoice.topLeft) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);
    addMultiLineText(invoice.topLeft, 20, topSectionY, 80);
  }

  // Top Right
  if (invoice.topRight) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);
    addMultiLineText(invoice.topRight, 190, topSectionY, 80, 'right');
  }

  yPosition = topSectionY + 25;

  // Invoice Number and Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(127, 140, 141);
  doc.text('INVOICE NUMBER:', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(44, 62, 80);
  doc.text(invoice.invoiceNumber, 70, yPosition);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(127, 140, 141);
  doc.text('DATE:', 140, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(44, 62, 80);
  doc.text(invoice.date, 160, yPosition);

  yPosition += 10;

  // Bill To section
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(127, 140, 141);
  doc.text('BILL TO:', 20, yPosition);
  yPosition += 7;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text(invoice.client, 20, yPosition);
  yPosition += 12;

  // Line Items Table
  doc.setFontSize(10);
  
  // Table header
  const tableTop = yPosition;
  const colX = {
    description: 20,
    quantity: 120,
    rate: 150,
    amount: 180
  };

  // Header background
  doc.setFillColor(248, 249, 250);
  doc.rect(20, tableTop, 170, 8, 'F');

  // Header text
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text('Description', colX.description, tableTop + 6);
  doc.text('Qty', colX.quantity, tableTop + 6, { align: 'center' });
  doc.text('Rate', colX.rate, tableTop + 6, { align: 'right' });
  doc.text('Amount', colX.amount, tableTop + 6, { align: 'right' });

  // Header bottom line
  doc.setLineWidth(0.5);
  doc.setDrawColor(44, 62, 80);
  doc.line(20, tableTop + 8, 190, tableTop + 8);

  yPosition = tableTop + 15;

  // Line items
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 73, 94);
  
  invoice.lineItems.forEach((item, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Description (may wrap)
    const descLines = doc.splitTextToSize(item.description, 95);
    doc.text(descLines, colX.description, yPosition);
    
    // Quantity, Rate, Amount
    doc.text(String(item.quantity), colX.quantity, yPosition, { align: 'center' });
    doc.text(`${currencySymbol}${parseFloat(item.rate).toFixed(2)}`, colX.rate, yPosition, { align: 'right' });
    doc.text(`${currencySymbol}${parseFloat(item.amount).toFixed(2)}`, colX.amount, yPosition, { align: 'right' });

    const lineHeight = descLines.length * 5 + 2;
    yPosition += lineHeight;

    // Line between items
    doc.setLineWidth(0.1);
    doc.setDrawColor(236, 240, 241);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;
  });

  yPosition += 5;

  // Totals section
  const totalsX = 140;
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  doc.setTextColor(44, 62, 80);
  doc.text('Subtotal:', totalsX, yPosition);
  doc.text(`${currencySymbol}${parseFloat(invoice.subtotal).toFixed(2)}`, 185, yPosition, { align: 'right' });
  yPosition += 7;

  // Tax (if applicable)
  if (invoice.taxPercentage > 0) {
    doc.setTextColor(127, 140, 141);
    doc.text(`${invoice.taxName} (${invoice.taxPercentage}%):`, totalsX, yPosition);
    doc.text(`${currencySymbol}${parseFloat(invoice.taxAmount).toFixed(2)}`, 185, yPosition, { align: 'right' });
    yPosition += 7;
  }

  // Total line
  doc.setLineWidth(0.5);
  doc.setDrawColor(44, 62, 80);
  doc.line(totalsX, yPosition, 190, yPosition);
  yPosition += 8;

  // Total amount
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(39, 174, 96);
  doc.text('Total:', totalsX, yPosition);
  doc.text(`${currencySymbol}${parseFloat(invoice.total).toFixed(2)}`, 185, yPosition, { align: 'right' });
  
  yPosition += 15;

  // Bottom sections
  const bottomSectionY = Math.max(yPosition, 240);
  
  // Bottom divider line
  doc.setLineWidth(0.3);
  doc.setDrawColor(236, 240, 241);
  doc.line(20, bottomSectionY, 190, bottomSectionY);
  
  let finalY = bottomSectionY + 8;

  // Bottom Left and Bottom Right
  if (invoice.bottomLeft || invoice.bottomRight) {
    // Bottom Left
    if (invoice.bottomLeft) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(127, 140, 141);
      addMultiLineText(invoice.bottomLeft, 20, finalY, 80);
    }

    // Bottom Right
    if (invoice.bottomRight) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(127, 140, 141);
      addMultiLineText(invoice.bottomRight, 190, finalY, 80, 'right');
    }

    finalY += 20;
  }

  // Bottom Center Message
  if (invoice.bottomCenter) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(127, 140, 141);
    doc.text(invoice.bottomCenter, 105, 280, { align: 'center' });
  }

  // Save the PDF
  const fileName = `${invoice.invoiceNumber}_${invoice.client.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};
