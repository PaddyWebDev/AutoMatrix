"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface AdminProfile {
  name: string;
  email: string;
  phoneNumber: string;
}

interface Stats {
  totalUsers: number;
  totalServiceCenters: number;
  totalAppointments: number;
  totalInvoices: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
      fetchStats();
    }
  });

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/users/${session?.user.id}`);
      setProfile(response.data);
      setEditName(response.data.name);
      setEditPhone(response.data.phoneNumber || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, centersRes, appointmentsRes, invoicesRes] = await Promise.all([
        axios.get(`http://localhost:3001/api/admin/stats/users`),
        axios.get(`http://localhost:3001/api/admin/stats/service-centers`),
        axios.get(`http://localhost:3001/api/admin/stats/appointments`),
        axios.get(`http://localhost:3001/api/admin/stats/invoices`),
      ]);
      setStats({
        totalUsers: usersRes.data.count,
        totalServiceCenters: centersRes.data.count,
        totalAppointments: appointmentsRes.data.count,
        totalInvoices: invoicesRes.data.count,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.put(`http://localhost:3001/api/users/${session?.user.id}`, {
        name: editName,
        phoneNumber: editPhone,
      });
      setProfile({ ...profile!, name: editName, phoneNumber: editPhone });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Please sign in</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.user.image!} />
              <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{profile?.name}</h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>
          </div>
          {editing ? (
            <div className="space-y-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleUpdateProfile}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalServiceCenters || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInvoices || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold">Manage Users</h3>
              <p className="text-gray-600">View and manage all users</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/service-centers">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold">Service Centers</h3>
              <p className="text-gray-600">Manage service centers</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/reports">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold">Reports</h3>
              <p className="text-gray-600">View detailed analytics</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
