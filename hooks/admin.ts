import queryClient from "@/lib/tanstack-query";
import { ReportFilter } from "@/lib/validations/auth-route-forms";
import { AppointmentAdmin, AppointmentsResponseAdmin, ServiceCenterReport, TriageAppointment } from "@/types/admin";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from 'react-hot-toast'

export function useServiceCentersForAdminReports() {
  return useQuery<{ name: string; city: string; id: string }[]>({
    queryKey: ["service-center-admin"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/admin/service-centers`);
        return response.data.service_center_data || [];
      } catch {
        return [];
      }
    },
  });
}
export function useReportsForAdmin(filters: ReportFilter) {
  return useQuery<ServiceCenterReport[]>({
    queryKey: ["service-center-reports", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.serviceCenterId)
        params.append("serviceCenterId", filters.serviceCenterId);

      const response = await axios.get(
        `/api/admin/reports/service-centers?${params.toString()}`
      );
      return response.data.reports;
    },
  });
}

export function useTriageAppointments() {
  return useQuery<TriageAppointment[]>({
    queryKey: ["triage-appointments"],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/triage`);
      return response.data.appointments;
    },
  });
}

export function useAssignAppointment() {
  return useMutation({
    mutationFn: async (data: { appointmentId: string; serviceCenterId: string }) => {
      const response = await axios.post(`/api/admin/triage/assign`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triage-appointments"] });
      toast.success("Appointment assigned successfully");
    },
    onError: () => {
      toast.error("Failed to assign appointment");
    },
  });
}

export function useEscalateAppointment() {
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await axios.post(`/api/admin/triage/escalate`, { appointmentId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triage-appointments"] });
      toast.success("Appointment escalated");
    },
    onError: () => {
      toast.error("Failed to escalate appointment");
    },
  });
}


export function useAppointments(page: number = 1, limit: number = 10, search: string = "") {
  return useQuery<AppointmentsResponseAdmin>({
    queryKey: ["admin-appointments", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);

      const response = await axios.get(`/api/admin/appointments?${params.toString()}`);
      return response.data;
    },
  });
}

export function useAppointmentDetails(id: string) {
  return useQuery<AppointmentAdmin>({
    queryKey: ["admin-appointment", id],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/appointments/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
