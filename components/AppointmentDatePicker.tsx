"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Props {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    disabledStatus: boolean
};

export function AppointmentDatePicker({ value, onChange, disabledStatus }: Props) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    disabled={disabledStatus}
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                >
                    {value ? format(value, "PPP") : <span>Pick a deadline</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    disabled={(date) => date < new Date()}
                />
            </PopoverContent>
        </Popover>
    );
}
