"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSessionContext } from "@/context/session";
import { useAppointments, useVehicles } from "@/hooks/customer";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import AddVehiclePage from "@/components/customer/new-vehicle-form";
import {  Vehicle } from "@prisma/client";
import { format } from "date-fns";
import { customerAppointment } from "@/types/customer";


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
      <Card className="dark:bg-neutral-800 bg-neutral-100">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 dark:bg-neutral-950 bg-neutral-50 shadow-md p-5 rounded-md">
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
      <Card className="dark:bg-neutral-800 bg-neutral-100">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">My Vehicles</h1>
            <AddVehiclePage />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p>No vehicles added yet.</p>
          ) : (
            <div className="flex items-center justify-start gap-4 dark:bg-neutral-950 bg-neutral-50 shadow-md rounded-md p-5">
              {vehicles.map((vehicle: Vehicle) => (
                <Card key={vehicle.id} className="w-[300px]">
                  <CardHeader className="-mb-4">
                    <CardTitle className="text-xl font-bold text-center">
                      {vehicle.vehicleName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className=" px-4 flex items-center justify-center">
                    <div>
                      <p><strong>Company:</strong> {vehicle.vehicleMake} <strong>Model: </strong> {vehicle.vehicleModel}</p>
                      <p><strong>Type:</strong> {vehicle.vehicleType}</p>
                      <p><strong>Number Plate:</strong> {vehicle.numberPlate}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointments Section */}
      <Card className="dark:bg-neutral-800 bg-neutral-100">
        <CardHeader className="">
          <CardTitle className="text-3xl font-bold">My Appointments</CardTitle>
        </CardHeader>
        <CardContent className="dark:bg-neutral-950 bg-neutral-50 p-5 rounded-md mx-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment: customerAppointment) => (
            <Card key={appointment.id} className="">
              <CardHeader className="-mb-10">
                <CardTitle className="text-2xl font-bold text-center">
                  {appointment.serviceType}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center mt-0">
                <div>
                  <p>
                    <strong>Service Center:</strong> {appointment.serviceCenter.name}
                  </p>
                  <p>
                    <strong>Service Center City:</strong> {appointment.serviceCenter.city}
                  </p>
                  <p>
                    <strong>Service Center Phone Number:</strong> {appointment.serviceCenter.phoneNumber}
                  </p>
                  <p>
                    <strong>Requested Date: </strong>{format(new Date(appointment.requestedDate), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
