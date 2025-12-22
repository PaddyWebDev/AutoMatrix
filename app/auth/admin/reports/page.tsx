"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import Loader from "@/components/Loader";
import TanstackError from "@/components/TanstackError";
import { useReportsForAdmin, useServiceCentersForAdminReports } from "@/hooks/admin";
import { ReportFilter, reportFilterSchema } from "@/lib/validations/auth-route-forms";




export default function AdminReportsPage() {
  const [filters, setFilters] = useState<ReportFilter>({});

  const form = useForm<ReportFilter>({
    resolver: zodResolver(reportFilterSchema),
    defaultValues: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  const { data, isLoading, isError, refetch, isFetching } = useReportsForAdmin(filters)

  const { data: serviceCenterData = [], isLoading: isServiceCenterLoading, isFetched: isServiceCenterFetched, isError: ServiceCenterError } = useServiceCentersForAdminReports()

  const onSubmit = (data: ReportFilter) => {
    setFilters(data);
    refetch();
    toast.success("Filters applied successfully!");
  };

  const exportToPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    doc.text("Service Center Reports", 20, 10);

    data.forEach((report, index) => {
      if (index > 0) doc.addPage();
      doc.text(`Service Center: ${report.serviceCenterName}`, 20, 20);

      // Complaint Volume
      doc.text("Complaint Volume by Category:", 20, 30);
      let y = 40;
      Object.entries(report.complaintVolume).forEach(([category, count]) => {
        doc.text(`${category}: ${count}`, 30, y);
        y += 10;
      });

      // Other metrics
      doc.text(`Avg Resolution Time: ${report.avgResolutionTime} days`, 20, y + 10);
      doc.text(`SLA Breaches: ${report.slaBreaches}`, 20, y + 20);
      doc.text(`Total Appointments: ${report.agentKPIs.totalAppointments}`, 20, y + 30);
      doc.text(`Completion Rate: ${report.agentKPIs.completionRate}%`, 20, y + 40);
    });

    doc.save("service-center-reports.pdf");
    toast.success("Report exported to PDF!");
  };

  if (isLoading || isServiceCenterLoading || !isServiceCenterFetched || isFetching) return <Loader />;
  if (isError || ServiceCenterError) return <TanstackError />;

  return (
    <section className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Service Center Reports</h1>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceCenterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Center (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service center" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {
                            serviceCenterData.map((serviceCenter, index: number) => (
                              <SelectItem key={index} value={serviceCenter.id}>{serviceCenter.name}; {serviceCenter.city}</SelectItem>
                            ))

                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Apply Filters</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={exportToPDF} disabled={!data || data.length === 0}>
          Export to PDF
        </Button>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Center</TableHead>
                <TableHead>Complaint Volume</TableHead>
                <TableHead>Avg Resolution Time (days)</TableHead>
                <TableHead>SLA Breaches</TableHead>
                <TableHead>Total Appointments</TableHead>
                <TableHead>Completion Rate (%)</TableHead>
                <TableHead>Recurring Issues</TableHead>
                <TableHead>Hotspot City</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((report) => (
                <TableRow key={report.serviceCenterId}>
                  <TableCell>{report.serviceCenterName}</TableCell>
                  <TableCell>
                    {Object.entries(report.complaintVolume).map(([cat, count]) => (
                      <Badge key={cat} variant="secondary" className="mr-1">
                        {cat}: {count}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>{report.avgResolutionTime}</TableCell>
                  <TableCell>{report.slaBreaches}</TableCell>
                  <TableCell>{report.agentKPIs.totalAppointments}</TableCell>
                  <TableCell>{report.agentKPIs.completionRate}</TableCell>
                  <TableCell>
                    {report.recurringIssues.slice(0, 3).map(([issue, count]) => (
                      <div key={issue}>{issue} ({count})</div>
                    ))}
                  </TableCell>
                  <TableCell>{report.hotspot.city} ({report.hotspot.appointmentVolume})</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
