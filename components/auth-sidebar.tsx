"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarHeader,
  Sidebar as ShadCNSidebar,
  SidebarGroup,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Home,
  LogOut,
  LucideIcon,
  User,
  UserCog,
  UserPen,

} from "lucide-react";
import { signOutUser } from "@/hooks/user";
import { iconMap, linksType } from "@/types/common";

interface SidebarProps {
  userId: string;
  userName: string;
  routeName: string
  linkList: linksType[]
}



export default function Sidebar({ userId, userName, routeName, linkList }: SidebarProps) {

  const pathname = usePathname();

  return (
    <ShadCNSidebar
      variant="floating"
      collapsible="offcanvas"
      className="min-h-dvh  shadow-lg  p-0 "
    >
      <SidebarHeader className="border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 ">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {routeName}
        </h2>
      </SidebarHeader>
      <SidebarContent className=" overflow-y-auto max-h-full dark:bg-neutral-900 ">
        <SidebarGroup>
          <nav className="flex flex-col space-y-3 bg-neutral-100 dark:bg-neutral-800 px-2 py-2 rounded-xl shadow-md">
            {linkList.map((link, id) => {
              const Icon: LucideIcon = iconMap.get(link.icon) || Home
              return (
                <Link
                  key={id}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-neutral-200 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                >
                  <span>
                    <Icon />
                  </span>
                  {link.label}
                </Link>
              )
            })}

            {pathname === "/auth/profile" ? (
              <>
                <Link

                  href={`#`}
                  className={cn(
                    "px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors",
                    pathname === `/auth/profile/update/${userId}`
                      ? "bg-neutral-200 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                >
                  <span>
                    <UserPen />
                  </span>
                  Update Details
                </Link>
                <Link
                  href={`/auth/profile/update-password/${userId}`}
                  className={cn(
                    "px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors",
                    pathname === `/auth/profile/update-password/${userId}`
                      ? "bg-neutral-200 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                >
                  <span>
                    <UserCog />
                  </span>
                  Update Password
                </Link>
              </>
            ) : (
              ""
            )}
          </nav>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-around bg-neutral-100 shadow-md  dark:bg-neutral-800 py-2 rounded-md ">
          <Link
            className={cn(
              "px-3 py-2 rounded-md flex items-center gap-2 ml-3 text-sm font-medium transition-colors",
              pathname === "/auth/profile"
                ? "bg-neutral-200 dark:bg-neutral-700 font-semibold text-neutral-900 dark:text-neutral-100"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            )}
            href={`#`}
          >
            <span>
              <User />
            </span>
            {userName?.split(" ")[0]}
          </Link>
          <Button
            title="Sign Out"
            variant={"ghost"}
            className="flex mr-3 items-center justify-start gap-2 dark:hover:bg-neutral-700"
            onClick={() => signOutUser()}
          >
            <LogOut />
          </Button>
        </div>
      </SidebarFooter>
    </ShadCNSidebar>
  );
}


