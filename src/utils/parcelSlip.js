import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import moment from "moment";

/**
 * Parcel slip design requirements:
 * - Company name with logo
 * - Courier name
 * - White and black design (easy for print)
 * - Client address
 * - Estimate delivery time
 * - QR code (redirects to parcel tracking page, shows status when scanned)
 * - Barcode (for inventory: when merchants scan, deduct stock, store history)
 * - Company terms shortly
 */
export const generateParcelSlip = async (order, options = {}) => {
  if (!order) {
    throw new Error("Order data is required");
  }

  const trackingId = order.shippingTrackingId || `SC-${order.id}`;
  // Company domain from API (auth/me): customDomain, subdomain, or env fallback
  let trackingUrl = "";
  if (options.isCustomReceiptUrl) {
    trackingUrl = options.trackingPageBase;
  } else {
    const trackingPageBase = options.trackingPageBase || window.location.origin;
    trackingUrl = `${trackingPageBase.replace(/\/$/, "")}/track-order?trackingId=${encodeURIComponent(trackingId)}`;
  }

  const companyName = options.companyName || "SquadCart";
  const companyLogo = options.companyLogo || null;
  const courierName = order.shippingProvider || "SquadCart";
  const clientName = order.customer?.name || order.customerName || "N/A";
  const clientAddress = order.customerAddress || "N/A";
  const clientPhone = order.customerPhone || order.customer?.phone || "";

  // Estimate delivery: INSIDEDHAKA 2-3 days, OUTSIDEDHAKA 4-5 days from ship date
  const shipDate = order.updatedAt || order.createdAt || new Date();
  const daysToAdd = (order.deliveryType || "INSIDEDHAKA") === "INSIDEDHAKA" ? 3 : 5;
  const estimatedDelivery = moment(shipDate).add(daysToAdd, "days").format("DD MMM YYYY");

  const companyTerms =
    options.companyTerms ||
    "The sender acknowledges that this parcel may be carried by air and will be subject to security procedures. The sender declares that the parcel does not contain any dangerous or prohibited goods. A false declaration is a criminal offence.";

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(trackingUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 80,
    color: { dark: "#000000", light: "#ffffff" },
  });

  // Generate barcode as data URL (using canvas)
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, trackingId, {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: true,
    fontSize: 10,
    margin: 2,
    lineColor: "#000000",
    background: "#ffffff",
  });
  const barcodeDataUrl = canvas.toDataURL("image/png");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a6",
  });

  const w = doc.internal.pageSize.getWidth();

  // Layout metrics
  const margin = 7; // inner content margin for nicer breathing room
  let y = margin + 12; // will be reset after header

  // Black and white design for easy printing
  const black = "#000000";
  const white = "#ffffff";

  const headerHeight = 28;
  const headerTop = 0;
  const headerLeft = 0;
  const headerWidth = w;

  doc.setFillColor(white);
  doc.rect(headerLeft, headerTop, headerWidth, headerHeight, "F");
  
  // Top thick border
  doc.setLineWidth(1.5);
  doc.setDrawColor(0);
  doc.line(0, 1, w, 1);

  if (companyLogo) {
    try {
      doc.addImage(companyLogo, "PNG", headerLeft + margin, headerTop + 5, 18, 18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(black);
      doc.text(companyName, headerLeft + margin + 22, headerTop + 14);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(black);
      doc.text(companyName, headerLeft + margin, headerTop + 14);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(black);
    doc.text(companyName, headerLeft + margin, headerTop + 14);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Courier: ${courierName}`, headerLeft + (companyLogo ? margin + 22 : margin), headerTop + 20);

  // QR code in header, right aligned
  const qrSize = 18;
  const qrX = headerLeft + headerWidth - qrSize - margin;
  const qrY = headerTop + 4;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  doc.setFontSize(6);
  doc.text("SCAN TO TRACK", qrX + qrSize / 2, qrY + qrSize + 3, { align: "center" });

  doc.setLineWidth(0.3);
  doc.line(margin, headerHeight, w - margin, headerHeight);

  y = headerHeight + 6;

  // DELIVER TO BOX
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("DELIVER TO:", margin, y);
  y += 6;

  const addressBoxLeft = margin;
  const addressBoxWidth = w - margin * 2;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(clientName, addressBoxLeft + 2, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const addrLines = doc.splitTextToSize(clientAddress, addressBoxWidth - 4);
  addrLines.forEach((line) => {
    doc.text(line, addressBoxLeft + 2, y);
    y += 4;
  });
  if (clientPhone) {
    doc.setFont("helvetica", "bold");
    doc.text(`Phone: ${clientPhone}`, addressBoxLeft + 2, y);
    y += 5;
  }
  
  // Delivery info box
  y += 2;
  doc.setLineWidth(0.3);
  doc.rect(margin, y, w - margin * 2, 14);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ESTIMATED DELIVERY:", margin + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(estimatedDelivery, margin + 40, y + 5);

  doc.setFont("helvetica", "bold");
  doc.text("DELIVERY TYPE:", margin + 3, y + 10);
  doc.setFont("helvetica", "normal");
  doc.text(order.deliveryType || "Standard", margin + 40, y + 10);

  y += 20;

  // Barcode
  const barcodeWidth = w - margin * 2;
  const barcodeHeight = 20;
  doc.addImage(barcodeDataUrl, "PNG", margin, y, barcodeWidth, barcodeHeight);
  y += barcodeHeight + 4;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`TRACKING ID: ${trackingId}`, w / 2, y, { align: "center" });
  y += 8;

  // Divider
  doc.setLineWidth(0.5);
  doc.line(margin, y, w - margin, y);
  y += 4;

  // Company terms (short)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100);
  const termsLines = doc.splitTextToSize(companyTerms, w - margin * 2);
  termsLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 2.5;
  });
  doc.setTextColor(0);

  const fileName = `Parcel_Slip_${trackingId}_${moment().format("YYYYMMDD")}.pdf`;
  doc.save(fileName);
};
