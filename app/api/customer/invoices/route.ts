import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  try {
    if (!userId) {
      return new NextResponse("UserId is required");
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        appointment: {
          userId: userId,
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
        totalAmount: true,
        billingDate: true,
        dueDate: true,
        status: true,
        appointmentId: true,
        appointment: {
          select: {
            Payment: {
              select: {
                status: true,
                method: true,
                amount: true,
                paidAt: true,
                transactionId: true,
              },
            },
            Vehicle: {
              select: {
                vehicleName: true,
                vehicleMake: true,
                vehicleModel: true,
              },
            },
            id: true,
            status: true,
            userId: true,
            serviceType: true,
            requestedDate: true,
            slaDeadline: true,
            actualCompletionDate: true,
            serviceCenterId: true,
            serviceCenter: {
              select: {
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
            JobCards: {
              select: {
                jobName: true,
                jobDescription:true,
                JobCardParts: {
                  select: {
                    quantity: true,
                    partUsed: {
                      select: {
                        unitPrice: true,
                        name: true,
                      },
                    },
                  },
                },
                price: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        invoice_data: invoices,
        message: "Success",
      },
      { status: 200 }
    );
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
