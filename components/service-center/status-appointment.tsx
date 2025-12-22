import React from 'react'
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogContent, DialogDescription
} from '../ui/dialog'
import { Button } from '../ui/button'
import { bookingStatus } from '@prisma/client'
import axios from 'axios'
import queryClient from '@/lib/tanstack-query'
import { AppointmentServiceCenter } from '@/types/service-center'
import toast from 'react-hot-toast'

type AppointmentStatusProps = {
    appointmentId: string
    status: bookingStatus
}

export default function AppointmentStatus({
    appointmentId,
    status,
}: AppointmentStatusProps) {
    const [isPending, startTransition] = React.useTransition()
    const isApproval = status === 'APPROVED'


    async function updateAppointmentStatus(updatedStatus: string) {
        startTransition(async () => {
            try {
                const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}/status/update`, { status: updatedStatus })
                queryClient.setQueryData(["appointments-service-center", appointmentId], function (prevData: AppointmentServiceCenter[] = []): AppointmentServiceCenter[] {
                    if (!prevData) return prevData

                    return prevData.map((appointment) => (
                        appointment.id === appointmentId ?
                            {
                                ...appointment,
                                status
                            }
                            : appointment
                    ))

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

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={isApproval ? 'default' : 'destructive'}>
                    {isApproval ? 'Accept' : 'Reject'}
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isApproval
                            ? 'Approve Appointment'
                            : 'Reject Appointment'}
                    </DialogTitle>

                    <DialogDescription>
                        {isApproval
                            ? 'Are you sure you want to approve this appointment? Once approved, the customer will be notified and the slot will be locked.'
                            : 'Are you sure you want to reject this appointment? This action cannot be undone and the customer will be notified.'}

                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <Button variant="outline" disabled={isPending}>
                        Cancel
                    </Button>

                    <Button
                        disabled={isPending}
                        variant={isApproval ? 'default' : 'destructive'}
                        onClick={async () => await updateAppointmentStatus(status)}
                    >
                        {isApproval ? 'Confirm Approval' : 'Confirm Rejection'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
