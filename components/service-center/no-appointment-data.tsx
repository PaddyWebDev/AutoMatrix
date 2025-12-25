import { FolderCode } from "lucide-react"

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

export function NoAppointmentData() {
    const router = useRouter();
    return (
        <Empty className=" ">
            <EmptyHeader className="dark:bg-neutral-800 p-5 rounded-md">
                <EmptyMedia variant="icon">
                    <FolderCode />
                </EmptyMedia>
                <EmptyTitle>No Appointments Yet</EmptyTitle>
                <EmptyDescription>
                    {`Currently there are no appointments here`}
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <h1>
                    {
                        `No Appointment data found you can still go back to the appointments page to view the appointments`
                    }
                </h1>
                <Button onClick={() => { router.push(`/auth/service-center/dashboard`) }}>
                    Go Back
                </Button>
            </EmptyContent>
        </Empty>
    )
}
