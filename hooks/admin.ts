import { ReportFilter } from "@/lib/validations/auth-route-forms";
import { ServiceCenterReport } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
