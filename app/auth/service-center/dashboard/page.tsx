"use client";

import { useQuery, } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useSessionContext } from "@/context/session";
import axios from "axios";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import { format } from "date-fns";
// import { AppointmentServiceCenterDashboard } from "@/types/service-center";
import { Badge } from "@/components/ui/badge";
import { AppointmentServiceCenterDashboard } from "@/types/service-center";



export default function ServiceCenterDashboard() {
  const { session } = useSessionContext();



  const { data: appointments, isLoading, isError, isFetching } = useQuery<AppointmentServiceCenterDashboard[]>({
    queryKey: ['appointments', session?.user.id],
    queryFn: async () => {
      const response = await axios.get(`/api/service-centers/appointments/dashboard?scId=${session?.user.id}`)
      return response.data.appointment_data
    },
    enabled: !!session?.user.id,
  });

  if (isLoading || isFetching) {
    return (
      <Loader />
    )
  }

  if (isError || appointments === undefined || appointments.length === undefined) {
    return (
      <TanstackError />
    )
  }




  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Service Center Dashboard</h1>

      {/* Profile Section */}
      <Card className="dark:bg-neutral-800 bg-neutral-100">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <div className="flex items-center space-x-4 dark:bg-neutral-950 bg-neutral-50 p-3 rounded-md shadow-md">
            <Avatar className="h-20 w-20">
              <AvatarImage src={"/placeholder-logo.png"} />
              <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{session?.user?.name}</h2>
              <p className="text-gray-600">{session?.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Section */}
      <Card className="dark:bg-neutral-800 bg-neutral-100">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Appointments</h1>
            <Link href="/auth/service-center/appointments">
              <Button>View All</Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>

          <div className="space-y-4 dark:bg-neutral-950 bg-neutral-50 rounded-md shadow-md">
            {appointments.map((appointment) => (
              <Link href={`/auth/service-center/appointments/${appointment.id}`} key={appointment.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <h3 className="font-semibold">{appointment.serviceType}</h3>
                  <p>{appointment.Vehicle.vehicleName} - {appointment.Vehicle.vehicleMake} {appointment.Vehicle.vehicleModel}</p>
                  <p>Customer: {appointment.owner.name}</p>
                  <p>Requested: {format(new Date(appointment.requestedDate), "dd MMM yyyy, hh:mm a")}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={appointment.status === 'PENDING' ? 'secondary' : appointment.status === "COMPLETED" ? 'default' : 'outline'}>
                    {appointment.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/auth/service-center/inventory">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-neutral-800 bg-neutral-100">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold">Manage Inventory</h3>
              <p className="text-gray-600">Add, update, and track parts</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/auth/service-center/invoices">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-neutral-800 bg-neutral-100">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold">Invoices</h3>
              <p className="text-gray-600">Generate and manage invoices</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/auth/service-center/reports">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-neutral-800 bg-neutral-100">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold">Reports</h3>
              <p className="text-gray-600">View analytics and reports</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
