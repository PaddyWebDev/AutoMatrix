import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import queryClient from '@/lib/tanstack-query'
import { AppointmentServiceCenter } from '@/types/service-center'
import { AddPartForm, addPartSchema } from '@/lib/validations/auth-route-forms'

interface AddPartsToJobCardProps {
    appointmentId: string,
    jobCardId: string,
    serviceCenterId: string
    disabledStatus: boolean;
}



export default function AddPartsToJobCard({ appointmentId, jobCardId, serviceCenterId, disabledStatus }: AddPartsToJobCardProps) {
    const [isPending, startTransition] = React.useTransition();
    const { data: inventory } = useQuery({
        queryKey: ['inventory-data'],
        queryFn: async () => {
            const response = await axios.get(`/api/service-centers/inventory?serviceCenterId=${serviceCenterId}`)
            return response.data.inventory_data
        },
    })

    const form = useForm<AddPartForm>({
        resolver: zodResolver(addPartSchema),
        defaultValues: {
            partId: '',
            quantity: "",
        },
    })

    const onSubmit = async (values: AddPartForm) => {
        startTransition(async () => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/job-card/part/add`, {
                    jobCardId,
                    partId: values.partId,
                    quantity: values.quantity,
                    appointmentId: appointmentId
                })

                queryClient.setQueryData(
                    ["appointment-service-center"],
                    (prev: AppointmentServiceCenter | undefined): AppointmentServiceCenter | undefined => {
                        if (!prev) return prev;

                        return {
                            ...prev,
                            JobCards: prev.JobCards.map((jobCard) => {
                                if (jobCard.id !== jobCardId) return jobCard;

                                return {
                                    ...jobCard,
                                    price: jobCard.price + response.data.new_part_job_card.partUsed.unitPrice,
                                    JobCardParts: [
                                        ...jobCard.JobCardParts,
                                        response.data.new_part_job_card
                                    ]
                                };
                            }),
                        };
                    }
                );

                toast.success(response.data.message)
                form.reset()
            } catch (error) {
                console.log(error);
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data || 'Failed to add part')
                } else {
                    toast.error('Failed to add part')
                }
            }
        })
    }

    return (
        <Dialog >
            <DialogTrigger asChild disabled={disabledStatus}>
                <Button>
                    Add Parts
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add Part
                    </DialogTitle>
                    <DialogDescription>
                        Add parts to your job card
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="partId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Part</FormLabel>
                                    <Select onValueChange={field.onChange} disabled={isPending} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className='w-full' disabled={isPending}>
                                                <SelectValue placeholder="Select a part" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {inventory?.map((item: { id: string; name: string; sku: string; quantity: number; brand: string }) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name} ({item.sku}) ({item.brand}) - Qty: {item.quantity}
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
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isPending}
                                            {...field}
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
            </DialogContent>
        </Dialog >
    )
}
