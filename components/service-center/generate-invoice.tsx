import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import { DialogClose } from '@radix-ui/react-dialog';
import queryClient from '@/lib/tanstack-query';
import { AppointmentServiceCenter } from '@/types/service-center';

interface GenerateInvoiceProps {
    appointmentId: string;
    totalAmount: number;
    disabledStatus: boolean
}

export default function GenerateInvoice({ appointmentId, totalAmount, disabledStatus }: GenerateInvoiceProps) {
    const [isPending, startTransition] = React.useTransition();

    const onGenerateSubmit = async () => {
        startTransition(async () => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}/invoice/create`, {
                    totalAmount,
                });

                queryClient.setQueryData(["appointment-service-center", appointmentId], function (prevData: AppointmentServiceCenter): AppointmentServiceCenter {
                    if (!prevData) return prevData;

                    if (prevData.Invoice) {
                        return {
                            ...prevData,
                            Invoice: {
                                ...prevData?.Invoice,
                                billingDate: response.data.billing_date as string
                            }
                        }
                    } else {
                        return {
                            ...prevData
                        }
                    }


                })
                toast.success(response.data.message);

            } catch (error) {
                toast.error(axios.isAxiosError(error) ? error.response?.data : "Error Occurred while generating the invoice")
            }
        })
    };

    return (
        <Dialog>
            <DialogTrigger asChild disabled={disabledStatus}>
                <Button>Generate Invoice</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate Invoice</DialogTitle>
                </DialogHeader>

                <p className="text-sm text-gray-600">
                    Are you sure you want to generate the invoice for this appointment?
                </p>

                <DialogFooter>
                    <DialogClose>
                        <Button variant="ghost" disabled={isPending}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={onGenerateSubmit} disabled={isPending}>
                        {isPending ? "Generating..." : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
