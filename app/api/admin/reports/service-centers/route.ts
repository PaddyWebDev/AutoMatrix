import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const serviceCenterId = searchParams.get("serviceCenterId");

  const where: Prisma.AppointmentWhereInput = {};
  if (startDateStr) {
    where.requestedDate = { gte: new Date(startDateStr) };
  }
  if (endDateStr) {
    if (!where.requestedDate) where.requestedDate = {};
    where.requestedDate = {
        lte: new Date(endDateStr + "T23:59:59.999Z")
    }
  }
  if (serviceCenterId) {
    where.serviceCenterId = serviceCenterId;
  }

  const scWhere = serviceCenterId ? { id: serviceCenterId } : {};

  try {
    const serviceCenters = await prisma.serviceCenter.findMany({
      where: scWhere,
      select: {
        id: true,
        name: true,
        city: true,
        latitude: true,
        longitude: true,
      },
    });

    const reports = await Promise.all(
      serviceCenters.map(async (sc) => {
        const appointments = await prisma.appointment.findMany({
          where: {
            ...where,
            serviceCenterId: sc.id,
          },
          include: {
            JobCards: {
              include: {
                JobCardParts: true,
              },
            },
          },
        });

        if (appointments.length === 0) {
          return {
            serviceCenterId: sc.id,
            serviceCenterName: sc.name,
            complaintVolume: {},
            avgResolutionTime: 0,
            slaBreaches: 0,
            agentKPIs: {
              totalAppointments: 0,
              completionRate: 0,
            },
            recurringIssues: [],
            hotspot: {
              city: sc.city || "",
              appointmentVolume: 0,
              latitude: sc.latitude,
              longitude: sc.longitude,
            },
          };
        }

        // Complaint volume by serviceType (assuming serviceType is category)
        const complaintVolume = appointments.reduce(
          (acc: Record<string, number>, app) => {
            acc[app.serviceType] = (acc[app.serviceType] || 0) + 1;
            return acc;
          },
          {}
        );

        // Avg resolution time for completed appointments
        const completed = appointments.filter(
          (a) => a.status === "COMPLETED" && a.actualCompletionDate
        );
        const resolutionTimes = completed.map((a) => {
          const diffTime =
            a.actualCompletionDate!.getTime() - a.requestedDate.getTime();
          return diffTime / (1000 * 60 * 60 * 24); // days
        });
        const avgResolutionTime =
          resolutionTimes.length > 0
            ? Math.round(
                (resolutionTimes.reduce((a, b) => a + b, 0) /
                  resolutionTimes.length) *
                  100
              ) / 100
            : 0;

        // SLA breaches
        const slaBreaches = appointments.filter((a) => a.slaBreached).length;

        // Agent KPIs
        const totalAppointments = appointments.length;
        const completedCount = completed.length;
        const completionRate =
          totalAppointments > 0
            ? Math.round((completedCount / totalAppointments) * 100 * 100) / 100
            : 0;

        // Recurring issues: top 3 jobNames from JobCards
        const jobCounts = appointments.reduce(
          (acc: Record<string, number>, app) => {
            app.JobCards.forEach((jc) => {
              acc[jc.jobName] = (acc[jc.jobName] || 0) + 1;
            });
            return acc;
          },
          {}
        );
        const recurringIssues = Object.entries(jobCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);

        // Hotspot: service center's city and volume
        const hotspot = {
          city: sc.city || "",
          appointmentVolume: totalAppointments,
          latitude: sc.latitude,
          longitude: sc.longitude,
        };

        return {
          serviceCenterId: sc.id,
          serviceCenterName: sc.name,
          complaintVolume,
          avgResolutionTime,
          slaBreaches,
          agentKPIs: { totalAppointments, completionRate },
          recurringIssues,
          hotspot,
        };
      })
    );

    return NextResponse.json({ reports });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
