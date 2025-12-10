import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  try {
    if (!userId) {
      return new NextResponse("UserId is required", { status: 400 });
    }

    const appointmentData = await prisma.appointment.findMany({
      where: {
        userId,
      },
    });
    return NextResponse.json({
      message: "Success",
      appointment_data: appointmentData,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
