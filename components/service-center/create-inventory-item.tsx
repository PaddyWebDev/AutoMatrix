import { createInventorySchemaType, createInventorySchema } from '@/lib/validations/auth-route-forms'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { categories } from '@/types/service-center';
import axios from 'axios';
import queryClient from '@/lib/tanstack-query';
import { Inventory } from '@prisma/client';

export default function CreateInventoryItem({ serviceCenterId }: { serviceCenterId: string }) {
    const [isPending, startTransition] = React.useTransition()
    const form = useForm<createInventorySchemaType>({
        resolver: zodResolver(createInventorySchema),
        defaultValues: {
            name: "",
            sku: "",
            brand: "",
            category: "",
            unitPrice: "",
            quantity: "",
        }
    })


    async function handleInventoryItemCreation(formData: createInventorySchemaType) {
        startTransition(async () => {
            try {
                const validatedFields = createInventorySchema.safeParse(formData);
                if (validatedFields.error || !validatedFields.data) {
                    toast.error("Failed to validate fields");
                    return;
                }

                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inventory/create`, {
                    ...validatedFields.data,
                    serviceCenterId: serviceCenterId,
                })
                toast.success(response.data.message);
                queryClient.setQueryData(["inventory-items"], function (prevInventoryItems: Inventory[] = []) {
                    return [...prevInventoryItems, response.data.new_inventory_item]
                })
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data || "Failed to add inventory item");
                } else {
                    toast.error("Failed to add inventory item");
                }

            }
        })
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <span>
                    <Button>Add</Button>
                </span>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                        add inventory item by filling the following fields
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleInventoryItemCreation)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Castrol Engine oil" disabled={isPending} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="sku"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock Keeping Unit</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Engine Oil 1L	EO-1L-001" disabled={isPending} {...field} />

                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Castrol" disabled={isPending} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>

                                    <FormControl>
                                        <Select
                                            disabled={isPending}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="unitPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 414" disabled={isPending} {...field} />
                                    </FormControl>
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
                                        <Input placeholder="e.g., 1,2,3" disabled={isPending} {...field} />
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
