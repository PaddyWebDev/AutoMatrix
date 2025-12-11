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

interface GenerateInvoiceProps {
    appointmentId: string;
    totalAmount: number;
}

export default function GenerateInvoice({ appointmentId, totalAmount }: GenerateInvoiceProps) {
    const [isPending, startTransition] = React.useTransition();

    const onGenerateSubmit = async () => {
        startTransition(async () => {
            try {
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}/invoice/create`, {
                    totalAmount,
                });
                toast.success("Invoice generated successfully");
            } catch (error) {
                toast.error(axios.isAxiosError(error) ? error.response?.data : "Error Occurred while generating the invoice")
            }
        })
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
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
