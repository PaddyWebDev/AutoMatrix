import { getSessionUser } from '@/hooks/user'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'
import Sidebar from '@/components/auth-sidebar'
import ThemeSwitcher from '@/components/theme-switcher'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { SessionProvider } from '@/context/session'
import { linksType } from '@/types/common'
import CustomerNotifications from '@/components/customer/notifications'


export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
    const session = await getSessionUser()
    if (!session || session.user.role !== Role.CUSTOMER || session === null) {
        redirect("/guest/Login")
    }
    const links: linksType[] = [
        {
            label: "Dashboard", href: "/auth/customer/dashboard", icon: "home"
        },
        {
            label: "Find Nearest Center", href: "/auth/customer/appointments/new/nearest-centers", icon: "locateFixedIcon"
        },
        {
            label: "Find Center", href: "/auth/customer/appointments/new/centers-by-city", icon: "search"
        }, {
            label: "Invoices", href: "/auth/customer/invoices", icon: "receipt"
        }, {
            label: "Appointments", href: "/auth/customer/appointments", icon: "calendarDays"
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
                    <header className="py-2 pl-3  pr-6 border-b border-neutral-200 dark:border-neutral-800 dark:bg-neutral-800 bg-neutral-100 flex items-center gap-3 justify-between">
                        <div className="flex flew-row items-center gap-2">
                            <SidebarTrigger />
                            <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                Customer Dashboard
                            </h1>
                        </div>
                        <div className='flex items-center gap-3'>
                            <CustomerNotifications />
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
