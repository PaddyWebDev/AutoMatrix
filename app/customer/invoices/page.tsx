"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Download, Eye, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  dueDate: string;
  createdAt: string;
  appointment: {
    id: string;
    serviceType: string;
    Vehicle: {
      vehicleName: string;
      vehicleMake: string;
      vehicleModel: number;
    };
  };
  invoiceItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export default function CustomerInvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchInvoices();
    }
  });

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/invoices/customer/${session?.user.id}`);
      setInvoices(response.data);
    } catch (error) {
      toast.error("Failed to fetch invoices");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download invoice");
      console.error(error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'default';
      case 'SENT':
        return 'secondary';
      case 'OVERDUE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!session) return <div className="p-6">Please sign in</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Invoices</h1>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-sm text-gray-600">Total Invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {invoices.filter(inv => inv.status === 'PAID').length}
            </div>
            <p className="text-sm text-gray-600">Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${invoices.reduce((sum, inv) => sum + inv.finalAmount, 0).toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Total Amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">No invoices available yet.</p>
            <p className="text-sm">Invoices will appear here once your services are completed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">#{invoice.invoiceNumber}</h3>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Vehicle:</span> {invoice.appointment.Vehicle.vehicleName} ({invoice.appointment.Vehicle.vehicleMake} {invoice.appointment.Vehicle.vehicleModel})
                      </div>
                      <div>
                        <span className="font-medium">Service:</span> {invoice.appointment.serviceType}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${invoice.finalAmount.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {invoice.status === 'OVERDUE' && (
                      <span className="text-red-600 font-medium">Overdue</span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadInvoice(invoice.id)}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                    {invoice.status !== 'PAID' && (
                      <Button size="sm">
                        <CreditCard className="mr-1 h-3 w-3" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invoice Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Invoice #{selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Service Center:</h3>
                  <p>Vehicle Service Center</p>
                  <p>contact@servicecenter.com</p>
                </div>
                <div className="text-right">
                  <p><span className="font-semibold">Invoice #:</span> {selectedInvoice.invoiceNumber}</p>
                  <p><span className="font-semibold">Date:</span> {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Due Date:</span> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Vehicle Info */}
              <div>
                <h3 className="font-semibold mb-2">Vehicle Information:</h3>
                <p>{selectedInvoice.appointment.Vehicle.vehicleName} - {selectedInvoice.appointment.Vehicle.vehicleMake} {selectedInvoice.appointment.Vehicle.vehicleModel}</p>
                <p>Service: {selectedInvoice.appointment.serviceType}</p>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="font-semibold mb-2">Service Details:</h3>
                <div className="border rounded">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.invoiceItems.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right">${item.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${selectedInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedInvoice.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="font-semibold">Status: </span>
                  <Badge variant={getStatusBadgeVariant(selectedInvoice.status)}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                {selectedInvoice.status !== 'PAID' && (
                  <Button>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Invoice
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
