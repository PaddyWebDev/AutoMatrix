import React from 'react'
import { Dialog, DialogTrigger, DialogTitle, DialogHeader, DialogContent, DialogClose, DialogFooter, DialogDescription, } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { createJobCardSchema, createJobCardSchemaType } from '@/lib/validations/auth-route-forms';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Textarea } from '../ui/textarea';
import axios from 'axios';
import queryClient from '@/lib/tanstack-query';
import { AppointmentServiceCenter } from '@/types/service-center';



interface NewJobCardProps {
    appointmentId: string,
    disabledStatus: boolean
}
export default function NewJobCard({ appointmentId, disabledStatus }: NewJobCardProps) {
    const [isPending, startTransition] = React.useTransition()
    const form = useForm<createJobCardSchemaType>({
        resolver: zodResolver(createJobCardSchema),
        defaultValues: {
            jobName: "", jobDescription: "", price: ""
        }
    })

    async function handleJobCardCreation(formData: createJobCardSchemaType) {
        startTransition(async () => {
            try {
                const validatedFields = createJobCardSchema.safeParse(formData)
                if (validatedFields.error || !validatedFields.data) {
                    toast.error("Failed to validate fields")
                    return;
                }
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/job-card/create`, {
                    ...validatedFields.data,
                    appointmentId: appointmentId
                })
                toast.success(response.data)
                form.reset();
            } catch (error: unknown) {
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
            <DialogTrigger asChild disabled={disabledStatus}>
                <Button>Add</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Job Card</DialogTitle>
                    <DialogDescription>
                        fill the form to add job card
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleJobCardCreation)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="jobName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., My Honda Civic" disabled={isPending} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="jobDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Honda" disabled={isPending} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Labour Charges</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Honda" disabled={isPending} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose className='flex items-center justify-start gap-3'>
                                <Button variant="outline" >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button>Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}
