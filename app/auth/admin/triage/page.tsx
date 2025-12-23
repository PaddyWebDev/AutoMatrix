"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTriageAppointments, useAssignAppointment, useEscalateAppointment, useServiceCentersForAdminReports } from "@/hooks/admin";
import { TriageAppointment } from "@/types/admin";

const assignSchema = z.object({
  serviceCenterId: z.string().min(1, "Service center is required"),
});

type AssignForm = z.infer<typeof assignSchema>;

const SLATimer = ({ deadline }: { deadline: string | null }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Overdue");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return <span className={timeLeft === "Overdue" ? "text-red-500" : ""}>{timeLeft || "N/A"}</span>;
};

export default function TriagePage() {
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedAppointment, setSelectedAppointment] = useState<TriageAppointment | null>(null);

  const { data: appointments = [], isLoading } = useTriageAppointments();
  const { data: serviceCenters = [] } = useServiceCentersForAdminReports();
  const assignMutation = useAssignAppointment();
  const escalateMutation = useEscalateAppointment();

  const form = useForm<AssignForm>({
    resolver: zodResolver(assignSchema),
    defaultValues: { serviceCenterId: "" },
  });

  const filteredAppointments = appointments.filter((appt) => {
    if (filterPriority !== "ALL" && appt.priority !== filterPriority) return false;
    if (filterStatus !== "ALL" && appt.status !== filterStatus) return false;
    return true;
  });

  const onAssign = (data: AssignForm) => {
    if (!selectedAppointment) return;
    assignMutation.mutate({
      appointmentId: selectedAppointment.id,
      serviceCenterId: data.serviceCenterId,
    });
    setSelectedAppointment(null);
    form.reset();
  };

  const onEscalate = (appointmentId: string) => {
    escalateMutation.mutate(appointmentId);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Triage & Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA Timer</TableHead>
                <TableHead>Assigned Center</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell>{appt.vehicleName}</TableCell>
                  <TableCell>{appt.serviceType}</TableCell>
                  <TableCell>
                    <Badge variant={appt.priority === 'HIGH' ? 'destructive' : appt.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                      {appt.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{appt.status}</TableCell>
                  <TableCell>
                    <SLATimer deadline={appt.slaDeadline} />
                  </TableCell>
                  <TableCell>{appt.assignedServiceCenterName || "Unassigned"}</TableCell>
                  <TableCell>{appt.customerName}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedAppointment(appt)}>
                            Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Appointment</DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onAssign)} className="space-y-4">
                              <FormField
                                control={form.control}
                                name="serviceCenterId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Service Center</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select service center" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {serviceCenters.map((sc) => (
                                          <SelectItem key={sc.id} value={sc.id}>
                                            {sc.name} - {sc.city}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                              <Button type="submit">Assign</Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                      {appt.escalated && (
                        <Button size="sm" variant="destructive" onClick={() => onEscalate(appt.id)}>
                          Escalate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
