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
import AssignMechanic from "@/components/service-center/assign-mechanic";
import { format } from "date-fns";
import AddPartsToJobCard from "@/components/service-center/add-parts-job-card";
import { useSessionContext } from "@/context/session";
import React from "react";
import queryClient from "@/lib/tanstack-query";
import { AppointmentServiceCenter } from "@/types/service-center";
import { bookingStatus } from "@prisma/client";
import GenerateInvoice from "@/components/service-center/generate-invoice";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Session } from "next-auth";
import Image from "next/image";
import { NoAppointmentData } from "@/components/service-center/no-appointment-data";
import socket from "@/lib/socket-io";
import { decryptSocketData } from "@/hooks/cryptr";
import CompleteService from "@/components/service-center/complete-service";


export default function AppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { session } = useSessionContext();
  const { data: appointment, isLoading, isError, isFetching } = useAppointment(id as string)
  if (!id) {
    router.push("/service-center/dashboard")
  }

  if (isLoading || isFetching) {
    return (
      <Loader />
    )
  }

  if (isError || appointment === undefined) {
    return (
      <TanstackError />
    )
  }


  if (appointment === null) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <NoAppointmentData />
      </div>
    )
  }

  console.log(appointment);
  return (
    <RenderAppointmentData appointment={appointment} router={router} id={id as string} session={session} />
  )

}

interface RenderAppointmentDataProps {
  appointment: AppointmentServiceCenter;
  router: AppRouterInstance;
  id: string
  session: Session | null
}
function RenderAppointmentData({ appointment, router, id, session }: RenderAppointmentDataProps) {
  const [isPending, startTransition] = React.useTransition();
  React.useEffect(() => {

    async function AssignMechanic(socketData: string) {
      const data: {
        id: string,
        name: string
      } = await decryptSocketData(socketData)
      queryClient.setQueryData(["appointment-service-center", id], function (prevData: AppointmentServiceCenter): AppointmentServiceCenter {
        if (!prevData) return prevData
        return {
          ...prevData,
          MechanicAssignment: [
            ...(prevData.MechanicAssignment ?? []).filter(
              (m) => m.mechanicId !== data.id
            ),
            {
              mechanicId: data.id,
              mechanic: {
                name :  data.name,
              }
            },
          ],
        }
      })
    }


    async function addJobCardPart(socketData: string) {
      const newPart: {
        jobCardId: string;
        partId: string;
        quantity: number;
        partUsed: {
          name: string;
          unitPrice: number;
        };
      } = await decryptSocketData(socketData)
      queryClient.setQueryData(
        ["appointment-service-center", id],
        (prev: AppointmentServiceCenter | undefined): AppointmentServiceCenter | undefined => {
          if (!prev) return prev;

          return {
            ...prev,
            JobCards: prev.JobCards.map((jobCard) => {
              if (jobCard.id !== newPart.jobCardId) return jobCard;

              return {
                ...jobCard,
                price: jobCard.price + newPart.partUsed.unitPrice,
                JobCardParts: [
                  ...(jobCard.JobCardParts ?? []),
                  newPart
                ]
              };
            }),
          };
        }
      );
    }

    async function addJobCard(socketData: string) {
      const NewJobCard = await decryptSocketData(socketData)
      queryClient.setQueryData(["appointment-service-center", id], function (prevData: AppointmentServiceCenter
      ) {
        if (!prevData) return prevData;
        return {
          ...prevData,
          JobCards: [...prevData.JobCards, NewJobCard],
        };
      })

    }

    socket.connect()
    socket.on(`mechanic-assignment-${session?.user.id}`, async (socketData: string) => {
      await AssignMechanic(socketData)
    })

    socket.on(`new-job-card-part-${session?.user.id}`, async (socketData: string) => {
      await addJobCardPart(socketData)
    })
    socket.on(`new-job-card-${session?.user.id}`, async (socketData: string) => {
      await addJobCard(socketData)
    })

    return () => {
      socket.off(`mechanic-assignment-${session?.user.id}`)
      socket.off(`new-job-card-part-${session?.user.id}`)
      socket.off(`new-job-card-${session?.user.id}`)
      socket.disconnect()
    }

  })

  async function updateAppointmentStatus(updatedStatus: string) {
    startTransition(async () => {
      try {
        const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${id}/status/update`, { status: updatedStatus })
        queryClient.setQueryData(["appointment-service-center", id], function (prevData: AppointmentServiceCenter): AppointmentServiceCenter {
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

  const { totalCost, labourCharges } = React.useMemo(() => {
    let labour = 0;
    let total = 0;

    appointment.JobCards.forEach(jobCard => {
      const price = Number(jobCard.price ?? 0);
      if (!jobCard.JobCardParts) {
        return;
      }
      const partsCost = jobCard.JobCardParts.reduce(
        (sum, part) =>
          sum + (Number(part.quantity) * Number(part.partUsed?.unitPrice ?? 0)),
        0
      );

      labour += Math.max(price - partsCost, 0);
      total += price;
    });

    return { totalCost: total, labourCharges: labour };
  }, [appointment.JobCards]);
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

          {appointment.isAccidental && (
            <div className="mb-4">
              <Label>Accidental Photos</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {appointment.photos.map((photo, index) => (
                  <Image
                    key={index}
                    src={photo}
                    width={500}
                    height={500}
                    alt={`Accidental photo ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            {appointment.status === 'APPROVED' && (
              <Button disabled={isPending} onClick={() => updateAppointmentStatus('InService')}>
                {isPending ? "Updating..." : "Start Service"}
              </Button>
            )}
            {appointment.status === 'InService' && (
              <div className="flex items-center gap-4">
                <CompleteService appointmentId={id} updatedStatus="COMPLETED" />
                <AssignMechanic skipMechanicIds={appointment.MechanicAssignment} appointmentId={id} alreadyAssigned={!!appointment.MechanicAssignment[0]?.mechanic.name} />
              </div>
            )}
            {
              appointment.status === "COMPLETED" && (
                appointment.slaDeadline && new Date(appointment?.slaDeadline) < new Date() ? (
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

          <div className="mt-5">
            <h1 className="text-xl font-bold">Mechanics Assigned </h1>
            {
              appointment.MechanicAssignment.map((mechanicAssign, index: number) => (
                <h1 key={index}>
                  {mechanicAssign.mechanic.name}
                </h1>
              ))
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
          <div className="mb-4 flex items-center gap-4 ">

            {["InService", "COMPLETED"].includes(appointment.status)
              && (
                <NewJobCard appointmentId={id as string} disabledStatus={appointment.status === "COMPLETED"} />
              )
            }
            {appointment.status === "COMPLETED" && !appointment?.Invoice && (
              <GenerateInvoice appointmentId={id as string} totalAmount={totalCost} disabledStatus={!!appointment.Invoice} />
            )}
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
                        <div className="space-y-1 ">
                          {jobCard.JobCardParts && jobCard.JobCardParts.map((part, index: number) => (
                            <div key={index} className="text-xs flex justify-between">
                              <span>{part.partUsed.name} ({part.quantity})</span>
                              <span>₹ {(part.partUsed.unitPrice * part.quantity).toFixed(2)}</span>
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

      {/* Feedback */}
      {appointment.status === 'COMPLETED' && appointment.Feedback && (
        <Card className="dark:bg-neutral-800 bg-neutral-100">
          <CardHeader>
            <CardTitle>Customer Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Rating</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= appointment.Feedback!.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({appointment.Feedback!.rating} star{appointment.Feedback!.rating > 1 ? 's' : ''})
                  </span>
                </div>
              </div>

              {appointment.Feedback!.comment && (
                <div>
                  <Label className="text-base font-medium">Comments</Label>
                  <p className="mt-1 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    {appointment.Feedback!.comment}
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Submitted on {new Date(appointment.Feedback!.createdAt).toLocaleDateString()} at{' '}
                {new Date(appointment.Feedback!.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
