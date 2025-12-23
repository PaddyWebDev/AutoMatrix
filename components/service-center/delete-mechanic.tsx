import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Mechanic } from "@/types/service-center";

type DeleteMechanicDialogProps = {
    mechanicId: string;
    serviceCenterId: string;
};

export function DeleteMechanicDialog({
    mechanicId,
    serviceCenterId,
}: DeleteMechanicDialogProps) {
    const queryClient = useQueryClient();

    const deleteMechanicMutation = useMutation({
        mutationFn: async () => {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/service-center/${serviceCenterId}/mechanic/${mechanicId}/delete`
            );
        },
        onSuccess: () => {
            queryClient.setQueryData(["service-center-mechanic", serviceCenterId], function (prevData: Mechanic[] = []): Mechanic[] {
                if (!prevData) return prevData;
                console.log(prevData);
                const delted = prevData.filter((mechanic) => mechanic.id !== mechanicId)
                return delted;
            })
            toast.success("Mechanic deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete mechanic");
        },
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Delete
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete mechanic</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently remove the
                        mechanic from your service center.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => { }}
                        disabled={deleteMechanicMutation.isPending}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={() => deleteMechanicMutation.mutate()}
                        disabled={deleteMechanicMutation.isPending}
                    >
                        {deleteMechanicMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
