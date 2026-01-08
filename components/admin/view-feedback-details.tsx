import React from 'react'
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { User, Car, Building, Check, AlertTriangle, Eye } from "lucide-react";
import { Badge } from '../ui/badge';
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import queryClient from '@/lib/tanstack-query';
import axios from 'axios';
import { FeedbackWithDetails } from '@/types/admin';


type ViewFeedBackDetailsProps = {
    selectedFeedback: {
        id: string;
        rating: number;
        comment: string | null;
        attachments: string[];
        createdAt: string;
        appointment: {
            id: string;
            serviceType: string;
            owner: {
                id: string;
                name: string;
                email: string;
            };
            Vehicle: {
                id: string;
                vehicleName: string;
                numberPlate: string;
            };
            serviceCenter: {
                id: string;
                name: string;
            };
        };
    }

    renderStars: (rating: number) => Array<React.ReactNode>
}

export default function ViewFeedBackDetails({ selectedFeedback, renderStars }: ViewFeedBackDetailsProps) {

    const verifyFeedbackMutation = useMutation({
        mutationFn: async ({ isBreached }: { isBreached: boolean }) => {
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${selectedFeedback.appointment.id}/feedback/${selectedFeedback.id}/verify`, {
                isBreached: isBreached
            });
        },
        onSuccess: () => {
            queryClient.setQueryData(["admin-feedback"], function (prevData: FeedbackWithDetails[] = []): FeedbackWithDetails[] {
                return prevData.filter((data) => data.id !== selectedFeedback.id)
            })
            toast.success("Feedback verified successfully");

        },
        onError: () => {
            toast.error("Failed to verify feedback");
        },
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="sm"

                    className="flex-1"
                >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Feedback Details</DialogTitle>
                </DialogHeader>
                {selectedFeedback && (
                    <div className="space-y-6">
                        {/* Feedback Rating and Service */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                                {renderStars(selectedFeedback.rating)}
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {selectedFeedback.rating}/5
                            </Badge>
                        </div>
                        <h3 className="text-lg font-semibold">
                            {selectedFeedback.appointment.serviceType}
                        </h3>

                        {/* Customer Comment */}
                        {selectedFeedback.comment && (
                            <div>
                                <Label className="text-sm font-medium">Customer Comment</Label>
                                <p className="text-sm text-muted-foreground italic mt-1">
                                    &ldquo;{selectedFeedback.comment}&rdquo;
                                </p>
                            </div>
                        )}

                        {/* Customer Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Customer Information</Label>
                                <div className="flex items-center space-x-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{selectedFeedback.appointment.owner.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {selectedFeedback.appointment.owner.email}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Vehicle Information</Label>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Car className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedFeedback.appointment.Vehicle.vehicleName}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {selectedFeedback.appointment.Vehicle.numberPlate}
                                </p>
                            </div>
                        </div>

                        {/* Service Center */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Service Center</Label>
                            <div className="flex items-center space-x-2 text-sm">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedFeedback.appointment.serviceCenter.name}</span>
                            </div>
                        </div>

                        {/* Customer Attachments */}
                        {selectedFeedback.attachments.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Customer Attachments</Label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedFeedback.attachments.map((attachment, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            Image {index + 1}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}



                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => verifyFeedbackMutation.mutate({

                                    isBreached: false
                                })}
                                disabled={verifyFeedbackMutation.isPending}
                                className="flex-1"
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Verify Feedback
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => verifyFeedbackMutation.mutate({

                                    isBreached: true
                                })}
                                disabled={verifyFeedbackMutation.isPending}
                                className="flex-1"
                            >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Mark as Breached
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
