"use client";

import React, { useState } from 'react';
import { useAppointmentsAdmin } from '@/hooks/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import TanstackError from '@/components/TanstackError';

const searchSchema = z.object({
  search: z.string().optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

export default function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const { data, isLoading, isError, isFetching } = useAppointmentsAdmin(page, limit, search);

  const form = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  });

  const onSubmit = (values: SearchForm) => {
    setSearch(values.search || "");
    setPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isError || !isFetching && !data?.appointment_data || !isFetching && data?.appointment_data.length === undefined) {
    <TanstackError />
  }


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Appointments Management</h1>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4">
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Search by service type, vehicle, customer, or service center..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data?.appointment_data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No appointments found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Service Center</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.appointment_data.map((appointment) => (
                    <TableRow key={appointment.id}>

                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.owner.name}</p>
                          <p className="text-sm text-muted-foreground">{appointment.owner.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.Vehicle.vehicleName}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.Vehicle.vehicleMake} {appointment.Vehicle.vehicleModel}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.serviceType}</TableCell>
                      <TableCell>{appointment.serviceCenter.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === 'COMPLETED' ? 'default' :
                              appointment.status === 'PENDING' ? 'secondary' :
                                appointment.status === 'APPROVED' ? 'outline' :
                                  'destructive'
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.priority === 'HIGH' ? 'destructive' :
                              appointment.priority === 'MEDIUM' ? 'default' :
                                'secondary'
                          }
                        >
                          {appointment.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(appointment.requestedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link href={`/auth/admin/appointments/${appointment.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.total)} of {data.pagination.total} appointments
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {page} of {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === data.pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
