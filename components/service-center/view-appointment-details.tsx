"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { format } from "date-fns";
import Image from "next/image";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import TanstackError from "@/components/TanstackError";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { AppointmentServiceCenter } from "@/types/service-center";
import { AppointmentDatePicker } from "../AppointmentDatePicker";

const approveSchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  slaDeadline: z.date({
    message: "Please select a deadline",
  })
    .refine((date) => date > new Date(), {
      message: "Deadline must be a future date",
    }),
});

type ApproveForm = z.infer<typeof approveSchema>;

interface ViewAppointmentDetailsProps {
  appointment: AppointmentServiceCenter;
  onStatusUpdate?: () => void; // callback to refresh list
}

export default function ViewAppointmentDetails({
  appointment,
  onStatusUpdate,
}: ViewAppointmentDetailsProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<ApproveForm>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      priority: "MEDIUM",
    },
  });

  const onApprove = async (data: ApproveForm) => {
    startTransition(async () => {
      try {
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointment.id}/decision`,
          { status: "APPROVED", priority: data.priority, slaDeadline: data.slaDeadline }
        );
        toast.success(response.data);
        onStatusUpdate?.();
        form.reset()
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data || "Error Occurred");
        } else {
          toast.error("Error Occurred");
        }
      }
    })
  }

  const onReject = async () => {
    startTransition(async () => {
      try {
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointment.id}/decision`,
          { status: "REJECTED" }
        );
        toast.success(response.data);
        onStatusUpdate?.();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data || "Error Occurred");
        } else {
          toast.error("Error Occurred");
        }
      }
    })
  };


  if (!appointment) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent>
          <TanstackError />
        </DialogContent>
      </Dialog>
    );
  }

  console.log(appointment);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{appointment.serviceType}</h3>
                <p className="text-sm text-gray-600">
                  {appointment.Vehicle.vehicleName} - {appointment.Vehicle.vehicleMake} {appointment.Vehicle.vehicleModel}
                </p>
                <p className="text-sm">Requested by: {appointment.owner.name} ({appointment.owner.email})</p>
              </div>
              <Badge variant="outline">{appointment.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Requested Date</Label>
                <p className="text-sm">{format(new Date(appointment.requestedDate), "dd MMM yyyy, hh:mm a")}</p>
              </div>
              {appointment.slaDeadline && (
                <div>
                  <Label>Deadline</Label>
                  <p className="text-sm">{format(new Date(appointment.slaDeadline), "dd MMM yyyy, hh:mm a")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Accidental Photos */}
          {appointment.isAccidental && appointment.photos.length > 0 && (
            <div>
              <Label>Accidental Photos</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {appointment.photos.map((photo, index) => (
                  <Image
                    key={index}
                    src={photo}
                    width={100}
                    height={100}
                    alt={`Accidental photo ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onApprove)} className="space-y-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Set Priority</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slaDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Service Deadline(Optional)"}</FormLabel>
                    <FormControl>
                      <AppointmentDatePicker disabledStatus={isPending} value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <div className="flex gap-2">
                <Button disabled={isPending} type="reset" variant="destructive" onClick={onReject}>
                  Reject
                </Button>
                <Button disabled={isPending} type="submit">
                  {isPending ? "Updating..." : "Approve"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog >
  );
}
