import React from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CreditCard } from 'lucide-react'
import { createPaymentSchema, createPaymentSchemaType } from '@/lib/validations/auth-route-forms'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import queryClient from '@/lib/tanstack-query'
import { CustomerInvoiceType } from '@/types/customer'

type PaymentModalProps = {
    invoiceId: string;
    appointmentId: string;
    amount: number;
    userId: string;
}
export default function PaymentModal({ invoiceId, appointmentId, amount, userId }: PaymentModalProps) {
    const form = useForm<createPaymentSchemaType>({
        resolver: zodResolver(createPaymentSchema),
        defaultValues: {
            paymentMethod: "",
        },
    });

    const paymentMutation = useMutation({
        mutationFn: async ({ appointmentId, invoiceId, paymentMethod }: { appointmentId: string, invoiceId: string, paymentMethod: string }) => {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/create/${appointmentId}?invoiceId=${invoiceId}`,
                { amount, method: paymentMethod }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.setQueryData(["invoices-customer", userId], function (prevData: CustomerInvoiceType[]): CustomerInvoiceType[] {
                if (!prevData) return prevData;

                return prevData.map((data) => (
                    data.id === invoiceId ? {
                        ...data,
                        status: "PAID"
                    } : data
                ))
            })
            toast.success("Payment initiated");
        },
        onError: (error) => {
            toast.error(error.message || "Error Occurred");
        },
    })
    function onSubmit(formData: createPaymentSchemaType) {
        paymentMutation.mutate({
            appointmentId,
            invoiceId,
            paymentMethod: formData.paymentMethod
        });
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Make Payment</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="CARD">Card</SelectItem>
                                            <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div>
                            <h1>Amount</h1>
                            <p className="font-bold">₹{amount}</p>
                        </div>
                        <Button type="submit"
                            disabled={paymentMutation.isPending}
                            className="w-full">
                            {paymentMutation.isPending ? "Processing..." : "Pay"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

