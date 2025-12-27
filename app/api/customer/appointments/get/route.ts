import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const appointmentId = request.nextUrl.searchParams.get("appointmentId");
  try {
    if (!appointmentId) {
      return new NextResponse("AppointmentId is required", { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      select: {
        id: true,
        requestedDate: true,
        slaDeadline: true,
        actualCompletionDate: true,
        slaBreached: true,
        status: true,
        serviceType: true,
        Vehicle: {
          select: {
            vehicleName: true,
            vehicleMake: true,
            vehicleModel: true,
            vehicleType: true,
            numberPlate: true,
          },
        },
        serviceCenter: {
          select: {
            name: true,
            city: true,
            phoneNumber: true,
          },
        },
        JobCards: {
          select: {
            id: true,
            jobName: true,
            jobDescription: true,
            price: true,
            JobCardParts: {
              select: {
                quantity: true,
                partUsed: {
                  select: {
                    name: true,
                    sku: true,
                    brand: true,
                    category: true,
                    unitPrice: true,
                  },
                },
              },
            },
          },
        },
        Invoice: {
          select: {
            invoiceNumber: true,
            totalAmount: true,
            billingDate: true,
            dueDate: true,
            status: true,
          },
        },
      },
    });

    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    // Calculate on-time delivery status
    const onTime =
      appointment.actualCompletionDate && appointment.slaDeadline
        ? appointment.actualCompletionDate <= appointment.slaDeadline
        : null;

    return NextResponse.json({
      appointment_data: {
        ...appointment,
        onTimeDelivered: onTime,
      },
      message: "Success",
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
