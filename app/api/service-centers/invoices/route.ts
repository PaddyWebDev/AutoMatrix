import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  try {
    if (!userId) {
      return new NextResponse("User id is required", { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, any> = {
      appointment: {
        serviceCenterId: userId,
      },
    };

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.billingDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        appointment: {
          include: {
            Vehicle: true,
            owner: true,
          },
        },
      },
      orderBy: {
        billingDate: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
