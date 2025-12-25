import { CustomerInvoiceType } from "@/types/customer";
import { format } from "date-fns";
import jsPDF from "jspdf";

export function generateInvoicePdf(
  invoice: CustomerInvoiceType,
  labourCharges: number,
  totalCost: number
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 40;
  let y = 40;

  // TITLE
  doc.setFont("Times New Roman", "bold", 900);
  doc.setFontSize(22);
  doc.text("AUTO MATRIX - INVOICE", 300, y, { align: "center" });

  y += 40;

  // Invoice Metadata Box
  doc.setFontSize(12);
  doc.setDrawColor(180);
  doc.roundedRect(left, y, 520, 80, 6, 6);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, left + 10, y + 20);
  doc.text(
    `Date: ${format(new Date(invoice.billingDate), "dd MMM yyyy")}`,
    left + 10,
    y + 40
  );
  doc.text(`Status: ${invoice.status}`, left + 10, y + 60);

  y += 110;

  // TWO COLUMN: SERVICE CENTER + CUSTOMER
  doc.roundedRect(left, y, 250, 100, 6, 6);
  doc.text("Service Center", left + 10, y + 20);
  doc.setFontSize(11);
  doc.text(invoice.appointment.serviceCenter.name, left + 10, y + 40);
  doc.text(invoice.appointment.serviceCenter.email, left + 10, y + 55);
  doc.text(invoice.appointment.serviceCenter.phoneNumber, left + 10, y + 70);

  doc.setFontSize(12);

  doc.roundedRect(left + 270, y, 250, 100, 6, 6);
  doc.text("Customer / Vehicle", left + 280, y + 20);
  doc.setFontSize(11);
  doc.text(invoice.appointment.Vehicle.vehicleName, left + 280, y + 40);
  doc.text(
    `${invoice.appointment.Vehicle.vehicleMake} ${invoice.appointment.Vehicle.vehicleModel}`,
    left + 280,
    y + 55
  );
  doc.text(`Service: ${invoice.appointment.serviceType}`, left + 280, y + 70);

  y += 130;

  // SERVICE DETAILS TABLE
  doc.setFontSize(14);
  doc.setFont("Times New Roman", "bold", "800");
  doc.text("Services", left, y);
  y += 10;

  doc.setFontSize(11);
  doc.setDrawColor(200);
  doc.line(left, y, 560, y);
  y += 15;
  doc.setFont("Roboto", "normal");
  invoice.appointment.JobCards.forEach((jobCard, idx) => {
    doc.text(`${idx + 1}. ${jobCard.jobName}`, left, y);
    doc.text(`₹${jobCard.price}`, 520, y, { align: "right" });
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(jobCard.jobDescription || "No description", left + 10, y);
    doc.setTextColor(0);
    y += 15;

    // Parts Table
    if (jobCard.JobCardParts.length > 0) {
      doc.setFontSize(10);
      jobCard.JobCardParts.forEach((p) => {
        doc.text(`• ${p.partUsed.name} (x${p.quantity})`, left + 20, y);
        doc.text(`₹${(p.partUsed.unitPrice * p.quantity).toFixed(2)}`, 520, y, {
          align: "right",
        });
        y += 15;
      });
    } else {
      doc.text("• No parts used", left + 20, y);
      y += 15;
    }

    y += 10;
  });

  // Totals Box
  y += 20;
  doc.setFontSize(14);
  doc.text("Summary", left, y);
  y += 15;

  doc.roundedRect(left, y, 520, 100, 6, 6);
  y += 25;

  doc.setFontSize(12);
  doc.text(`Labour Charges:`, left + 10, y);
  doc.text(`₹${labourCharges.toFixed(2)}`, 510, y, { align: "right" });
  y += 25;

  doc.text(`Parts Total:`, left + 10, y);
  const partsTotal = totalCost - labourCharges;
  doc.text(`₹${partsTotal.toFixed(2)}`, 510, y, { align: "right" });
  y += 25;

  doc.setFontSize(14);
  doc.text(`Grand Total:`, left + 10, y);
  doc.text(`₹${totalCost.toFixed(2)}`, 510, y, { align: "right" });

  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}
