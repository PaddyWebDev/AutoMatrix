import {  NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const feedback = await prisma.feedback.findMany({
      include: {
        appointment: {
          include: {
            owner: true,
            Vehicle: true,
            serviceCenter: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { message: "Success", feedback_data: feedback },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
