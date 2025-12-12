"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import toast from "react-hot-toast";
import { useVehicles, useServiceCentersFetchAll } from "@/hooks/customer";
import queryClient from "@/lib/tanstack-query";
import { useSessionContext } from "@/context/session";
import { AppointmentPriority, ServiceCenter, Vehicle } from "@prisma/client";
import { createAppointmentSchema, createAppointmentSchemaType } from "@/lib/validations/auth-route-forms";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import { AppointmentDatePicker } from "@/components/AppointmentDatePicker";



export default function BookAppointmentPage() {
  const { session } = useSessionContext();
  const [isPending, startTransition] = React.useTransition();

  const { data: vehicles = [], isLoading: vehiclesLoading, isError: vehicleError } = useVehicles(session?.user?.id);
  const { data: serviceCenters = [], isLoading: centersLoading, isError: centerError } = useServiceCentersFetchAll();

  const form = useForm<createAppointmentSchemaType>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      vehicleId: "",
      serviceType: "",
      serviceCenterId: "",
      priority: undefined,
      serviceDeadline: undefined
    },
  });

  if (vehiclesLoading || centersLoading) {
    return (
      <Loader />
    )
  }

  if (vehicleError || centerError) {
    return (
      <TanstackError />
    )
  }


  async function onSubmit(values: createAppointmentSchemaType) {
    startTransition(async () => {
      try {
        const validatedFields = createAppointmentSchema.safeParse(values);
        if (validatedFields.error || !validatedFields.data) {
          toast.error("Failed to validated the fields")
          return;
        }
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/create`, {
          ...validatedFields.data,
          userId: session?.user.id,
        });
        console.log(response.data);
        toast.success("Appointment booked successfully!");
        queryClient.invalidateQueries({ queryKey: ["appointments", session?.user.id] });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data || "Failed to book appointment");
        } else {
          toast.error("Failed to book appointment");
        }
      }
    })

  }
  return (
    <section className="container mx-auto p-6 max-w-2xl mt-[15dvh]">
      <Card>
        <CardHeader>
          <CardTitle>Book Service Appointment</CardTitle>
        </CardHeader>
        <CardContent>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose your vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle: Vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.vehicleName} - {vehicle.vehicleMake} {vehicle.vehicleModel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceCenterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Nearest Service Center</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose nearest service center" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceCenters.map((center: ServiceCenter) => (
                          <SelectItem key={center.id} value={center.id}>
                            {center.name} - {center.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Oil Change, Brake Repair" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value} >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose the priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={AppointmentPriority.LOW.toString()}>
                            {AppointmentPriority.LOW}
                          </SelectItem>
                          <SelectItem value={AppointmentPriority.MEDIUM.toString()}>
                            {AppointmentPriority.MEDIUM}
                          </SelectItem>
                          <SelectItem value={AppointmentPriority.HIGH.toString()}>
                            {AppointmentPriority.HIGH}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <AppointmentDatePicker disabledStatus={isPending} value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? "Booking..." : "Book Appointment"}
              </Button>

            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
