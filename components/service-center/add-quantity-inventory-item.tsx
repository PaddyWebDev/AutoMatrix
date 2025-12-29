import React from 'react'
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateQuantitySchema, updateQuantitySchemaType } from '@/lib/validations/auth-route-forms'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import queryClient from '@/lib/tanstack-query'
import { Inventory } from '@prisma/client'

type AddQuantityInventoryItemProps = {
    inventoryId: string,
    name: string,
    brand: string,
    sku: string
    serviceCenterId: string
}
export default function AddQuantityInventoryItem({ inventoryId, name, brand, sku, serviceCenterId }: AddQuantityInventoryItemProps) {
    const updateQuantityForm = useForm<updateQuantitySchemaType>({
        resolver: zodResolver(updateQuantitySchema),
        defaultValues: {
            quantity: ""
        }
    })

    const updateQuantityMutation = useMutation({
        mutationFn: async function (formData: updateQuantitySchemaType) {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/update-quantity/${inventoryId}?scId=${serviceCenterId}`, formData)
            return response.data
        },
        onSuccess(data: {
            message: string,
            quantityData: number
        }) {
            queryClient.setQueryData(["inventory-items-service-center", serviceCenterId], function (prevData: Inventory[] = []): Inventory[] {
                return prevData.map((inventory) => (
                    inventory.id === inventoryId ? {
                        ...inventory,
                        quantity: data.quantityData
                    } : {
                        ...inventory
                    }
                ))
            })
            updateQuantityForm.reset()
            toast.success(data.message)

        },
        onError(error) {
            toast.error(axios.isAxiosError(error) ? error.response?.data : "Error Encountered")
        }
    })

    function handleFormSubmit(formData: updateQuantitySchemaType) {
        updateQuantityMutation.mutate(formData)
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    Update
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Update the quantity of the {brand}-{name}-{sku}
                    </DialogTitle>
                </DialogHeader>

                <Form {...updateQuantityForm}>
                    <form className='space-y-3' onSubmit={updateQuantityForm.handleSubmit(handleFormSubmit)}>
                        <FormField
                            control={updateQuantityForm.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={updateQuantityMutation.isPending}
                                            {...field}
                                        />
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
                            <Button disabled={updateQuantityMutation.isPending}>
                                {updateQuantityMutation.isPending ? "Updating...." : "Update Quantity"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
