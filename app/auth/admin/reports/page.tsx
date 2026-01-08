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
import * as ExcelJS from 'exceljs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
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

  const exportToExcel = async () => {
    if (!data) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Service Center Reports');

    // Add headers
    worksheet.columns = [
      { header: 'Service Center', key: 'serviceCenter', width: 25 },
      { header: 'Avg Resolution Time (days)', key: 'avgResolutionTime', width: 25 },
      { header: 'SLA Breaches', key: 'slaBreaches', width: 15 },
      { header: 'Total Appointments', key: 'totalAppointments', width: 20 },
      { header: 'Completion Rate (%)', key: 'completionRate', width: 20 },
      { header: 'Hotspot City', key: 'hotspotCity', width: 20 },
      { header: 'Appointment Volume', key: 'appointmentVolume', width: 20 },
    ];

    // Add data
    data.forEach((report) => {
      worksheet.addRow({
        serviceCenter: report.serviceCenterName,
        avgResolutionTime: report.avgResolutionTime,
        slaBreaches: report.slaBreaches,
        totalAppointments: report.agentKPIs.totalAppointments,
        completionRate: report.agentKPIs.completionRate,
        hotspotCity: report.hotspot.city,
        appointmentVolume: report.hotspot.appointmentVolume,
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Generate buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service-center-reports.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Report exported to Excel!");
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

      {/* Charts */}
      {data && data.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Completion Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Completion Rate by Service Center</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceCenterName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="agentKPIs.completionRate" fill="#8884d8" name="Completion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SLA Breaches Chart */}
          <Card>
            <CardHeader>
              <CardTitle>SLA Breaches by Service Center</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceCenterName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="slaBreaches" fill="#82ca9d" name="SLA Breaches" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Total Appointments Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Total Appointments by Service Center</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.map(report => ({
                      name: report.serviceCenterName,
                      value: report.agentKPIs.totalAppointments
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Resolution Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Average Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceCenterName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgResolutionTime" stroke="#ff7300" name="Avg Resolution Time (days)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hotspot Locations Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Appointment Locations (Hotspots)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(
                      data.reduce((acc, report) => {
                        if (report.hotspot.city) {
                          acc[report.hotspot.city] = (acc[report.hotspot.city] || 0) + report.hotspot.appointmentVolume;
                        }
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([location, appointments]) => ({ name: location, value: appointments }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(
                      data.reduce((acc, report) => {
                        if (report.hotspot.city) {
                          acc[report.hotspot.city] = (acc[report.hotspot.city] || 0) + report.hotspot.appointmentVolume;
                        }
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([location, appointments]) => ({ name: location, value: appointments }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 6).map((entry, index) => {
                      const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex justify-end gap-4">
        <Button onClick={exportToPDF} disabled={!data || data.length === 0}>
          Export to PDF
        </Button>
        <Button onClick={exportToExcel} disabled={!data || data.length === 0}>
          Export to Excel
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
