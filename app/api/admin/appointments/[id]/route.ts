import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const appointmentId = (await params).id;

    if (!appointmentId) {
      return new NextResponse("AppointmentId is required", { status: 400 });
    }
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        Vehicle: true,
        owner: true,
        serviceCenter: true,
        JobCards: {
          include: {
            JobCardParts: true,
          },
        },
        Invoice: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeBigInt(appointment));
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}
