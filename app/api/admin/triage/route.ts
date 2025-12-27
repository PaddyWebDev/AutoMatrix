import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { TriageAppointment } from "@/types/admin";
import { Appointment, ServiceCenter, User, Vehicle } from "@prisma/client";

// Auto-triage rules: set priority based on serviceType
function autoTriagePriority(serviceType: string): "LOW" | "MEDIUM" | "HIGH" {
  const lower = serviceType.toLowerCase();
  if (lower.includes("emergency") || lower.includes("breakdown")) return "HIGH";
  if (lower.includes("repair") || lower.includes("maintenance"))
    return "MEDIUM";
  return "LOW";
}

// Check if escalated: time-based or severity-based
function isEscalated(appointment: Appointment): boolean {
  const now = new Date();
  if (
    appointment.priority === "HIGH" &&
    appointment.slaDeadline &&
    new Date(appointment.slaDeadline) < now
  )
    return true;
  if (appointment.slaBreached) return true;
  return false;
}

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "APPROVED"] },
      },
      include: {
        Vehicle: true,
        owner: true,
        serviceCenter: true,
      },
    });

    const triageAppointments: TriageAppointment[] = appointments.map(
      (
        appt: Appointment & {
          serviceCenter?: ServiceCenter;
          Vehicle: Vehicle;
          owner: User;
        }
      ) => ({
        id: appt.id,
        vehicleName: appt.Vehicle.vehicleName,
        serviceType: appt.serviceType,
        priority: appt.priority || autoTriagePriority(appt.serviceType),
        status: appt.status,
        requestedDate: appt.requestedDate.toISOString(),
        slaDeadline: appt.slaDeadline?.toISOString() || null,
        slaBreached: appt.slaBreached,
        escalated: isEscalated(appt),
        assignedServiceCenterId: appt.serviceCenterId,
        assignedServiceCenterName: appt.serviceCenter?.name || null,
        customerName: appt.owner.name,
        customerEmail: appt.owner.email,
      })
    );

    return NextResponse.json({ appointments: triageAppointments });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch triage appointments" },
      { status: 500 }
    );
  }
}
