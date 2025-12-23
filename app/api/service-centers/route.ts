import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const serviceCenters = await prisma.serviceCenter.findMany({
      orderBy: {
        city: "asc",
      },
      select: {
        id: true,
        name: true,
        city: true,
      },
    });

    return NextResponse.json(
      {
        service_center_data: serviceCenters,
        message: "Success",
      },
      { status: 200 }
    );
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
