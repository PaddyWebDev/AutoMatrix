import queryClient from "@/lib/tanstack-query";
import { Vehicle } from "@prisma/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
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
        `/api/customer/appointments?userId=${userId}`
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
