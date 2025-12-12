/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
"use client";

import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { useAppointment } from "@/hooks/service-center";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import NewJobCard from "@/components/service-center/new-job-card";
import DeleteJobCard from "@/components/service-center/delete-job-card";
import { format } from "date-fns";
import AddPartsToJobCard from "@/components/service-center/add-parts-job-card";
import { useSessionContext } from "@/context/session";
import React from "react";
import queryClient from "@/lib/tanstack-query";
import { AppointmentServiceCenter } from "@/types/service-center";
import { bookingStatus } from "@prisma/client";
import GenerateInvoice from "@/components/service-center/generate-invoice";


export default function AppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { session } = useSessionContext();
  const [isPending, startTransition] = React.useTransition();
  const { data: appointment, isLoading, isError, isFetching } = useAppointment(id as string)
  if (!id) {
    router.push("/service-center/dashboard")
  }

  if (isLoading || isFetching) {
    return (
      <Loader />
    )
  }

  if (isError || !appointment) {
    return (
      <TanstackError />
    )
  }


  async function updateAppointmentStatus(updatedStatus: string) {
    startTransition(async () => {
      try {
        const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${id}/status/update`, { status: updatedStatus })
        queryClient.setQueryData(["appointment-service-center"], function (prevData: AppointmentServiceCenter): AppointmentServiceCenter {
          if (!prevData) return prevData
          return {
            ...prevData,
            status: updatedStatus as bookingStatus,
          }
        })
        toast.success(response.data)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data || "Error Occurred");
        } else {
          toast.error("Error Occurred");
        }
      }
    })
  }



  const totalCost = appointment.JobCards.reduce(
    (sum, job) =>
      sum + (job.price || 0), 0
  );

  let labourCharges = 0;

  appointment.JobCards.forEach(jobCard => {
    const partsCost = jobCard.JobCardParts.reduce(
      (sum, part) => sum + part.quantity * part.partUsed.unitPrice,
      0
    );

    labourCharges += jobCard.price - partsCost;
  });
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointment Details</h1>
        <Button variant="outline" onClick={() => router.push("/auth/service-center/appointments")}>
          Back to Appointments
        </Button>
      </div>

      {/* Appointment Info */}
      <Card className="mb-6 dark:bg-neutral-800 bg-neutral-100">
        <CardHeader>
          <CardTitle className="flex justify-between items-start ">
            <div>
              <h2 className="text-xl">{appointment.serviceType}</h2>
              <p className="text-gray-600">
                {appointment.Vehicle.vehicleName} - {appointment.Vehicle.vehicleMake} {appointment.Vehicle.vehicleModel}
              </p>
              <p className="text-sm">Customer: {appointment.owner.name} ({appointment.owner.email})</p>
            </div>
            <Badge variant={appointment.status === 'COMPLETED' ? 'default' : 'outline'}>
              {appointment.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="dark:bg-neutral-800 bg-neutral-100">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Requested Date</Label>
              <p> {format(new Date(appointment.requestedDate), "dd MMM yyyy, hh:mm a")} </p>
            </div>
            {appointment.slaDeadline && (
              <div>
                <Label>Sla Deadline</Label>
                <p> {format(new Date(appointment.slaDeadline), "dd MMM yyyy")}</p>
              </div>
            )}
            {appointment.actualCompletionDate && (
              <div>
                <Label>Completed Date</Label>
                <p>{new Date(appointment.actualCompletionDate).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {appointment.status === 'PENDING' && (
              <Button disabled={isPending} onClick={() => updateAppointmentStatus('InService')}>
                {isPending ? "Updating..." : "Start Service"}
              </Button>
            )}
            {appointment.status === 'InService' && (
              <Button disabled={isPending} onClick={() => updateAppointmentStatus('COMPLETED')}>
                {isPending ? "Updating..." : "Complete Service"}
              </Button>
            )}

            {
              appointment.status === "COMPLETED" && (
                appointment.slaDeadline && appointment?.slaDeadline > new Date() ? (
                  <h1 className="text-2xl font-bold text-red-500">
                    You Failed to Achieve the deadline
                  </h1>
                ) : (
                  <h1 className="text-2xl font-bold text-green-500">
                    You Achieved the Deadline
                  </h1>
                )
              )
            }
          </div>
        </CardContent>
      </Card>

      {/* Job Cards */}
      <Card className="dark:bg-neutral-800 bg-neutral-100">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Job Cards</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col ">
          <div className="mb-4">
            <NewJobCard appointmentId={id as string} disabledStatus={appointment.status === "COMPLETED"} />
            <GenerateInvoice appointmentId={id as string} totalAmount={totalCost} />
          </div>
          <div className="">

            <div className="space-y-4 dark:bg-neutral-950 bg-neutral-50">
              {appointment.JobCards.map((jobCard) => (
                <div key={jobCard.id} className="border rounded p-4">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{jobCard.jobName}</h3>
                        <p className="text-sm text-gray-600">{jobCard.jobDescription}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">₹ {jobCard.price}</span>
                      </div>
                    </div>

                    {/* //Parts */}
                    <div className="mb-2">
                      <h4 className="text-sm font-medium mb-1">Parts Used:</h4>
                      {jobCard.JobCardParts?.length === 0 ? (
                        <p className="text-xs text-gray-500">No parts added</p>
                      ) : (
                        <div className="space-y-1">
                          {jobCard.JobCardParts.map((part, index: number) => (
                            <div key={index} className="text-xs flex justify-between">
                              <span>{part.partUsed.name} (x{part.quantity})</span>
                              <span>${(part.partUsed.unitPrice * part.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <DeleteJobCard jobCardId={jobCard.id} appointmentId={id as string} disabledStatus={appointment.status === "COMPLETED"} />
                      <AddPartsToJobCard jobCardId={jobCard.id} appointmentId={id as string} serviceCenterId={session?.user.id!} disabledStatus={appointment.status === "COMPLETED"} />
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <h1>Labour Charges</h1>
              <h3>₹ {labourCharges.toFixed(2)}</h3>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Cost:</span>
              <span>₹ {totalCost.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
