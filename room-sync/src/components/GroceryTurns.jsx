import React, { useState, useEffect } from "react";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import spendingsData from "@/spendings.json"; // Importing JSON file
import { useMonth } from "@/App"; // Assuming you are using a context like in Payables

const GroceriesSpendings = () => {
  const { month, setMonth } = useMonth(); // Access the context
  const [spendings, setSpendings] = useState([]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric" };
    const weekday = date.toLocaleString("en-US", { weekday: "short" });
    const formattedDate = date.toLocaleDateString("en-US", options);
    return (
      <span>
        {formattedDate} <span className="text-gray-600">{weekday}</span>
      </span>
    );
  };

  // Update spendings when month changes
  useEffect(() => {
    console.log(month);
    console.log("Selected month:", month); // Log the selected month
    console.log("Selected spendings:", spendingsData[month]); // Log the spendings data for the selected month
    const selectedSpendings = spendingsData[month]?.spendings || [];
    setSpendings(selectedSpendings);
  }, [month]);

  // Calculate total spending
  const totalSpending = spendings.reduce(
    (total, spending) => total + spending.amount,
    0
  );

  // Handle date change from SingleMonthYearPicker
  const handleDateChange = (newMonth) => {
    setMonth(newMonth); // Set the new month
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Monthly Spendings List</h2>
        <SingleMonthYearPicker onChange={handleDateChange} /> {/* Month-Year Picker */}
      </div>
      {/* Spendings List */}
      <div className="space-y-4">
        {spendings.map((spending, index) => (
          <div key={index} className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 pb-2">
            <span className="text-sm sm:text-base">{formatDate(spending.date)}</span>
            <span className="text-sm sm:text-base">{spending.description}</span>
            <span className="text-sm sm:text-base">{"by "}{spending.member}</span>
            <span className="text-right text-sm sm:text-base">{spending.amount}tk</span>
          </div>
        ))}

        <div className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 border-t pb-2 font-semibold">
          <span></span>
          <span className="text-sm sm:text-base">
            Groceries{" (x"}
            {spendings.length}
            {") and others"}
          </span>
          <span></span>
          <span className="text-right text-sm sm:text-base">
            {"total "}
            {totalSpending}tk
          </span>
        </div>
      </div>
    </div>
  );
};

export default GroceriesSpendings;
