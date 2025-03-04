import React, { useState, useEffect } from "react";
import SingleMonthYearPicker from "./SingleMonthYearPicker"; // Assuming this component is handling month selection
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

const GroceriesSpendings = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch expenses from Firebase Firestore
  const fetchExpenses = async () => {
    try {
      const expensesCollection = collection(db, "expenses");
      const snapshot = await getDocs(expensesCollection);
      const fetchedExpenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(fetchedExpenses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Calculate total spending
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
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Monthly Spendings List</h2>
        <SingleMonthYearPicker onChange={() => {}} /> {/* Month-Year Picker */}
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {expenses.map((expense) => (
          <div key={expense.id} className="grid grid-cols-[1fr_2fr_2fr_1fr] gap-x-4 pb-2">
            <span className="text-sm sm:text-base">{formatDate(expense.date)}</span>
            <span className="text-sm sm:text-base">
              {expense.expenseTitle || expense.expenseType}
            </span>
            <span className="text-sm sm:text-base">{expense.shopper ? `by ${expense.shopper}` : ``}</span>
            <span className="text-right text-sm sm:text-base">{expense.amountSpent}tk</span>
          </div>
        ))}

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
