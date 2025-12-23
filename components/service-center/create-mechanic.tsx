import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreateMechanicFormData, createMechanicSchema } from '@/lib/validations/auth-route-forms';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type CreateMechanicProps = {
    serviceCenterId: string;
}

export default function CreateMechanic({ serviceCenterId }: CreateMechanicProps) {

    const form = useForm<CreateMechanicFormData>({
        resolver: zodResolver(createMechanicSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            specialty: "",
            experienceYears: "",
        },
    });

    const addMechanicMutation = useMutation({
        mutationFn: async (data: CreateMechanicFormData) => {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/service-center/${serviceCenterId}/mechanic/create`, { ...data });
        },
        onSuccess: () => {
            form.reset();
            toast.success("Mechanic Created Successfully");
        },
        onError: () => {
            toast.error("Error Occurred")
        },
    });

    const onSubmit = (data: CreateMechanicFormData) => {
        addMechanicMutation.mutate(data);
    };

    return (
        <Dialog >
            <DialogTrigger asChild>
                <Button>Add Mechanic</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Mechanic</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mechanic Name"
                                            disabled={addMechanicMutation.isPending}
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="mechanic@example.com"
                                            disabled={addMechanicMutation.isPending}
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1234567890"
                                            disabled={addMechanicMutation.isPending}
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="experienceYears"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Experience(Years)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1234567890"
                                            disabled={addMechanicMutation.isPending}
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="specialty"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Specialty (Optional)</FormLabel>
                                    <FormControl>
                                        <Select
                                            disabled={addMechanicMutation.isPending}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    [
                                                        "ENGINE",
                                                        "BRAKES",
                                                        "ELECTRICAL",
                                                        "SUSPENSION",
                                                        "TRANSMISSION",
                                                        "BODYWORK",
                                                        "GENERAL_SERVICE"
                                                    ].map((specialty, index: number) => (
                                                        <SelectItem key={index} value={specialty}>{specialty}</SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={addMechanicMutation.isPending}>
                            {addMechanicMutation.isPending ? "Adding..." : "Add Mechanic"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
