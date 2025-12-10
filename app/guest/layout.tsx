import React from "react";
import Navbar from "@/components/guest-navbar";
import { getSessionUser } from "@/hooks/user";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export default async function GuestLayout({ children }: GuestLayoutProps) {
  const sessionUser = await getSessionUser();
  if (sessionUser) {

    switch (sessionUser.user.role) {
      case Role.ADMIN:
        redirect("/admin/dashboard")
      case Role.CUSTOMER:
        redirect("/customer/dashboard")
      case Role.SERVICE_CENTER:
        redirect("/service-center/dashboard")
    }
  }
  return (
    <main className="h-dvh bg-neutral-50 dark:bg-neutral-950 w-full">
      <Navbar />
      <section className="flex items-center w-full h-[92dvh] justify-center">
        {children}
      </section>
    </main>
  );
}
