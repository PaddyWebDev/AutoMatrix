import {  NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const notifications = await prisma.adminNotification.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 15,
    });

    return NextResponse.json(
      { message: "Success", notification_data: notifications },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
