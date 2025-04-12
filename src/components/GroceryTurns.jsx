import React, { useState, useEffect } from "react";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useMonth } from "@/App";

const GroceriesSpendings = () => {
  const { month, setMonth } = useMonth();
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
    if (!monthString) {
      console.log("No month provided, skipping fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const expensesCollection = collection(db, "expenses");
      const snapshot = await getDocs(expensesCollection);
      const allExpenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const [year, monthNum] = monthString.split("-");
      const monthIndex = parseInt(monthNum) - 1; // Convert to 0-based index
      const monthDate = new Date(parseInt(year), monthIndex, 1);

      const filteredExpenses = allExpenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === monthDate.getMonth() &&
          expenseDate.getFullYear() === monthDate.getFullYear()
        );
      });
      setExpenses(filteredExpenses);
      console.log("Fetched expenses for", monthString, ":", filteredExpenses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching expenses for month:", month);
    fetchExpenses(month);
  }, [month]);

  const handleMonthChange = (newMonth) => {
    console.log("Month changed to:", newMonth);
    setMonth(newMonth); // Update the context with "YYYY-MM" format
  };

  const totalSpending = expenses.reduce(
    (total, expense) => total + parseFloat(expense.amountSpent || 0),
    0
  );

  if (loading) {
    return (
      <div className="container mx-auto mb-8 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 w-48 bg-primary/10 rounded-md animate-pulse" />
          <div className="w-48 h-10 bg-primary/10 rounded-md animate-pulse" />
        </div>

        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 pb-2">
              <div className="h-4 w-24 bg-primary/10 rounded-md animate-pulse" />
              <div className="h-4 w-32 bg-primary/10 rounded-md animate-pulse" />
              <div className="h-4 w-24 bg-primary/10 rounded-md animate-pulse" />
              <div className="h-4 w-16 bg-primary/10 rounded-md animate-pulse ml-auto" />
            </div>
          ))}

          <div className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 border-t pb-2">
            <div></div>
            <div className="h-4 w-48 bg-primary/10 rounded-md animate-pulse" />
            <div></div>
            <div className="h-4 w-24 bg-primary/10 rounded-md animate-pulse ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mb-8 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
          Monthly Spendings List
        </h2>
        <SingleMonthYearPicker
          value={month}
          onChange={handleMonthChange}
          collections={["expenses"]}
        />
      </div>

      <div className="space-y-4">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <div key={expense.id} className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 pb-2">
              <span className="text-sm sm:text-base">{formatDate(expense.date)}</span>
              <span className="text-sm sm:text-base">
                {expense.expenseTitle || expense.expenseType}
              </span>
              <span className="text-sm sm:text-base">
                {expense.shopper ? `by ${expense.shopper}` : ``}
              </span>
              <span className="text-right text-sm sm:text-base">{expense.amountSpent}tk</span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No expenses found for {month}
          </div>
        )}

        <div className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 border-t pb-2 font-semibold">
          <span></span>
          <span className="text-sm sm:text-base">
            Groceries (x{expenses.length}) and others
          </span>
          <span></span>
          <span className="text-right text-sm sm:text-base">total {totalSpending}tk</span>
        </div>
      </div>
    </div>
  );
};

export default GroceriesSpendings;