"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import socket from "@/lib/socket-io";
import { decryptSocketData } from "@/hooks/cryptr";
import toast from "react-hot-toast";
import { useSessionContext } from "@/context/session";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import axios from "axios";
import { AdminNotification } from "@prisma/client";

export default function AdminNotifications() {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
  } = useQuery<AdminNotification[]>({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/notifications`);
      return res.data.notification_data ?? [];
    },
  });

  // 🔔 Socket handling for admin notifications
  useEffect(() => {
    const handleNotification = async (encryptedData: string) => {
      try {
        const notification: AdminNotification = await decryptSocketData(encryptedData);
        console.log(`Admin notification active`, notification);
        queryClient.setQueryData<AdminNotification[]>(
          ["admin-notifications"],
          (old = []) => [notification, ...old]
        );
      } catch (err) {
        console.error("Admin notification error:", err);
      }
    };

    socket.on(`user-feedback`, handleNotification);
    return () => {
      socket.off(`user-feedback`, handleNotification);
    };
  }, [queryClient]);

  // ✅ Derived state
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/admin/${notificationId}`);
      return notificationId;
    },
    onSuccess: (notificationId) => {
      queryClient.setQueryData<AdminNotification[]>(
        ["admin-notifications"],
        (old = []) =>
          old.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
      );
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/admin/mark-all-read`);
      queryClient.setQueryData<AdminNotification[]>(
        ["admin-notifications"],
        (old = []) => old.map(n => ({ ...n, isRead: true }))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
          {unreadCount > 0 && (
            <Badge className="ml-2" variant="destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96">
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading Notifications...
          </p>
        )}

        {!isLoading && notifications.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No notifications yet.
          </p>
        )}

        {notifications.length > 0 && (
          <>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mb-3"
                onClick={markAllAsRead}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded border ${notification.isRead
                    ? "bg-muted/50"
                    : "bg-primary/5 border-primary/30"
                    }`}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>

                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        markAsReadMutation.mutate(notification.id)
                      }
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
