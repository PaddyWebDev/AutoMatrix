import { z } from "zod";

export const updateProfileFormSchema = z.object({
  name: z
    .string()
    .min(5, "Name should be at least 5 characters")
    .max(60, "Name should be maximum 60 characters"),
  email: z
    .string()
    .email()
    .min(5, "Email Should be at least 5 characters")
    .max(40, "Email should be maximum 40 characters"),
});

export type updateProfileFormSchemaType = z.infer<
  typeof updateProfileFormSchema
>;
const numberPlateRegex = /^[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{1,2}[\s-]?\d{1,4}$/;
const currentYear = new Date().getFullYear() + 1;

const vehicleYearRegex = new RegExp(`^(19\\d{2}|20\\d{2}|${currentYear})$`);

export const vehicleSchema = z.object({
  vehicleName: z.string().min(1, "Vehicle name is required"),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  numberPlate: z
    .string({
      message: "Vehicle number plate is required",
    })
    .trim()
    .toUpperCase()
    .refine((val) => numberPlateRegex.test(val), {
      message: "Invalid vehicle number plate format",
    })
    .transform((val) => val.replace(/[\s-]/g, "")),
  vehicleModel: z
    .string()
    .trim()
    .refine((val) => vehicleYearRegex.test(val), {
      message: `Invalid model year. Allowed: 1900 to ${currentYear}`,
    }),
  vehicleType: z.enum(["CAR", "TRUCK", "BIKE"]),
});

export type vehicleSchemaType = z.infer<typeof vehicleSchema>;

export const findServiceCenterByCity = z.object({
  cityName: z
    .string()
    .min(4, "City name should be minimum 4 characters")
    .max(60, "City name should be maximum 60 characters long"),
});

export type findServiceCenterByCityType = z.infer<
  typeof findServiceCenterByCity
>;

export const createAppointmentSchema = z.object({
  // Vehicle that appointment is created for
  vehicleId: z.string().min(1, "Please select a vehicle"),

  // Service type (text input or dropdown)
  serviceType: z.string().min(1, "Please enter the service type"),

  // Chosen service center/location
  serviceCenterId: z.string().min(1, "Please select a service center"),

  // SLA / deadline. Must be future date.
  serviceDeadline: z
    .date({
      message: "Please select a deadline",
    })
    .optional()
    .refine((date) => !date || date > new Date(), {
      message: "Deadline must be a future date",
    }),
  isAccidental: z.boolean(),

  // Photos as base64 strings (optional, only if accidental)
  photos: z.array(z.string()).optional(),
});

export type createAppointmentSchemaType = z.infer<
  typeof createAppointmentSchema
>;

export const createJobCardSchema = z.object({
  jobName: z.string().min(1, "Job Name is Required"),
  jobDescription: z.string().min(1, "Job Description is required"),
  price: z.string(),
});

export type createJobCardSchemaType = z.infer<typeof createJobCardSchema>;

export const updateQuantitySchema = z.object({
  quantity: z
    .string({
      message: "Invalid Quantity",
    })
    .regex(
      /^[1-9]\d*$/,
      "Quantity must be a positive integer greater than zero"
    ),
});
export type updateQuantitySchemaType = z.infer<typeof updateQuantitySchema>;

export const createInventorySchema = z.object({
  name: z.string().min(1, "Name is required"),

  sku: z.string().min(1, "SKU is required"),

  brand: z.string().optional(),

  category: z.string().optional(),

  // Number or Decimal
  unitPrice: z
    .string()
    .min(1, "Unit price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Unit price must be a valid number"),

  // Integer only
  quantity: z
    .string()
    .min(1, "Minimum stock is required")
    .regex(/^\d+$/, "Minimum stock must be a valid whole number"),
});

export type createInventorySchemaType = z.infer<typeof createInventorySchema>;

export const addPartSchema = z.object({
  partId: z.string().min(1, "Part is required"),
  quantity: z
    .string()
    .regex(
      /^(?:[1-9]|[1-4][0-9]|50)$/,
      "Quantity must be an integer between 1 and 50"
    ),
});
export type AddPartForm = z.infer<typeof addPartSchema>;

export const reportFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  serviceCenterId: z.string().optional(),
});

export type ReportFilter = z.infer<typeof reportFilterSchema>;

// Zod schema for mechanic form

export const createMechanicSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  specialty: z.string().optional(),
  experienceYears: z.string().regex(/^(?:[0-9]|[1-4][0-9]|50)$/, {
    message: "Experience must be a number between 0 and 50",
  }),
});

export type CreateMechanicFormData = z.infer<typeof createMechanicSchema>;

export const createPaymentSchema = z.object({
  paymentMethod: z.string().min(1, "Please select a payment method"),
});

export type createPaymentSchemaType = z.infer<typeof createPaymentSchema>;

export const completeServiceSchema = z.object({
  note: z.string().min(5, "Note is required"),
  attachments: z.array(z.string()).optional(),
});

export type completeServiceType = z.infer<typeof completeServiceSchema>;
