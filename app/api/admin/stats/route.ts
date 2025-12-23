import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await Promise.all([
      await prisma.user.count(),
      await prisma.serviceCenter.count(),
      await prisma.appointment.count(),
      await prisma.invoice.count(),
    ]);
    return NextResponse.json({
      stats: data,
      message: "Success",
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
