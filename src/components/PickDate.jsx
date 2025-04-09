import React from 'react'
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
      Popover,
      PopoverContent,
      PopoverTrigger,
    } from "@/components/ui/popover";

const PickDate = () => {
        const [selectedDate, setSelectedDate] = useState(""); // State for selected date
        const [date, setDate] = useState(new Date()); // State for the date picked
  return (
    <div>
      
    </div>
  )
}

export default PickDate
