export interface AppointmentServiceCenter {
  id: string;
  serviceType: string;
  status: string;
  userUrgency: string;
  requestedDate: string;
  slaDeadline: string | null;
  actualCompletionDate: string | null;
  slaBreached: boolean;
  isAccidental: boolean;
  photos: string[];
  Vehicle: {
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: number;
  };
  owner: {
    name: string;
    email: string;
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
        unitPrice: number;
      };
    }[];
  }[];
  Mechanic: {
    mechanicId: string;
    name: string;
  }[];
  Invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    billingDate: string;
    dueDate: string;
    status: string;
  };
}

export interface ServiceCenterAppointmentView {
  id: string;
  serviceType: string;
  status: string;
  userUrgency: string;
  requestedDate: string;
  slaDeadline: string | null;
  actualCompletionDate: string | null;
  slaBreached: boolean;
  Vehicle: {
    vehicleName: string;
    vehicleMake: string;
    vehicleModel: number;
  };
  owner: {
    name: string;
    email: string;
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
        unitPrice: number;
      };
    }[];
  }[];
  MechanicAssignment: {
    mechanic: {
      name: string;
    };
  }[];
  Invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    billingDate: string;
    dueDate: string;
    status: string;
  };
  isAccidental: boolean;
  photos: string[];
}

export interface AppointmentServiceCenterDashboard {
  id: string;
  serviceType: string;
  status: string;
  Vehicle: {
    vehicleMake: string;
    vehicleModel: string;
    vehicleName: string;
  };
  owner: {
    name: string;
  };

  requestedDate: Date;
}
