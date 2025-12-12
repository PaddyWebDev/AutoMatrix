"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Edit, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleMake: string;
  vehicleModel: number;
  vehicleType: string;
  service: Array<{
    id: string;
    status: string;
    serviceType: string;
  }>;
}

export default function VehiclesPage() {
  const { data: session, status } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchVehicles();
    }
  }, [session]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/vehicles");
      setVehicles(response.data);
    } catch (error) {
      toast.error("Failed to fetch vehicles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await axios.delete(`http://localhost:3001/api/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v.id !== id));
      toast.success("Vehicle deleted successfully");
    } catch (error) {
      toast.error("Failed to delete vehicle");
      console.error(error);
    }
  };

  if (status === "loading" || loading) return <div className="p-6">Loading...</div>;
  if (!session) return <div className="p-6">Please sign in</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Vehicles</h1>
        <Link href="/customer/vehicles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">No vehicles added yet.</p>
            <Link href="/customer/vehicles/new">
              <Button>Add Your First Vehicle</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{vehicle.vehicleName}</h3>
                    <p className="text-sm text-gray-600">
                      {vehicle.vehicleMake} {vehicle.vehicleModel}
                    </p>
                  </div>
                  <Badge variant="outline">{vehicle.vehicleType}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Service History</h4>
                    {vehicle.service.length === 0 ? (
                      <p className="text-sm text-gray-500">No service history</p>
                    ) : (
                      <div className="space-y-1">
                        {vehicle.service.slice(0, 3).map((service) => (
                          <div key={service.id} className="flex justify-between text-sm">
                            <span>{service.serviceType}</span>
                            <Badge
                              variant={
                                service.status === 'COMPLETED' ? 'default' :
                                service.status === 'InService' ? 'secondary' : 'outline'
                              }
                              className="text-xs"
                            >
                              {service.status}
                            </Badge>
                          </div>
                        ))}
                        {vehicle.service.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{vehicle.service.length - 3} more services
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteVehicle(vehicle.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <Link href={`/customer/appointments/new?vehicleId=${vehicle.id}`}>
                    <Button size="sm" className="w-full">
                      Book Service
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
