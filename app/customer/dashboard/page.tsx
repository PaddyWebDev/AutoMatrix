"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSessionContext } from "@/context/session";
import { useAppointments, useVehicles } from "@/hooks/customer";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import AddVehiclePage from "@/components/customer/new-vehicle-form";
import { Appointment, Vehicle } from "@prisma/client";
import { format } from "date-fns";


export default function CustomerDashboard() {
  const { session } = useSessionContext();
  const { data: vehicles = [], isLoading, isFetching, isError } = useVehicles(session?.user?.id);
  const { data: appointments = [], isLoading: appointmentLoading, isFetching: appointmentFetching, isError: AppointmentError } = useAppointments(session?.user.id)


  if (isLoading || isFetching || appointmentLoading || appointmentFetching) {
    return (
      <Loader />
    )
  }

  if (isError || vehicles === undefined || vehicles.length === undefined || AppointmentError) {
    return (
      <TanstackError />
    )
  }


  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Customer Dashboard</h1>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={"/placeholder-user.jpg"} />
              <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{session?.user.name}</h2>
              <p className="text-gray-600">{session?.user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>My Vehicles</span>
            <AddVehiclePage />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p>No vehicles added yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle: Vehicle) => (
                <Card key={vehicle.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{vehicle.vehicleName}</h3>
                    <p>{vehicle.vehicleMake} {vehicle.vehicleModel}</p>
                    <p>Type: {vehicle.vehicleType}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointments Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.map((appointment: Appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold">{appointment.serviceType}</h3>
                {format(new Date(appointment.requestedDate), "dd MMM yyyy, hh:mm a")}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
