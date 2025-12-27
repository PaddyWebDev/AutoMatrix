"use client";

import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { useCustomerAppointments } from '@/hooks/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Car, Wrench, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Loader from '@/components/Loader';

export default function CustomerAppointments() {
  const { Id } = useParams();
  const router = useRouter();

  const { data: appointment, isLoading, error } = useCustomerAppointments(Id as string);

  if (!Id) {
    router.push("/auth/customer/dashboard");
    return null;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold">Error Loading Appointment</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-4 text-lg font-semibold">Appointment Not Found</h2>
          <p className="text-gray-600">The requested appointment could not be found.</p>
        </div>
      </div>
    );
  }

  // Implement sockets and reflect the real time data updation for appointment

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500';
      case 'InService': return 'bg-blue-500';
      case 'APPROVED': return 'bg-yellow-500';
      case 'PENDING': return 'bg-gray-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getOnTimeIcon = (onTime: boolean | null) => {
    if (onTime === null) return <AlertCircle className="h-5 w-5 text-gray-500" />;
    return onTime ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Appointment Details</h1>
        <Badge className={`${getStatusColor(appointment.status)} text-white`}>
          {appointment.status}
        </Badge>
      </div>

      {/* Appointment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Vehicle:</span>
              <span>{appointment.Vehicle.vehicleName} ({appointment.Vehicle.vehicleMake} {appointment.Vehicle.vehicleModel})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">License Plate:</span>
              <span>{appointment.Vehicle.numberPlate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Requested Date:</span>
              <span>{new Date(appointment.requestedDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">SLA Deadline:</span>
              <span>{appointment.slaDeadline ? new Date(appointment.slaDeadline).toLocaleDateString() : 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Service Type:</span>
              <span>{appointment.serviceType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Priority:</span>
              <Badge variant="outline">{appointment.priority}</Badge>
            </div>
          </div>

          {/* Delivery Status */}
          <Separator />
          <div className="flex items-center gap-2">
            {getOnTimeIcon(appointment.onTimeDelivered)}
            <span className="font-medium">On-Time Delivery:</span>
            <span>
              {appointment.onTimeDelivered === null
                ? 'Not completed yet'
                : appointment.onTimeDelivered
                  ? 'Delivered on time'
                  : 'Delivered late'
              }
            </span>
          </div>
          {appointment.actualCompletionDate && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">Completion Date:</span>
              <span>{new Date(appointment.actualCompletionDate).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Center Info */}
      <Card>
        <CardHeader>
          <CardTitle>Service Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{appointment.serviceCenter.name}</p>
            <p className="text-gray-600">{appointment.serviceCenter.city}</p>
            <p className="text-gray-600">{appointment.serviceCenter.phoneNumber}</p>
          </div>
        </CardContent>
      </Card>

      {/* Services Performed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Services Performed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointment.JobCards.length > 0 ? (
            <div className="space-y-4">
              {appointment.JobCards.map((jobCard) => (
                <div key={jobCard.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{jobCard.jobName}</h3>
                    <span className="text-lg font-semibold">₹{jobCard.price}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{jobCard.jobDescription}</p>
                  {jobCard.JobCardParts.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Parts Used:</h4>
                      <div className="space-y-1">
                        {jobCard.JobCardParts.map((part, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{part.partUsed.name} ({part.partUsed.brand}) - Qty: {part.quantity}</span>
                            <span>₹{part.partUsed.unitPrice * part.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No services recorded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Parts Changed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Parts Changed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointment.JobCards.some(jobCard => jobCard.JobCardParts.length > 0) ? (
            <div className="space-y-2">
              {appointment.JobCards.flatMap(jobCard =>
                jobCard.JobCardParts.map((part, index) => (
                  <div key={`${jobCard.id}-${index}`} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{part.partUsed.name}</p>
                      <p className="text-sm text-gray-600">
                        {part.partUsed.brand} • {part.partUsed.category} • SKU: {part.partUsed.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Qty: {part.quantity}</p>
                      <p className="text-sm">₹{part.partUsed.unitPrice} each</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="text-gray-600">No parts changed.</p>
          )}
        </CardContent>
      </Card>

      {/* Invoice */}
      {appointment.Invoice && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Invoice Number:</p>
                <p>{appointment.Invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="font-medium">Total Amount:</p>
                <p className="text-lg font-semibold">₹{appointment.Invoice.totalAmount}</p>
              </div>
              <div>
                <p className="font-medium">Billing Date:</p>
                <p>{new Date(appointment.Invoice.billingDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium">Due Date:</p>
                <p>{new Date(appointment.Invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium">Status:</p>
                <Badge variant={appointment.Invoice.status === 'PAID' ? 'default' : 'secondary'}>
                  {appointment.Invoice.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
