"use client";

import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useSessionContext } from "@/context/session";
import { useQuery } from "@tanstack/react-query";
import TanstackError from "@/components/TanstackError";
import Loader from "@/components/Loader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


export default function AdminDashboard() {
  const { session } = useSessionContext();

  const { data, isLoading, isError, isFetching } = useQuery<Array<number>>({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/stats`)
      return response.data.stats
    }
  })

  if (isLoading || isFetching) {
    return (
      <Loader />
    )
  }


  if (isError || !data || data.length === undefined) {
    return (
      <TanstackError />
    )
  }



  return (
    <section className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Profile Section */}
      <Card className="dark:bg-neutral-800 bg-neutral-100">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={"/next.svg"} />
              <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{session?.user?.name}</h2>
              <p className="text-gray-600">{session?.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:bg-neutral-800 bg-neutral-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-2xl font-bold">{data[0] || 0}</div>
          </CardContent>
        </Card>
        <Card className="dark:bg-neutral-800 bg-neutral-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
            <CardTitle className="text-center text-sm font-medium">Service Centers</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-2xl font-bold">{data[1] || 0}</div>
          </CardContent>
        </Card>
        <Card className="dark:bg-neutral-800 bg-neutral-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-2xl font-bold">{data[2] || 0}</div>
          </CardContent>
        </Card>
        <Card className="dark:bg-neutral-800 bg-neutral-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">

            <div className="text-2xl font-bold">{data[3] || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart for Stats */}
        <Card className="dark:bg-neutral-800 bg-neutral-100">
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Users', value: data[0] || 0 },
                { name: 'Service Centers', value: data[1] || 0 },
                { name: 'Appointments', value: data[2] || 0 },
                { name: 'Invoices', value: data[3] || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart for Stats */}
        <Card className="dark:bg-neutral-800 bg-neutral-100">
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Users', value: data[0] || 0 },
                    { name: 'Service Centers', value: data[1] || 0 },
                    { name: 'Appointments', value: data[2] || 0 },
                    { name: 'Invoices', value: data[3] || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Users', value: data[0] || 0 },
                    { name: 'Service Centers', value: data[1] || 0 },
                    { name: 'Appointments', value: data[2] || 0 },
                    { name: 'Invoices', value: data[3] || 0 }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/auth/admin/users">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-neutral-800 bg-neutral-100">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold">Manage Users</h3>
              <p className="text-gray-600">View and manage all users</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/auth/admin/service-centers">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-neutral-800 bg-neutral-100"  >
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold">Service Centers</h3>
              <p className="text-gray-600">Manage service centers</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/auth/admin/reports">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-neutral-800 bg-neutral-100">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold">Reports</h3>
              <p className="text-gray-600">View detailed analytics</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}
