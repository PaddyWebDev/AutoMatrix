"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Download, Eye } from "lucide-react";
import { CustomerInvoiceType } from "@/types/customer";
import { format } from "date-fns";
import { generateInvoicePdf } from "@/hooks/invoice";





interface InvoiceModalProps {
  invoice: CustomerInvoiceType;
}

export default function InvoiceModal({ invoice }: InvoiceModalProps) {



  // Calculate total cost and labor charges (replicating logic from service center appointments page)
  const totalCost = invoice.appointment.JobCards.reduce(
    (sum, job) => sum + (job.price || 0), 0
  );

  let labourCharges = 0;

  invoice.appointment.JobCards.forEach(jobCard => {
    const partsCost = jobCard.JobCardParts.reduce(
      (sum, part) => sum + part.quantity * part.partUsed.unitPrice, 0
    );
    labourCharges += jobCard.price - partsCost;
  });

  const generatePDF = () => {
    generateInvoicePdf(invoice, labourCharges, totalCost);
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-none md:w-[60dvw] w-[90dvw] max-h-[80vh] overflow-y-auto" style={{
        maxWidth: "none"
      }}>
        <DialogHeader>
          <DialogTitle>Invoice Details - #{invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Invoice Header */}
          <Card className="dark:bg-neutral-800 bg-neutral-100">
            <CardHeader>
              <CardTitle className="text-center">Invoice #{invoice.invoiceNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex md:flex-row flex-col md:justify-between gap-3">
                <div>
                  <Label>Service Center</Label>
                  <p className="font-semibold">{invoice.appointment.serviceCenter.name}</p>
                  <p>{invoice.appointment.serviceCenter.email}</p>
                  <p>{invoice.appointment.serviceCenter.phoneNumber}</p>
                </div>
                <div>
                  <Label>Customer</Label>
                  <p className="font-semibold">Vehicle: {invoice.appointment.Vehicle.vehicleName}</p>
                  <p>{invoice.appointment.Vehicle.vehicleMake} {invoice.appointment.Vehicle.vehicleModel}</p>
                  <p>Service Type: {invoice.appointment.serviceType}</p>
                </div>
              </div>
              <Separator />
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Invoice Date</Label>
                  <p>{format(new Date(invoice.billingDate), "dd MMM yyyy, hh:mm a")}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={invoice.status === "PAID" ? "default" : "destructive"}>
                    {invoice.status === "SENT" ? "NOT_PAID" : invoice.status}
                  </Badge>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p className="font-bold">₹{invoice.totalAmount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Cards Details */}
          <Card className="dark:bg-neutral-800 bg-neutral-100">
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.appointment.JobCards.map((jobCard, index) => (
                <div key={index} className="border rounded p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{jobCard.jobName}</h3>
                      <p className="text-sm text-gray-600">{jobCard.jobDescription}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹ {jobCard.price}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Parts Used:</h4>
                    {jobCard.JobCardParts?.length === 0 ? (
                      <p className="text-xs text-gray-500">No parts added</p>
                    ) : (
                      <div className="space-y-1">
                        {jobCard.JobCardParts.map((part, index: number) => (
                          <div key={index} className="text-xs flex justify-between">
                            <span>{part.partUsed.name} (x{part.quantity})</span>
                            <span>₹ {(part.partUsed.unitPrice * part.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Labour Charges:</span>
                <span>₹ {labourCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl">
                <span>Total Amount:</span>
                <span>₹ {totalCost.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          {invoice.appointment?.Payment && (
            <Card className="dark:bg-neutral-800 bg-neutral-100">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Method</Label>
                    <p>{invoice.appointment?.Payment.method}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={invoice.appointment?.Payment.status === "SUCCESS" ? "default" : "destructive"}>
                      {invoice.appointment.Payment.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Amount Paid</Label>
                    <p>₹{invoice.appointment.Payment.amount}</p>
                  </div>
                  <div>
                    <Label>Paid At</Label>
                    <p>{invoice.appointment.Payment.paidAt ? format(new Date(invoice.appointment.Payment.paidAt), "dd MMM yyyy, hh:mm a") : "N/A"}</p>
                  </div>
                </div>
                {invoice.appointment.Payment.transactionId && (
                  <div>
                    <Label>Transaction ID</Label>
                    <p className="text-sm">{invoice.appointment.Payment.transactionId}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">

            <Button onClick={generatePDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

}
