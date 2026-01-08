import { bookingStatus, JobCardParts } from "@prisma/client";

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

export type TriageAppointment = {
  id: string;
  vehicleName: string;
  serviceType: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: bookingStatus;
  requestedDate: string;
  slaDeadline: string | null;
  slaBreached: boolean;
  escalated: boolean;
  assignedServiceCenterId: string | null;
  assignedServiceCenterName: string | null;
  customerName: string;
  customerEmail: string;
};

export type Assignment = {
  appointmentId: string;
  serviceCenterId: string;
  assignedBy: string;
  assignedAt: string;
};

export type EscalationRule = {
  id: string;
  condition: "TIME_BASED" | "SEVERITY_BASED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  thresholdHours: number | null;
  autoEscalate: boolean;
  notifyAdmin: boolean;
};

export interface AppointmentAdmin {
  id: string;
  vehicleId: string;
  userId: string;
  serviceType: string;
  requestedDate: string;
  slaDeadline: string | null;
  actualCompletionDate: string | null;
  slaBreached: boolean;
  priority: string;
  status: string;
  serviceCenterId: string;
  Vehicle: {
    id: string;
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: number;
    vehicleType: string;
    numberPlate: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  serviceCenter: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    city: string;
  };
  JobCards: {
    id: string;
    appointmentId: string;
    jobName: string;
    jobDescription: string;
    price: number;
    JobCardParts: JobCardParts[];
  }[];
  Invoice: {
    id: string;
    invoiceCount: number;
    invoiceNumber: string;
    totalAmount: number;
    billingDate: string;
    dueDate: string;
    status: string;
    appointmentId: string;
  } | null;
}

export type AppointmentsResponseAdmin = {
  appointment_data: AppointmentAdmin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export interface FeedbackWithDetails {
  id: string;
  rating: number;
  comment: string | null;
  attachments: string[];
  createdAt: string;
  appointment: {
    id: string;
    serviceType: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
    Vehicle: {
      id: string;
      vehicleName: string;
      numberPlate: string;
    };
    serviceCenter: {
      id: string;
      name: string;
    };
  };
}
