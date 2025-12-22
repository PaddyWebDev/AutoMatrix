import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { InvoiceStatus, Prisma } from "@prisma/client";

async function dynamicWhereClause(whereClause: Prisma.InvoiceWhereInput) {
  const invoices = await prisma.invoice.findMany({
    where: whereClause,
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
  return invoices;
}

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

    let invoices;

    if (status) {
      invoices = await dynamicWhereClause({
        status: status as InvoiceStatus,
        appointment: {
          serviceCenterId: userId,
        },
      });
    } else if (startDate && endDate) {
      invoices = await dynamicWhereClause({
        billingDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        appointment: {
          serviceCenterId: userId,
        },
      });
    } else {
      invoices = await dynamicWhereClause({
        appointment: {
          serviceCenterId: userId,
        },
      });
    }

    const safeInvoices = invoices.map((inv) => ({
      ...inv,
      invoiceCount: inv.invoiceCount.toString(),
    }));

    return NextResponse.json(
      {
        message: "Success",
        invoice_data: safeInvoices,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
