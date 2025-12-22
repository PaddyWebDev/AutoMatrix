import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ownerId = request.nextUrl.searchParams.get("userId");
  try {
    if (!ownerId) {
      return new NextResponse("Owner id is required", { status: 400 });
    }

    const checkIfOwnerExist = await prisma.user.findUnique({
      where: {
        id: ownerId,
      },
      select: {
        name: true,
      },
    });
    if (!checkIfOwnerExist) {
      return new NextResponse("User Not Found", { status: 404 });
    }

    const appointment = await prisma.appointment.findMany({
      where: {
        userId: ownerId,
      },
      select: {
        id: true,
        status: true,
        requestedDate: true,
        serviceType: true,
        serviceCenter: {
          select: {
            city: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
      },
      take: 5,
    });

    return NextResponse.json({
      message: "Success",
      appointment_data: appointment,
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
