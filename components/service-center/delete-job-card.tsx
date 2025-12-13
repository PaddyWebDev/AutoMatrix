import React from 'react'
import { Dialog, DialogTrigger, DialogTitle, DialogHeader, DialogContent, DialogClose, DialogFooter, DialogDescription, } from '../ui/dialog'
import { Button } from '../ui/button'
import toast from 'react-hot-toast';
import axios from 'axios';
import queryClient from '@/lib/tanstack-query';
import { AppointmentServiceCenter } from '@/types/service-center';


interface DeleteJobCardProps {
    jobCardId: string,
    appointmentId: string
    disabledStatus: boolean
}


export default function DeleteJobCard({ appointmentId, jobCardId, disabledStatus }: DeleteJobCardProps) {
    const [isPending, startTransition] = React.useTransition()

    async function handleJobCardCreation() {
        startTransition(async () => {
            try {
                // todo send data to backend and handle the updation on the dashboard
                const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/job-card/delete/${jobCardId}?appointmentId=${appointmentId}`)
                console.log(response.data);
                queryClient.setQueryData(["appointment-service-center", appointmentId], function (prevData: AppointmentServiceCenter
                ) {
                    if (!prevData) return prevData;
                    const updatedCards = prevData.JobCards.filter((jobCard) => jobCard.id !== jobCardId)
                    return {
                        ...prevData,
                        JobCards: [...updatedCards],
                    };
                })
                toast.success(response.data)
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data || "Failed to Delete Job Card");
                } else {
                    toast.error("Failed to Delete Job Card");
                }
            }
        })
    }
    return (
        <Dialog>
            <DialogTrigger asChild disabled={disabledStatus}>
                <Button variant={"destructive"}     >
                    delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Job Card</DialogTitle>
                    <DialogDescription>
                        are you sure you want to delete the job card
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose className='flex items-center justify-start gap-3'>
                        <Button disabled={isPending} variant="outline" >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button disabled={isPending} onClick={() => handleJobCardCreation()}>
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
