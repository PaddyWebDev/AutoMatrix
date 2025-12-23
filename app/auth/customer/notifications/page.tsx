"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import socket from "@/lib/socket-io";
import { decryptSocketData } from "@/hooks/cryptr";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  message: string;
  type: string;
  timestamp: Date;
  isRead: boolean;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["customer-notifications"],
    queryFn: async () => {
      const response = await fetch("/api/customer/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
  });

  useEffect(() => {
    if (data?.notifications) {
      setNotifications(data.notifications);
    }
  }, [data]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const handleNotification = async (encryptedData: string) => {
      try {
        const decryptedData = await decryptSocketData(encryptedData);
        const notification: Notification = JSON.parse(decryptedData);

        setNotifications((prev) => [notification, ...prev]);
        toast.success(notification.message);
      } catch (error) {
        console.error("Error handling notification:", error);
      }
    };

    socket.on(`notification-${session.user.id}`, handleNotification);

    return () => {
      socket.off(`notification-${session.user.id}`, handleNotification);
    };
  }, [session?.user?.id]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch("/api/customer/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: (data) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === data.notification.id
            ? { ...notif, isRead: true }
            : notif
        )
      );
      queryClient.invalidateQueries({ queryKey: ["customer-notifications"] });
    },
    onError: (error) => {
      toast.error("Failed to mark notification as read");
      console.error("Error marking notification as read:", error);
    },
  });

  const markAllAsRead = () => {
    notifications.forEach((notif) => {
      if (!notif.isRead) {
        markAsReadMutation.mutate(notif.id);
      }
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading notifications</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            disabled={markAsReadMutation.isPending}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${notification.isRead
                      ? "bg-muted/50"
                      : "bg-primary/5 border-primary/20"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
