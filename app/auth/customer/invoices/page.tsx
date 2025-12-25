"use client";

import { useSessionContext } from "@/context/session";
import { useInvoices } from "@/hooks/customer";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect } from "react";
import socket from "@/lib/socket-io";
import queryClient from "@/lib/tanstack-query";
import { decryptSocketData } from "@/hooks/cryptr";
import InvoiceModal from "@/components/customer/invoice-modal";
import PaymentModal from "@/components/customer/payment-modal";
import { InvoiceStatus } from "@prisma/client";
import { CustomerInvoiceType } from "@/types/customer";

export default function CustomerInvoices() {
  const { session } = useSessionContext();
  const { data: invoices = [], isLoading, isFetching, isError } = useInvoices(session?.user?.id as string);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = `new-invoice-${session.user.id}`;

    const handleNewInvoice = async (encryptedData: string) => {
      const invoiceData: CustomerInvoiceType = await decryptSocketData(encryptedData);

      queryClient.setQueryData(["invoices-customer", session?.user?.id], function (prevData: CustomerInvoiceType[] = []): CustomerInvoiceType[] {
        if (!prevData) return prevData;
        return [...prevData, invoiceData]
      })
    };

    socket.on(channel, handleNewInvoice);

    return () => {
      socket.off(channel, handleNewInvoice);
    };
  }, [session?.user?.id]);

  if (isLoading || isFetching) {
    return <Loader />;
  }

  if (isError || invoices === undefined || invoices.length === undefined) {
    return <TanstackError />;
  }


  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Invoices</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {invoices.map((invoice, index: number) => (
          <Card key={index} className="dark:bg-neutral-800 bg-neutral-100 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">Invoice #{invoice.invoiceNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Amount:</strong> ₹{invoice.totalAmount}</p>
              <p><strong>Status:</strong> <Badge variant={invoice.status === "PAID" ? "default" : "destructive"}>{invoice.status === "SENT" ? "NOT_PAID" : invoice.status}</Badge></p>
              <p><strong>Created:</strong> {format(new Date(invoice.billingDate), "dd MMM yyyy, hh:mm a")}</p>
              <div className="flex items-center gap-3">
                <InvoiceModal invoice={invoice} />
                {
                  invoice.status !== InvoiceStatus.PAID && (
                    <PaymentModal appointmentId={invoice.appointmentId} invoiceId={invoice.id} amount={invoice.totalAmount} userId={invoice.appointment.userId} />
                  )
                }
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
