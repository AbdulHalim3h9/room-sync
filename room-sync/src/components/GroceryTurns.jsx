import React, { useState } from "react";

const GroceriesSpendings = () => {
  // Example data (you can replace it with your actual data source)
  const [spendings, setSpendings] = useState([
    {
      amount: 400,
      date: "2025-01-01",
      description: "Groceries",
      member: "Shakil",
    },
    {
      amount: 250,
      date: "2025-01-03",
      description: "Groceries",
      member: "Abdul Halim Khan",
    },
    {
      amount: 150,
      date: "2025-01-05",
      description: "Groceries",
      member: "John Doe",
    },
  ]);

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

  // Calculate total spending
  const totalSpending = spendings.reduce(
    (total, spending) => total + spending.amount,
    0
  );

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Spendings List of</h2>
      {/* Table Layout */}
      <div className="space-y-4">
        {spendings.map((spending, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 pb-2"
          >
            <span>{formatDate(spending.date)}</span>
            <span>{spending.description}</span>
            <span>
              {"by "}
              {spending.member}
            </span>
            <span className="text-right">{spending.amount}tk</span>
          </div>
        ))}

        <div className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 border-t pb-2 font-semibold">
          <span></span>
          <span>
            Groceries{" (x"}
            {spendings.length}
            {")"}
            {" and others"}
          </span>
          <span></span>
          <span className="text-right">
            {"total "}
            {totalSpending}tk
          </span>
        </div>
      </div>
    </div>
  );
};

export default GroceriesSpendings;
