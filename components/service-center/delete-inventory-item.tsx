import React from 'react'
import { Dialog, DialogTrigger, DialogTitle, DialogHeader, DialogContent, DialogClose, DialogFooter, DialogDescription, } from '../ui/dialog'
import { Button } from '../ui/button'
import toast from 'react-hot-toast';
import axios from 'axios';
import queryClient from '@/lib/tanstack-query';
import { Inventory } from '@prisma/client';


interface DeleteInventoryItemProps {
    serviceCenterId: string,
    inventoryItemId: string
}


export default function DeleteInventoryItem({ serviceCenterId, inventoryItemId }: DeleteInventoryItemProps) {
    const [isPending, startTransition] = React.useTransition()

    async function handleInventoryItemDeletion() {
        startTransition(async () => {
            try {
                const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/delete/${inventoryItemId}?serviceCenterId=${serviceCenterId}`)
                queryClient.setQueryData(["inventory-items"], function (prevData: Inventory[]
                ) {
                    return prevData.filter((item) => item.id !== inventoryItemId)
                })
                toast.success(response.data)
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data || "Failed to Delete Inventory Item");
                } else {
                    toast.error("Failed to Delete Inventory Item");
                }
            }
        })
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"destructive"}     >
                    delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Inventory Item</DialogTitle>
                    <DialogDescription>
                        are you sure you want to delete the inventory item
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose className='flex items-center justify-start gap-3'>
                        <Button disabled={isPending} variant="outline" >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button disabled={isPending} onClick={() => handleInventoryItemDeletion()}>
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
