import { CustomerInvoiceType } from "@/types/customer";
import { format } from "date-fns";
import jsPDF from "jspdf";

export function generateInvoicePdf(
  invoice: CustomerInvoiceType,
  labourCharges: number,
  totalCost: number
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const left = 40;
  const right = pageWidth - 40;
  let y = 60;

  // ================= HEADER =================
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 50, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("AUTO MATRIX", pageWidth / 2, 30, { align: "center" });

  doc.setFontSize(14);
  doc.text("SERVICE INVOICE", pageWidth / 2, 45, { align: "center" });

  doc.setTextColor(0, 0, 0);
  y = 80;

  // ================= INVOICE DETAILS =================
  doc.roundedRect(left, y, right - left, 70, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Invoice Details", left + 10, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, left + 10, y + 35);
  doc.text(
    `Issue Date: ${format(new Date(invoice.billingDate), "dd/MM/yyyy")}`,
    left + 10,
    y + 50
  );
  doc.text(
    `Due Date: ${format(new Date(invoice.dueDate), "dd/MM/yyyy")}`,
    left + 10,
    y + 65
  );

  // Status badge
  const statusX = right - 90;
  doc.setFillColor(invoice.status === "PAID" ? 46 : 231, invoice.status === "PAID" ? 204 : 76, invoice.status === "PAID" ? 113 : 60);
  doc.roundedRect(statusX, y + 25, 70, 20, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(invoice.status, statusX + 35, y + 38, { align: "center" });
  doc.setTextColor(0, 0, 0);

  y += 100;

  // ================= SERVICE CENTER / VEHICLE =================
  const boxWidth = (right - left - 20) / 2;

  doc.roundedRect(left, y, boxWidth, 80, 3, 3, "S");
  doc.setFont("helvetica", "bold");
  doc.text("Service Center", left + 10, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoice.appointment.serviceCenter.name, left + 10, y + 30);
  doc.text(invoice.appointment.serviceCenter.email, left + 10, y + 45);
  doc.text(`Phone: ${invoice.appointment.serviceCenter.phoneNumber}`, left + 10, y + 60);

  doc.roundedRect(left + boxWidth + 20, y, boxWidth, 80, 3, 3, "S");
  doc.setFont("helvetica", "bold");
  doc.text("Customer & Vehicle", left + boxWidth + 30, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Vehicle: ${invoice.appointment.Vehicle.vehicleName}`, left + boxWidth + 30, y + 30);
  doc.text(
    `${invoice.appointment.Vehicle.vehicleMake} ${invoice.appointment.Vehicle.vehicleModel}`,
    left + boxWidth + 30,
    y + 45
  );
  doc.text(`Service: ${invoice.appointment.serviceType}`, left + boxWidth + 30, y + 60);

  y += 110;

  // ================= TABLE COLUMNS =================
  const col = {
    description: left + 10,
    qty: right - 170,
    rate: right - 110,
    amount: right - 20,
  };

  // ================= TABLE HEADER =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Parts Used", left, y);
  y += 20;

  doc.setFillColor(240, 240, 240);
  doc.rect(left, y - 5, right - left, 20, "F");
  doc.rect(left, y - 5, right - left, 20, "S");

  doc.setFontSize(9);
  doc.text("Description", col.description, y + 8);
  doc.text("Qty", col.qty, y + 8, { align: "right" });
  doc.text("Rate", col.rate, y + 8, { align: "right" });
  doc.text("Amount", col.amount, y + 8, { align: "right" });

  y += 25;

  // ================= PARTS ROWS =================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  let partsTotal = 0;

  invoice.appointment.JobCards.forEach((jobCard) => {
    jobCard.JobCardParts
      .filter((part) => part.quantity > 0)
      .forEach((part) => {
        if (y > pageHeight - 120) {
          doc.addPage();
          y = 60;
        }

        const amount = part.partUsed.unitPrice * part.quantity;
        partsTotal += amount;

        doc.text(`• ${part.partUsed.name}`, col.description, y);
        doc.text(String(part.quantity), col.qty, y, { align: "right" });
        doc.text(`Rs. ${part.partUsed.unitPrice.toFixed(2)}`, col.rate, y, { align: "right" });
        doc.text(`Rs. ${amount.toFixed(2)}`, col.amount, y, { align: "right" });

        y += 14;
      });
  });

  // ================= SUMMARY =================
  y += 20;

  const summaryX = right - 200;
  const summaryWidth = 160;
  const labelX = summaryX + 10;
  const valueX = summaryX + summaryWidth - 10;

  doc.roundedRect(summaryX, y, summaryWidth, 80, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Invoice Summary", labelX, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Labour Charges:", labelX, y + 35);
  doc.text(`Rs. ${labourCharges.toFixed(2)}`, valueX, y + 35, { align: "right" });

  doc.text("Parts Total:", labelX, y + 50);
  doc.text(`Rs. ${partsTotal.toFixed(2)}`, valueX, y + 50, { align: "right" });

  doc.line(labelX, y + 60, valueX, y + 60);

  doc.setFont("helvetica", "bold");
  doc.text("Grand Total:", labelX, y + 75);
  doc.text(`Rs. ${totalCost.toFixed(2)}`, valueX, y + 75, { align: "right" });

  // ================= FOOTER =================
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    "Thank you for choosing Auto Matrix.",
    pageWidth / 2,
    pageHeight - 40,
    { align: "center" }
  );

  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}
