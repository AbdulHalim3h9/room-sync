import React from "react";
import { CardTitle } from "@/components/ui/card";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { BarChart3 } from "lucide-react";

export default function Header({ month, setMonth }) {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm py-3 -mx-6 px-6 mb-4 border-b">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg sm:text-xl font-medium">
            Summary
          </CardTitle>
        </div>
        <div className="flex justify-center sm:justify-end">
          <SingleMonthYearPicker
            value={month}
            onChange={setMonth}
            collections={["contributionConsumption", "individualMeals"]}
          />
        </div>
      </div>
    </div>
  );
}     