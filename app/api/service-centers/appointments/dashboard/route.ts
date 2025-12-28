import prisma from "@/lib/db";
import { NextRequest, NextResponse, } from "next/server";
export async function GET(request: NextRequest) {
  const serviceCenterId = request.nextUrl.searchParams.get("scId")
  try {
    if(!serviceCenterId){
      return new NextResponse("Service Center Id is required", {status: 400})
    }
    const appointmentData = await prisma.appointment.findMany({
      where: {
        serviceCenterId
      },
      orderBy: {
        slaDeadline: "asc",
      },
      select: {
        id: true,
        serviceType: true,
        requestedDate: true,
        status: true,

        // Only required Vehicle fields
        Vehicle: {
          select: {
            vehicleName: true,
            vehicleMake: true,
            vehicleModel: true,
          },
        },

        // Only required Owner fields
        owner: {
          select: {
            name: true,
          },
        },
      },
      take: 7,
    });

    return NextResponse.json(
      {
        appointment_data: appointmentData,
        message: "Success",
      },
      { status: 200 }
    );
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
