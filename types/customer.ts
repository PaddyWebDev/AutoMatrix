import {
  AppointmentPriority,
  bookingStatus,
  Category,
  InvoiceStatus,
  Vtype,
} from "@prisma/client";

export interface customerInvoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  billingDate: string;
  appointmentId: string;
  serviceCenterId: string;
  customerId: string;
  Payment?: {
    id: string;
    method: string;
    status: string;
    amount: number;
    transactionId: string;
    paidAt: Date;
  };

  appointment: {
    id: string;
    status: string;
    userId: string;
    serviceType: string;
    requestedDate: Date;
    slaDeadline: Date;
    actualCompletionDate: Date;
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
    slaDeadline: Date;
    actualCompletionDate: Date;
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

export type AppointmentViewCustomerRoute = {
  onTimeDelivered: boolean;
  status: bookingStatus;
  id: string;
  serviceType: string;
  requestedDate: Date;
  slaDeadline: Date;
  actualCompletionDate: Date;
  slaBreached: boolean;
  priority: AppointmentPriority;
  Vehicle: {
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: number;
    vehicleType: Vtype;
    numberPlate: string;
  };
  serviceCenter: {
    name: string;
    phoneNumber: string;
    city: string;
  };
  Invoice: {
    invoiceNumber: string;
    totalAmount: number;
    billingDate: Date;
    dueDate: Date;
    status: InvoiceStatus;
  };
  JobCards: {
    id: string;
    jobName: string;
    jobDescription: string;
    price: number;
    JobCardParts: {
      quantity: number;
      partUsed: {
        name: string;
        sku: string;
        brand: string;
        category: Category;
        unitPrice: number;
      };
    }[];
  }[];
};

export type CustomerInvoiceType = {
  appointmentId: string;
  status: InvoiceStatus;
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  billingDate: Date;
  dueDate: Date;
  appointment: {
    status: bookingStatus;
    id: string;
    userId: string;
    serviceType: string;
    requestedDate: Date;
    slaDeadline: Date;
    actualCompletionDate: Date;
    serviceCenterId: string;
    Payment: {
      status: string;
      method: string;
      amount: string;
      paidAt: Date;
      transactionId: string;
    } | null;
    Vehicle: {
      vehicleName: string;
      vehicleMake: string;
      vehicleModel: number;
    };
    serviceCenter: {
      email: string;
      name: string;
      phoneNumber: string;
    };
    JobCards: {
      jobName: string;
      jobDescription: string;
      price: number;
      JobCardParts: {
        quantity: number;
        partUsed: {
          unitPrice: number;
          name: string;
        };
      }[];
    }[];
  };
};
