"use client";

import * as React from "react";
import { format, isToday, isYesterday } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePick() {
  // Set default date to today
  const today = new Date();
  const [date, setDate] = React.useState(today);

  // Format date based on conditions
  const getFormattedDate = () => {
    if (isToday(date)) return `Today - ${format(date, "PPP")}`;
    if (isYesterday(date)) return `Yesterday - ${format(date, "PPP")}`;
    return format(date, "PPP");
  };

  return (
    <div className="my-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-center text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2" />
            {date ? getFormattedDate() : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            // Disable future dates
            disabled={(date) => date > today}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
