import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AppointmentServiceCenter } from "@/types/service-center";
import { Inventory } from "@prisma/client";


export function useAppointment(appointmentId: string) {
  return useQuery<AppointmentServiceCenter>({
    queryKey: ["appointment-service-center"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/service-centers/appointments/get?appointmentId=${appointmentId}`
      );
      return response.data.appointment_data;
    },
  });
}

export function useInventory(serviceCenterId: string) {
  return useQuery<Inventory[]>({
    queryKey: ["inventory-items-service-center"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/service-centers/inventory?serviceCenterId=${serviceCenterId}`
      );
      return response.data.inventory_data;
    },
  });
}
