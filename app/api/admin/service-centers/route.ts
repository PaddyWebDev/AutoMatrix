import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const serviceCenterData = await prisma.serviceCenter.findMany({
      select: {
        name: true,
        city: true,
        id: true,
      },
    });
    return NextResponse.json({
      message: "Success",
      service_center_data: serviceCenterData,
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
