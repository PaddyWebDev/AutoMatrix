"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSessionContext } from "@/context/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import CreateMechanic from "@/components/service-center/create-mechanic";
import { Mechanic } from "@/types/service-center";
import socket from "@/lib/socket-io";
import queryClient from "@/lib/tanstack-query";
import { decryptSocketData } from "@/hooks/cryptr";
import { DeleteMechanicDialog } from "@/components/service-center/delete-mechanic";


export default function MechanicsPage() {
  const { session } = useSessionContext();
  const serviceCenterId = session?.user?.id;

  const { data: mechanics, isLoading, error, isFetching } = useQuery<Mechanic[]>({
    queryKey: ["service-center-mechanic", serviceCenterId],
    queryFn: async () => {
      const response = await axios.get(`/api/service-centers/mechanics?serviceCenterId=${serviceCenterId}`);
      return response.data.mechanic_data;
    },
    enabled: !!serviceCenterId,
  });

  React.useEffect(() => {
    socket.connect();
    socket.on(`new-mechanic-${serviceCenterId}`, async function (newMechanic: string) {
      const data: Mechanic = await decryptSocketData(newMechanic)
      queryClient.setQueryData(["service-center-mechanic", serviceCenterId], function (prevData: Mechanic[] = []): Mechanic[] {
        if (!prevData) return prevData;
        return [...prevData, data]
      })
    })
    return () => {
      socket.off(`new-mechanic-${serviceCenterId}`)
    }
  }, [serviceCenterId])

  // Add mechanic mutation
  if (isLoading || isFetching) return <Loader />;
  if (error) return <TanstackError />;



  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Mechanics</CardTitle>
          <div>
            <CreateMechanic serviceCenterId={serviceCenterId!} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mechanics?.map((mechanic) => (
                <TableRow key={mechanic.id}>
                  <TableCell>{mechanic.name}</TableCell>
                  <TableCell>{mechanic.email}</TableCell>
                  <TableCell>{mechanic.phoneNumber || "N/A"}</TableCell>
                  <TableCell>{mechanic.speciality || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={mechanic.status === "ACTIVE" ? "default" : "secondary"}>
                      {mechanic.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {/* TODO: Add edit/delete buttons */}
                    <Button variant="outline" size="sm">Edit</Button>
                    <DeleteMechanicDialog serviceCenterId={serviceCenterId as string} mechanicId={mechanic.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
