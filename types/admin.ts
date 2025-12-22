export type ServiceCenterReport = {
  serviceCenterId: string;
  serviceCenterName: string;
  complaintVolume: Record<string, number>;
  avgResolutionTime: number;
  slaBreaches: number;
  agentKPIs: {
    totalAppointments: number;
    completionRate: number;
  };
  recurringIssues: [string, number][];
  hotspot: {
    city: string;
    appointmentVolume: number;
    latitude: number | null;
    longitude: number | null;
  };
};
