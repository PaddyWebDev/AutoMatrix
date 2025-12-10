"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSessionContext } from "@/context/session";
import { vehicleSchema, vehicleSchemaType } from "@/lib/validations/auth-route-forms";
import { Dialog, DialogFooter, DialogTrigger, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import axios from "axios";
import toast from "react-hot-toast";
import queryClient from "@/lib/tanstack-query";
import { Vehicle } from "@prisma/client";



export default function AddVehiclePage() {
    const { session } = useSessionContext()
    const [isPending, startTransition] = React.useTransition();

    const form = useForm<vehicleSchemaType>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            vehicleName: "",
            vehicleMake: "",
            vehicleModel: "",
            numberPlate: "",
            vehicleType: "CAR",
        },
    });

    const onSubmit = (values: vehicleSchemaType) => {
        startTransition(async () => {
            try {
                const validatedFields = vehicleSchema.safeParse(values);
                if (validatedFields.error || !validatedFields.data) {
                    toast.error("Failed to validated fields")
                    return;
                }
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/vehicles/add`,
                    {
                        ...validatedFields.data,
                        userId: session?.user.id,
                    }
                );
                queryClient.setQueryData<Vehicle[]>(
                    ["vehicles", session?.user.id],
                    (prevVehicles: Vehicle[] = []) => {
                        return [...prevVehicles, response.data.new_vehicle as Vehicle];
                    }
                );
                toast.success(response.data.message)
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data || "Failed to add vehicle")
                } else {
                    toast.error("Failed to add vehicle")
                }
            }
        })
    };



    return (
        <Dialog >
            <DialogTrigger asChild>
                <Button>Add Vehicle</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                    <DialogDescription>
                        Fill all the details to register your vehicle
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="vehicleName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., My Honda Civic" disabled={isPending} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="vehicleMake"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle Make</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Honda" disabled={isPending} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="vehicleModel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model Year</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="e.g., 2020"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="vehicleType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                        <FormControl>
                                            <SelectTrigger className="w-full" >
                                                <SelectValue placeholder="Select vehicle type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CAR">Car</SelectItem>
                                            <SelectItem value="TRUCK">Truck</SelectItem>
                                            <SelectItem value="BIKE">Bike</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="numberPlate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number Plate</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., MH12XX12345" disabled={isPending} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="sm:justify-start">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" disabled={isPending}>
                                    Close
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Adding..." : "Add Vehicle"}
                            </Button>
                        </DialogFooter>

                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
