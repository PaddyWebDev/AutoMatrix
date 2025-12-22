import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const notifications = await prisma.serviceCenterNotification.findMany({
      where: {
        serviceCenterId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 15,
    });

    return NextResponse.json(
      { message: "Success", notification_data: notifications },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
