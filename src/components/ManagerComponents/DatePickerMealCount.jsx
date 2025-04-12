import React from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DatePickerMealCount = ({ selectedDate, setSelectedDate, datesWithData }) => {
  const today = new Date();

  // Format date based on conditions
  const getFormattedDate = () => {
    if (isToday(selectedDate)) return `Today - ${format(selectedDate, "PPP")}`;
    if (isYesterday(selectedDate)) return `Yesterday - ${format(selectedDate, "PPP")}`;
    return format(selectedDate, "PPP");
  };

  // Define modifiers for highlighting dates with data
  const modifiers = {
    hasData: datesWithData,
  };

  // Optional: Define custom styles for highlighted dates
  const modifiersStyles = {
    hasData: {
      backgroundColor: "#d1fae5", // Light green background
      color: "#065f46", // Dark green text
      borderRadius: "4px",
    },
  };

  return (
    <div className="my-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-center text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2" />
            {selectedDate ? getFormattedDate() : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
            disabled={(date) => date > today}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePickerMealCount;