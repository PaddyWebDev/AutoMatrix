"use client";

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
import { useVehicles, useServiceCenters } from "@/hooks/customer";
import { useSessionContext } from "@/context/session";
import { AppointmentPriority, Vehicle } from "@prisma/client";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import { createAppointmentSchema, createAppointmentSchemaType } from "@/lib/validations/auth-route-forms";
import React from "react";
import { AppointmentDatePicker } from "@/components/AppointmentDatePicker";
import { useRouter } from "next/navigation";



export default function BookAppointmentPage() {
  const router = useRouter()
  const { session } = useSessionContext();
  const [isPending, startTransition] = React.useTransition()

  const { data: vehicles = [], isLoading: vehiclesLoading, isError: VehicleError } = useVehicles(session?.user?.id);
  const { data: serviceCenters = [], isLoading: centersLoading, isError: ServiceError } = useServiceCenters();

  const form = useForm<createAppointmentSchemaType>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      vehicleId: "",
      serviceType: "",
      serviceCenterId: "",
      priority: undefined,
      serviceDeadline: undefined,
    },
  });

  if (vehiclesLoading || centersLoading) {
    return (
      <Loader />
    )
  }
  if (VehicleError || ServiceError) {
    return (
      <TanstackError />
    )
  }


  async function onSubmit(values: createAppointmentSchemaType) {
    startTransition(async () => {
      try {
        const validatedFields = createAppointmentSchema.safeParse(values)
        if (validatedFields.error || !validatedFields.data) {
          toast.error("failed to validate fields")
          return;
        }
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/create`, {
          ...validatedFields.data,
          userId: session?.user.id,
        });

        toast.success("Appointment booked successfully!");
        router.push("/auth/customer/dashboard")
        form.reset();
      } catch (error: unknown) {
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
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="w-full" disabled={isPending}>
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
                        {serviceCenters.map((center: {
                          city: string, name: string, id: string, distanceKm: number, email: string, longitude: number, latitude: number
                        }) => (
                          <SelectItem key={center.id} value={center.id}>
                            {center.name} - {center.city} ({center.distanceKm?.toFixed(1)} km away)
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
                        <SelectTrigger className="w-full" disabled={isPending}>
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
                    <FormLabel>Pick Service Date</FormLabel>
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
