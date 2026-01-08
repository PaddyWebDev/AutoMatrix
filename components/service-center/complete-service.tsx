import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { DialogTitle } from '@radix-ui/react-dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { handleFiledUpload } from '@/hooks/customer'
import { completeServiceSchema, completeServiceType } from '@/lib/validations/auth-route-forms'
import { Textarea } from '../ui/textarea'
import { bookingStatus } from '@prisma/client'
import queryClient from '@/lib/tanstack-query'
import axios from 'axios'
import { AppointmentServiceCenter } from '@/types/service-center'
import toast from 'react-hot-toast'

type CompleteServiceProps = {
    appointmentId: string;
    updatedStatus: bookingStatus;
}

export default function CompleteService({ appointmentId, updatedStatus }: CompleteServiceProps) {
    const [isPending, startTransition] = React.useTransition()
    const completeServiceForm = useForm<completeServiceType>({
        resolver: zodResolver(completeServiceSchema),
        defaultValues: {
            note: "",
            attachments: []
        }
    })

    async function handleCompletionService(formData: completeServiceType) {
        startTransition(async () => {
            try {
                const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}/status/update`, { status: updatedStatus, ...formData })
                queryClient.setQueryData(["appointment-service-center", appointmentId], function (prevData: AppointmentServiceCenter): AppointmentServiceCenter {
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
    return (
        <Dialog>
            <DialogTrigger>
                <Button>
                    Complete Service
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Complete Service
                    </DialogTitle>
                    <DialogDescription>
                        Fill the following form and submit to mark the appointment as resolved
                    </DialogDescription>
                </DialogHeader>

                <div>
                    <Form {...completeServiceForm}>
                        <form onSubmit={completeServiceForm.handleSubmit(handleCompletionService)} className='space-y-6'>

                            <FormField
                                control={completeServiceForm.control}
                                name='note'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note</FormLabel>
                                        <FormControl>
                                            <Textarea className="bg-neutral-50 border-neutral-300 dark:bg-neutral-950 dark:border-neutral-950" disabled={isPending} placeholder='Add your notes here' {...field}>
                                            </Textarea>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={completeServiceForm.control}
                                name="attachments"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{"Attachments (Optional)"}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                disabled={isPending}
                                                onChange={(e) =>
                                                    handleFiledUpload(field, e)
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <Button type="submit"
                                disabled={isPending}
                                className="w-full">
                                {isPending ? "Adding" : "Add Part"}
                            </Button>
                        </form>
                    </Form>
                </div>

            </DialogContent>
        </Dialog>
    )
}
