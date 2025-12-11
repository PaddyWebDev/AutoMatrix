"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSessionContext } from "@/context/session";
import axios from "axios";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const filterSchema = z.object({
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});



type FilterForm = z.infer<typeof filterSchema>;

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  billingDate: string;
  dueDate: string;
  status: string;
  appointment: {
    id: string;
    serviceType: string;
    Vehicle: {
      vehicleName: string;
      vehicleMake: string;
      vehicleModel: number;
    };
    owner: {
      name: string;
    };
  };
}



export default function ServiceCenterInvoicesPage() {
  const { session } = useSessionContext();
  const [filters, setFilters] = useState<FilterForm>({});

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {},
  });

 

  const { data: invoices, isLoading, isError } = useQuery<Invoice[]>({
    queryKey: ['invoices', session?.user.id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const response = await axios.get(`/api/service-centers/invoices?${params}&userId=${session?.user.id}`);
      return response.data;
    },
    enabled: !!session?.user.id,
  });

  

  const onFilterSubmit = (data: FilterForm) => {
    setFilters(data);
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

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <TanstackError />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
        
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...filterForm}>
            <form onSubmit={filterForm.handleSubmit(onFilterSubmit)} className="flex gap-4">
              <FormField
                control={filterForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SENT">Sent</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={filterForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={filterForm.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="self-end">Apply Filters</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.appointment.owner.name}</TableCell>
                  <TableCell>{invoice.appointment.Vehicle.vehicleName} ({invoice.appointment.Vehicle.vehicleMake} {invoice.appointment.Vehicle.vehicleModel})</TableCell>
                  <TableCell>{invoice.appointment.serviceType}</TableCell>
                  <TableCell>${invoice.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), "dd MMM yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {invoices?.length === 0 && (
            <p className="text-center py-4">No invoices found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
