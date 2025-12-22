import { bookingStatus } from "@prisma/client";

export interface customerInvoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  billingDate: string;
  appointmentId: string;
  serviceCenterId: string;
  customerId: string;

  appointment: {
    id: string;
    status: string;
    userId: string;
    serviceType: string;
    requestedDate: Date;
    slaDeadline: Date | null;
    actualCompletionDate: Date | null;
    serviceCenterId: string;
    serviceCenter: {
      name: string;
      email: string;
      phoneNumber: string;
    };
    Vehicle: {
      vehicleName: string;
      vehicleMake: string;
      vehicleModel: string;
    };
    JobCards: {
      id: string;
      jobName: string;
      jobDescription: string;
      price: number;
      JobCardParts: {
        id: string;
        jobCardId: string;
        partId: string;
        quantity: number;
        partUsed: {
          id: string;
          name: string;
          unitPrice: number;
        };
      }[];
    }[];
  };
}

export type customerAppointment = {
  id: string;
  serviceType: string;
  status: bookingStatus;
  serviceCenter: {
    name: string;
    city: string;
    phoneNumber: string;
  };
  requestedDate: Date;
};

export interface AppointmentsResponse {
  success: boolean;
  appointments: {
    status: bookingStatus;
    serviceType: string;
    id: string;
    serviceCenter: {
      name: string;
      phoneNumber: string;
    };
    requestedDate: Date;
    slaDeadline: Date | null;
    actualCompletionDate: Date | null;
    Vehicle: {
      vehicleName: string;
      vehicleMake: string;
      vehicleModel: number;
    };
  }[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
