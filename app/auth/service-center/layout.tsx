import { getSessionUser } from '@/hooks/user'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'
import { linksType } from '@/types/common'
import { SessionProvider } from '@/context/session'
import Sidebar from '@/components/auth-sidebar'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import ThemeSwitcher from '@/components/theme-switcher'
import ServiceCenterNotifications from '@/components/service-center/notification'

export default async function ServiceCenterLayout({ children }: { children: React.ReactNode }) {
    const session = await getSessionUser()
    if (!session || session.user.role !== Role.SERVICE_CENTER || session === null) {
        redirect("/guest/Login")
    }
    const links: linksType[] = [
        {
            label: "Dashboard", href: "/auth/service-center/dashboard", icon: "User"
        }, {
            label: "Appointments", href: "/auth/service-center/appointments", icon: "calendarDays"
        }, {
            label: "Inventory", href: "/auth/service-center/inventory", icon: "boxes"
        }, {
            label: "Invoices", href: "/auth/service-center/invoices", icon: "receipt"
        }
    ]

    return (
        <main className="flex h-dvh w-dvw   dark:bg-neutral-950">
            <SessionProvider session={session}>
                {/* Sidebar */}
                <Sidebar
                    userId={session.user.id!}
                    userName={session.user.name!}
                    linkList={links}
                />

                {/* Main content area with trigger */}
                <SidebarInset className=" ">
                    {/* Trigger should be visible at the top-left of content */}
                    <header className="py-2 pl-3  pr-6 border-b border-neutral-200 dark:border-neutral-900 dark:bg-neutral-900 bg-neutral-100 flex items-center gap-3 justify-between">
                        <div className="flex flew-row items-center gap-2">
                            <SidebarTrigger />
                            <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                Service Center
                            </h1>
                        </div>
                        <div className='flex items-center gap-3 mr-3'>
                            <ServiceCenterNotifications />
                            <ThemeSwitcher />
                        </div>
                    </header>

                    {/* Page content */}
                    <div className="flex-1 overflow-y-auto">{children}</div>
                </SidebarInset>
            </SessionProvider >
        </main>
    )
}
