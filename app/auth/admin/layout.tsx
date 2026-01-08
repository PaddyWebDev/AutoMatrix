import Sidebar from '@/components/auth-sidebar'
import ThemeSwitcher from '@/components/theme-switcher'
import AdminNotifications from '@/components/admin/notifications'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { SessionProvider } from '@/context/session'
import { getSessionUser } from '@/hooks/user'
import { linksType } from '@/types/common'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getSessionUser()
    if (!session || session.user.role !== Role.ADMIN || session === null) {
        redirect("/guest/Login")
    }

    const links: linksType[] = [
        {
            label: "Dashboard", href: "/auth/admin/dashboard", icon: 'home'
        },
        {
            label: "Appointments", href: "/auth/admin/appointments", icon: 'calendarDays'
        },
        {
            label: "Feedback", href: "/auth/admin/feedback", icon: 'messageSquare'
        },
        {
            label: "Reports", href: "/auth/admin/reports", icon: 'fileText'
        }
    ]
    return (
        <SessionProvider session={session}>
            <main className="flex h-dvh w-dvw   dark:bg-neutral-950">
                {/* Sidebar */}
                <Sidebar
                    userId={session.user.id!}
                    userName={session.user.name!}
                    linkList={links}
                />

                {/* Main content area with trigger */}
                <SidebarInset className=" bg-neutral-50 dark:bg-neutral-950">
                    {/* Trigger should be visible at the top-left of content */}
                    <header className="py-2 pl-3  pr-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex items-center gap-3 justify-between">
                        <div className="flex flew-row items-center gap-2">
                            <SidebarTrigger />
                            <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                Admin Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <AdminNotifications />
                            <ThemeSwitcher />
                        </div>
                    </header>

                    {/* Page content */}
                    <div className="flex-1 overflow-y-auto">{children}</div>
                </SidebarInset>
            </main>
        </SessionProvider>
    )
}
