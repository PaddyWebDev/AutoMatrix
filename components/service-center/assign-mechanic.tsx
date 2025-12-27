import React from 'react'
import { Dialog, DialogTrigger, DialogTitle, DialogHeader, DialogContent, DialogClose, DialogFooter, DialogDescription, } from '../ui/dialog'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Skeleton } from '../ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useSessionContext } from '@/context/session'

interface AssignMechanicProps {
    appointmentId: string
    alreadyAssigned: boolean
    skipMechanicIds: Array<{
        mechanicId: string;
    }>
}

interface Mechanic {
    id: string
    name: string
    email: string
    phoneNumber: string
    speciality: string
    status: string
}


function avoidRecurringMechanics(skipMechanicIds: AssignMechanicProps["skipMechanicIds"], mechanicData: Mechanic[]) {
    const alreadyAssignedMechanicIds: string[] = skipMechanicIds.map((mechanic) => mechanic.mechanicId)
    return mechanicData ? mechanicData.filter((mechanic) => !alreadyAssignedMechanicIds.includes(mechanic.id)) : []
}

export default function AssignMechanic({ appointmentId, alreadyAssigned, skipMechanicIds }: AssignMechanicProps) {
    const { session } = useSessionContext()
    const [selectedMechanic, setSelectedMechanic] = React.useState<string>('')
    const [isPending, startTransition] = React.useTransition()

    const { data: mechanics, isLoading, isError } = useQuery({
        queryKey: ['mechanics', session?.user.id],
        queryFn: async () => {
            const response = await axios.get(`/api/service-centers/mechanics?serviceCenterId=${session?.user.id}`)
            return response.data.mechanic_data as Mechanic[]
        },
        enabled: !!session?.user.id
    })
    const mechanicData = avoidRecurringMechanics(skipMechanicIds, mechanics!)

    async function handleAssignMechanic() {
        if (!selectedMechanic) {
            toast.error('Please select a mechanic')
            return
        }

        startTransition(async () => {
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/appointments/${appointmentId}/assign-mechanic`, {
                    mechanicId: selectedMechanic
                })
                toast.success(response.data)
                setSelectedMechanic('')
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    toast.error(error.response?.data || "Error Occurred");
                } else {
                    toast.error("Error Occurred");
                }
            }
        })
    }


    return (
        <Dialog>
            <DialogTrigger asChild >
                <Button>
                    {alreadyAssigned ? 'Want to Assign More?' : 'Assign Mechanic'}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Mechanic</DialogTitle>
                    <DialogDescription>
                        Select a mechanic to assign to this appointment
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : isError || mechanics?.length === undefined ? (
                        <p className="text-red-500">Error loading mechanics</p>
                    ) : (
                        <Select value={selectedMechanic} onValueChange={setSelectedMechanic}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a mechanic" />
                            </SelectTrigger>
                            <SelectContent>
                                {mechanicData.map((mechanic) => (
                                    <SelectItem key={mechanic.id} value={mechanic.id}>
                                        {mechanic.name} - {mechanic.speciality}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose className='flex items-center justify-start gap-3'>
                        <Button variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleAssignMechanic} disabled={isPending || !selectedMechanic}>
                        {isPending ? 'Assigning...' : 'Assign'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
