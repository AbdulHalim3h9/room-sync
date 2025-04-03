import React from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DatePickerMealCount = ({ selectedDate, setSelectedDate }) => {
  const today = new Date();

  // Format date based on conditions, matching DatePick style
  const getFormattedDate = () => {
    if (isToday(selectedDate)) return `Today - ${format(selectedDate, "PPP")}`;
    if (isYesterday(selectedDate)) return `Yesterday - ${format(selectedDate, "PPP")}`;
    return format(selectedDate, "PPP");
  };

  return (
    <div className="my-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-center text-left font-normal", // Match DatePick styling
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2" /> {/* Match icon styling */}
            {selectedDate ? getFormattedDate() : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
            disabled={(date) => date > today} // Match DatePick's disabled logic
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePickerMealCount;