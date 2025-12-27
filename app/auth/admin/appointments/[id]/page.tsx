"use client"
import React from 'react';
import { useAppointmentDetailsAdmin } from '@/hooks/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import TanstackError from '@/components/TanstackError';



export default function AppointmentDetailPage() {
  const router = useRouter()
  const { id } = useParams();
  if (!id) {
    router.push("/auth/admin/dashboard")
  }
  const { data: appointment, isLoading, isFetching, error } = useAppointmentDetailsAdmin(id as string);

  if (isLoading || isFetching) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <TanstackError />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/auth/admin/appointments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Appointment Details</h1>
        <Badge variant={appointment.status === 'COMPLETED' ? 'default' : 'secondary'}>
          {appointment.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Appointment ID</label>
              <p className="text-sm text-muted-foreground">{appointment.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Service Type</label>
              <p className="text-sm text-muted-foreground">{appointment.serviceType}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Badge variant={appointment.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                {appointment.priority}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Requested Date</label>
              <p className="text-sm text-muted-foreground">
                {new Date(appointment.requestedDate).toLocaleString()}
              </p>
            </div>
            {appointment.slaDeadline && (
              <div>
                <label className="text-sm font-medium">SLA Deadline</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.slaDeadline).toLocaleString()}
                </p>
              </div>
            )}
            {appointment.actualCompletionDate && (
              <div>
                <label className="text-sm font-medium">Completion Date</label>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.actualCompletionDate).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">SLA Breached</label>
              <Badge variant={appointment.slaBreached ? 'destructive' : 'default'}>
                {appointment.slaBreached ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground">{appointment.owner.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{appointment.owner.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <p className="text-sm text-muted-foreground">{appointment.owner.phoneNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground">{appointment.Vehicle.vehicleName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Make & Model</label>
              <p className="text-sm text-muted-foreground">
                {appointment.Vehicle.vehicleMake} {appointment.Vehicle.vehicleModel}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <p className="text-sm text-muted-foreground">{appointment.Vehicle.vehicleType}</p>
            </div>
            <div>
              <label className="text-sm font-medium">License Plate</label>
              <p className="text-sm text-muted-foreground">{appointment.Vehicle.numberPlate}</p>
            </div>
          </CardContent>
        </Card>

        {/* Service Center Info */}
        <Card>
          <CardHeader>
            <CardTitle>Service Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground">{appointment.serviceCenter.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <p className="text-sm text-muted-foreground">{appointment.serviceCenter.city}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{appointment.serviceCenter.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <p className="text-sm text-muted-foreground">{appointment.serviceCenter.phoneNumber}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Cards */}
      {appointment.JobCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointment.JobCards.map((jobCard) => (
                <div key={jobCard.id} className="border rounded-lg p-4">
                  <h4 className="font-medium">{jobCard.jobName}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{jobCard.jobDescription}</p>
                  <p className="text-sm font-medium">Price: ₹{jobCard.price}</p>
                  {jobCard.JobCardParts.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Parts Used:</p>
                      <ul className="text-sm text-muted-foreground">
                        {jobCard.JobCardParts.map((part) => (
                          <li key={part.id}>Part ID: {part.partId} - Quantity: {part.quantity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice */}
      {appointment.Invoice && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Invoice Number</label>
              <p className="text-sm text-muted-foreground">{appointment.Invoice.invoiceNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Total Amount</label>
              <p className="text-sm text-muted-foreground">₹{appointment.Invoice.totalAmount}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Badge variant={appointment.Invoice.status === 'PAID' ? 'default' : 'secondary'}>
                {appointment.Invoice.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Billing Date</label>
              <p className="text-sm text-muted-foreground">
                {new Date(appointment.Invoice.billingDate).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <p className="text-sm text-muted-foreground">
                {new Date(appointment.Invoice.dueDate).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
