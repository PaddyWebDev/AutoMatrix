"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import TanstackError from "@/components/TanstackError";
import { useSessionContext } from "@/context/session";
import socket from "@/lib/socket-io";
import { decryptSocketData } from "@/hooks/cryptr";
import queryClient from "@/lib/tanstack-query";
import AppointmentStatus from "@/components/service-center/status-appointment";
import { bookingStatus } from "@prisma/client";
import { ServiceCenterAppointment } from "@/types/service-center";

const filterSchema = z.object({
    status: z.string().optional(),
    priority: z.string().optional(),
});

type FilterForm = z.infer<typeof filterSchema>;


interface AppointmentsResponse {
    success: boolean;
    appointments: ServiceCenterAppointment[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function AppointmentsPage() {
    const { session } = useSessionContext();
    const [currentPage, setCurrentPage] = useState(1);

    const form = useForm<FilterForm>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            status: "",
            priority: "",
        },
    });

    const filters = form.watch();

    const { data, isLoading, isError, isFetching, isFetched } = useQuery<AppointmentsResponse>({
        queryKey: ["appointments-service-center", currentPage, filters],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage.toString(),
            });
            if (filters.status) params.append("status", filters.status);
            if (filters.priority) params.append("priority", filters.priority);
            const response = await axios.get(`/api/service-centers/appointments?${params}&userId=${session?.user.id}`);
            return response.data;
        },
        enabled: !!session,
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const onSubmit = (values: FilterForm) => {
        setCurrentPage(1); // Reset to first page on filter change
        console.log(values);
    };
    React.useEffect(() => {
        async function newAppointment(newAppt: ServiceCenterAppointment) {
            queryClient.setQueryData(['appointments-service-center'], function (prevData: ServiceCenterAppointment[] = []) {
                return [...prevData, newAppt]
            })
        }
        socket.connect();
        socket.on(`new-appointment-${session?.user.id}`, async (data) => {
            newAppointment(await decryptSocketData(data))
        });

        return () => {
            socket.off(`new-appointment-${session?.user.id}`)
        }
    }, [session?.user.id]);


    if (isError || (isFetched && !data?.appointments) || isFetched && !data?.appointments.length) {
        return <TanstackError />;
    }
/*
    the things here need to get done are add the deadline let the serivce center person view the deadline for this apointment
    and update the deadline according

*/



    return (
        <section className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Appointments</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 mb-6">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="InService">In Service</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="All Priorities" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="self-end">
                        Apply Filters
                    </Button>
                </form>
            </Form>

            {isLoading || isFetching ? (
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Service Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Requested Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.appointments.map((appointment) => (
                                    <TableRow key={appointment.id}>
                                        <TableCell>{appointment?.userUrgency || 'N/A'}</TableCell>
                                        <TableCell>
                                            {appointment.owner.name} ({appointment.owner.email})
                                        </TableCell>
                                        <TableCell>
                                            {appointment.Vehicle.vehicleName} - {appointment.Vehicle.vehicleMake} {appointment.Vehicle.vehicleModel}
                                        </TableCell>
                                        <TableCell>
                                            {appointment.serviceType}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={appointment.status === "COMPLETED" ? "default" : appointment.status === "REJECTED" ? "destructive" : "secondary"}>
                                                {appointment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(appointment.requestedDate), "dd MMM yyyy, hh:mm a")}</TableCell>
                                        <TableCell>
                                            {
                                                ([bookingStatus.APPROVED.toString(), bookingStatus.InService.toString(), bookingStatus.COMPLETED.toString()].includes(appointment.status)) && (
                                                    <Link href={`/auth/service-center/appointments/${appointment.id}`}>
                                                        <Button size="sm" variant="secondary" className="  cursor-pointer">
                                                            View
                                                        </Button>
                                                    </Link>
                                                )
                                            }
                                            {
                                                appointment.status === "PENDING" && (
                                                    <div className="flex items-center gap-2">
                                                        <AppointmentStatus appointmentId={appointment.id} status="REJECTED" />
                                                        <AppointmentStatus appointmentId={appointment.id} status="APPROVED" />
                                                    </div>
                                                )
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {data && data.totalPages > 1 && (
                        <div className="flex justify-center mt-6 space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                                const page = Math.max(1, currentPage - 2) + i;
                                if (page > data.totalPages) return null;
                                return (
                                    <Button
                                        key={page}
                                        variant={page === currentPage ? "default" : "outline"}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </Button>
                                );
                            })}
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === data.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
