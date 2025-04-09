import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SingleMonthYearPicker = ({ value, onChange }) => {
  const currentDate = new Date();
  const options = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear().toString();
    const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");
    options.push({
      label: `${month} ${year}`,
      value: `${year}-${formattedMonth}`, // "YYYY-MM"
    });
  }

  const handleChange = (newValue) => {
    if (onChange) {
      onChange(newValue); // Call the parent's onChange handler
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

export default SingleMonthYearPicker;