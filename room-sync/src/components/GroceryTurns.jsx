"use client";

import React, { useState, useEffect } from "react";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useMonth } from "@/App";

const GroceriesSpendings = () => {
  const defaultMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const { month, setMonth } = useMonth(defaultMonth); // Initialize with "Month YYYY"
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchExpenses = async (monthString) => {
    try {
      setLoading(true);
      const expensesCollection = collection(db, "expenses");
      const snapshot = await getDocs(expensesCollection);
      const allExpenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Convert "Month YYYY" to a Date object for filtering
      const [monthName, year] = monthString.split(" ");
      const monthIndex = new Date(Date.parse(`${monthName} 1, ${year}`)).getMonth();
      const monthDate = new Date(parseInt(year), monthIndex, 1);

      // Filter expenses by selected month and year
      const filteredExpenses = allExpenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === monthDate.getMonth() &&
          expenseDate.getFullYear() === monthDate.getFullYear()
        );
      });

      setExpenses(filteredExpenses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setLoading(false);
    }
  };

  // Fetch expenses when month changes
  useEffect(() => {
    if (month) {
      fetchExpenses(month);
    }
  }, [month]);

  // Fetch expenses on initial render with default month
  useEffect(() => {
    fetchExpenses(defaultMonth);
  }, []); // Empty dependency array ensures it runs only once on mount

  const handleMonthChange = (newMonth) => {
    // Convert "YYYY-MM" to "Month YYYY"
    const [year, monthNum] = newMonth.split("-");
    const monthName = new Date(`${year}-${monthNum}-01`).toLocaleString("default", {
      month: "long",
    });
    setMonth(`${monthName} ${year}`);
  };

  const totalSpending = expenses.reduce(
    (total, expense) => total + parseFloat(expense.amountSpent || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center mt-24 items-center">
        <img src="loading.gif" alt="Loading..." className="w-16 h-16" />
      </div>
    );
  }

  return (
    <div className="container mx-auto mb-8 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
          Monthly Spendings List
        </h2>
        <SingleMonthYearPicker onChange={handleMonthChange} />
      </div>

      <div className="space-y-4">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 pb-2"
            >
              <span className="text-sm sm:text-base">{formatDate(expense.date)}</span>
              <span className="text-sm sm:text-base">
                {expense.expenseTitle || expense.expenseType}
              </span>
              <span className="text-sm sm:text-base">
                {expense.shopper ? `by ${expense.shopper}` : ``}
              </span>
              <span className="text-right text-sm sm:text-base">
                {expense.amountSpent}tk
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No expenses found for this month
          </div>
        )}

        <div className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 border-t pb-2 font-semibold">
          <span></span>
          <span className="text-sm sm:text-base">
            Groceries (x{expenses.length}) and others
          </span>
          <span></span>
          <span className="text-right text-sm sm:text-base">
            total {totalSpending}tk
          </span>
        </div>
      </div>
    </div>
  );
};

export default GroceriesSpendings;