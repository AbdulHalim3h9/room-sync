"use client";

import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ActiveMemberMonthYearPicker = ({ value, onChange }) => {
  const options = useMemo(() => {
    const opts = [];
    const currentDate = new Date();
    // Start from 5 months back
    for (let i = -5; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthName = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear().toString();
      const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");
      opts.push({
        label: `${monthName} ${year}`,
        value: `${year}-${formattedMonth}`,
      });
    }
    return opts;
  }, []);

  const handleChange = (newValue) => {
    if (onChange && newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-max">
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Month and Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ActiveMemberMonthYearPicker;