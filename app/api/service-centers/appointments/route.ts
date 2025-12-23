import prisma from "@/lib/db";
import { bookingStatus, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

async function dynamicWhereClause(
  where: Prisma.AppointmentWhereInput,
  limit: number,
  skip: number
) {
  return await prisma.appointment.findMany({
    where,
    orderBy: {
      requestedDate: "desc",
    },
    take: limit,
    skip,
    select: {
      id: true,
      serviceType: true,
      status: true,
      requestedDate: true,
      actualCompletionDate: true,
      userUrgency: true,
      slaDeadline: true,
      Vehicle: {
        select: {
          vehicleName: true,
          vehicleMake: true,
          vehicleModel: true,
        },
      },
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  try {
    const serviceCenterId = searchParams.get("userId");
    if (!serviceCenterId) {
      return new NextResponse("Service Center Id is required", {
        status: 400,
      });
    }
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");
    const serviceType = searchParams.get("serviceType");

    let appointments;
    if (status) {
      appointments = await dynamicWhereClause(
        {
          status: status as bookingStatus,
        },
        limit,
        skip
      );
    } else if (serviceType) {
      appointments = await dynamicWhereClause(
        {
          serviceType,
        },
        limit,
        skip
      );
    } else {
      appointments = await dynamicWhereClause(
        {
          serviceCenterId,
        },
        limit,
        skip
      );
    }

    const totalPages = Math.ceil(appointments.length / limit);

    return NextResponse.json({
      success: true,
      appointments,
      totalCount: appointments.length,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
