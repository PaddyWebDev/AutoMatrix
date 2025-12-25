import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where:Prisma.AppointmentWhereInput = search
      ? {
          OR: [
            { serviceType: { contains: search, mode: "insensitive" } },
            { Vehicle: { vehicleName: { contains: search, mode: "insensitive" } } },
            { Vehicle: { vehicleMake: { contains: search, mode: "insensitive" } } },
            { owner: { name: { contains: search, mode: "insensitive" } } },
            { owner: { email: { contains: search, mode: "insensitive" } } },
            { serviceCenter: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          Vehicle: true,
          owner: true,
          serviceCenter: true,
          JobCards: true,
          Invoice: true,
        },
        skip,
        take: limit,
        orderBy: { requestedDate: "desc" },
      }),
      prisma.appointment.count({ where }),
    ]);

    const serializedAppointments = appointments.map((appointment) => ({
  ...appointment,
  Invoice: appointment.Invoice
    ? {
        ...appointment.Invoice,
        invoiceCount: appointment.Invoice.invoiceCount.toString(),
      }
    : null,
}));


    return NextResponse.json({
      appointment_data: serializedAppointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch  {
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
