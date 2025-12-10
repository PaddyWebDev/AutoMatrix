import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const serviceCenterId = request.nextUrl.searchParams.get("serviceCenterId");
  try {
    if (!serviceCenterId) {
      return new NextResponse("Service Center Id is required");
    }

    const inventoryItems = await prisma.inventory.findMany({
      where: {
        serviceCenterId,
      },
    });

    return NextResponse.json(
      {
        message: "Success",
        inventory_data: inventoryItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
