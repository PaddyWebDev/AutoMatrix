import {
  AppointmentViewCustomerRoute,
  CustomerInvoiceType,
} from "@/types/customer";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ControllerRenderProps } from "react-hook-form";
import toast from "react-hot-toast";

export const useVehicles = (userId?: string) => {
  return useQuery({
    queryKey: ["vehicles", userId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/customer/vehicles?userId=${userId}`
      );
      return response.data.vehicle_data;
    },
    enabled: !!userId,
  });
};

export const useAppointments = (userId?: string) => {
  return useQuery({
    queryKey: ["appointments", userId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/customer/appointments/dashboard?userId=${userId}`
      );
      return response.data.appointment_data;
    },
    enabled: !!userId,
  });
};

export const useServiceCenters = () => {
  return useQuery({
    queryKey: ["serviceCenters"],
    queryFn: async () => {
      const data = await getUserLocation();
      const response = await axios.get(
        `/api/service-centers/nearest?lat=${data?.lat}&lon=${data?.lng}`
      );
      return response.data.service_center_data;
    },
  });
};

export const getUserLocation = (): Promise<{
  lat: number;
  lng: number;
} | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.success("Location detected successfully!");
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to detect location. Please enter manually.");
        resolve(null);
      },
      {
        enableHighAccuracy: true, // Helps with GPS-based devices
        timeout: 10000, // 10 seconds timeout
        maximumAge: 0, // No cached position
      }
    );
  });
};

export function useServiceCentersFetchAll() {
  return useQuery({
    queryKey: ["all-service-centers"],
    queryFn: async () => {
      const response = await axios.get("/api/service-centers");
      return response.data.service_center_data;
    },
  });
}

export function useInvoices(userId: string) {
  return useQuery<Array<CustomerInvoiceType>>({
    queryKey: ["invoices-customer", userId],
    queryFn: async function () {
      try {
        const response = await axios.get(
          `/api/customer/invoices?userId=${userId}`
        );
        return response.data.invoice_data;
      } catch {
        return [];
      }
    },
    enabled: !!userId,
  });
}

export function useCustomerAppointments(appointmentId: string) {
  return useQuery<AppointmentViewCustomerRoute>({
    queryKey: ["customer-appointments", appointmentId],
    enabled: !!appointmentId,
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/customer/appointments/get?appointmentId=${appointmentId}`
        );
        return response.data.appointment_data;
      } catch {
        return [];
      }
    },
  });
}

export function handleFiledUpload(
  field: ControllerRenderProps<
    {
      vehicleId: string;
      serviceType: string;
      serviceCenterId: string;
      isAccidental: boolean;
      serviceDeadline?: Date | undefined;
      photos?: string[] | undefined;
    },
    "photos"
  >,
  e: React.ChangeEvent<HTMLInputElement>
) {
  const files = Array.from(e.target.files || []);
  const promises = files.map((file) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });
  Promise.all(promises).then((base64Strings) => {
    field.onChange(base64Strings);
  });
}
