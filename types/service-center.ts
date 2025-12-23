import { AppointmentPriority, bookingStatus } from "@prisma/client";

export type AppointmentServiceCenter = {
  id: string;
  status: bookingStatus;
  serviceType: string;
  requestedDate: Date;
  slaDeadline: Date | null;
  actualCompletionDate: Date | null;
  Vehicle: {
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: number;
  };
  MechanicAssignment: Array<{
    mechanicId: string;
    mechanic: {
      name: string;
    };
  }>;

  owner: {
    email: string;
    name: string;
  };
  Invoice: {
    billingDate: true;
  };
  JobCards: Array<{
    id: string;
    jobName: string;
    price: number;
    jobDescription: string;
    JobCardParts: {
      partId: string;
      quantity: number;
      partUsed: {
        name: string;
        unitPrice: number;
      };
    }[];
  }>;
};

export const categories: Array<{
  label: string;
  value: string;
}> = [
  { label: "Engine Parts", value: "ENGINE_PARTS" },
  { label: "Electrical", value: "ELECTRICAL" },
  { label: "Brake System", value: "BRAKE_SYSTEM" },
  { label: "Suspension", value: "SUSPENSION" },
  { label: "Fluids", value: "FLUIDS" },
  { label: "Tools", value: "TOOLS" },
  { label: "Body Parts", value: "BODY_PARTS" },
  { label: "Accessories", value: "ACCESSORIES" },
  { label: "Misc", value: "MISC" },
];

export type AppointmentServiceCenterDashboard = {
  id: string;
  status: bookingStatus;
  serviceType: string;
  Vehicle: {
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: number;
  };
  requestedDate: Date;
  owner: {
    name: string;
  };
}[];

export type Mechanic = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  speciality: string;
  status: string;
};

export interface ServiceCenterAppointment {
  id: string;
  serviceType: string;
  status: string;
  requestedDate: string;
  actualCompletionDate?: string;
  userUrgency: AppointmentPriority;
  slaDeadline?: string;
  Vehicle: {
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: string;
  };
  owner: {
    name: string;
    email: string;
  };
}
