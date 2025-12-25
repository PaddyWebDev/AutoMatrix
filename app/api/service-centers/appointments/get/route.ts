import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const appointmentId = request.nextUrl.searchParams.get("appointmentId");
  try {
    if (!appointmentId) {
      return new NextResponse("Appointment Id is required", { status: 400 });
    }
    const data = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      select: {
        id: true,
        serviceType: true,
        status: true,
        requestedDate: true,
        actualCompletionDate: true,
        isAccidental: true,
        photos: true,
        slaDeadline: true,
        Mechanic: {
          select: {
            id: true,
            name: true,
          },
        },
        Vehicle: {
          select: {
            vehicleName: true,
            vehicleMake: true,
            vehicleModel: true,
          },
        },
        owner: {
          select: {
            email: true,
            name: true,
          },
        },
        Invoice: {
          select: {
            billingDate: true,
          },
        },
        JobCards: {
          select: {
            jobDescription: true,
            id: true,
            jobName: true,
            price: true,
            JobCardParts: {
              select: {
                partId: true,
                quantity: true,
                partUsed: {
                  select: {
                    unitPrice: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Success",
        appointment_data: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
