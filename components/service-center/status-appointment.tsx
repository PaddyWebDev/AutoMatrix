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
import { bookingStatus, AppointmentPriority } from '@prisma/client'
import axios from 'axios'
import queryClient from '@/lib/tanstack-query'
import { AppointmentServiceCenter } from '@/types/service-center'
import toast from 'react-hot-toast'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const approvalSchema = z.object({
    priority: z.enum([AppointmentPriority.LOW, AppointmentPriority.MEDIUM, AppointmentPriority.HIGH]),
});

type ApprovalForm = z.infer<typeof approvalSchema>;

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

    const form = useForm<ApprovalForm>({
        resolver: zodResolver(approvalSchema),
        defaultValues: {
            priority: AppointmentPriority.MEDIUM,
        },
    });

    async function updateAppointmentStatus(updatedStatus: string, priority?: AppointmentPriority) {
        startTransition(async () => {
            try {
                const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}/status/update`, { status: updatedStatus, priority })
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
                            ? 'Select priority and confirm approval. This will create a triage record and may auto-assign a mechanic if only one is available.'
                            : 'Are you sure you want to reject this appointment? This action cannot be undone and the customer will be notified.'}

                    </DialogDescription>
                </DialogHeader>

                {isApproval && (
                    <Form {...form}>
                        <form className="space-y-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={AppointmentPriority.LOW}>Low</SelectItem>
                                                <SelectItem value={AppointmentPriority.MEDIUM}>Medium</SelectItem>
                                                <SelectItem value={AppointmentPriority.HIGH}>High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" disabled={isPending}>
                        Cancel
                    </Button>

                    <Button
                        disabled={isPending}
                        variant={isApproval ? 'default' : 'destructive'}
                        onClick={async () => {
                            if (isApproval) {
                                const priority = form.getValues('priority');
                                await updateAppointmentStatus(status, priority);
                            } else {
                                await updateAppointmentStatus(status);
                            }
                        }}
                    >
                        {isApproval ? 'Confirm Approval' : 'Confirm Rejection'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
