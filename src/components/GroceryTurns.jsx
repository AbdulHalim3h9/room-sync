import React, { useState, useEffect } from "react";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const GroceriesSpendings = () => {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNum = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthNum}`;
  });
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
    if (!monthString || !/^\d{4}-\d{2}$/.test(monthString)) {
      console.log("Invalid month format, skipping fetch");
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const expensesRef = collection(db, "expenses", monthString, "expenses");
      const snapshot = await getDocs(expensesRef);
      const expensesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch shopper full names
      const expensesWithShopperNames = await Promise.all(
        expensesData.map(async (expense) => {
          if (expense.shopper) {
            const memberRef = doc(db, "members", expense.shopper);
            const memberDoc = await getDoc(memberRef);
            return {
              ...expense,
              shopperName: memberDoc.exists() ? memberDoc.data().fullname : "Unknown",
            };
          }
          return { ...expense, shopperName: null };
        })
      );

      setExpenses(expensesWithShopperNames);
      console.log("Fetched expenses for", monthString, ":", expensesWithShopperNames);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching expenses for month:", month);
    fetchExpenses(month);
  }, [month]);

  const totalSpending = expenses.reduce(
    (total, expense) => total + parseFloat(expense.amountSpent || 0),
    0
  );

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 sm:py-8 animate-pulse">
            <div className="h-8 w-64 bg-white/20 rounded-md" />
            <div className="h-4 w-48 bg-white/20 rounded-md mt-2" />
          </div>
          
          <div className="p-5 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-lg bg-gray-50 animate-pulse">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_2fr_1fr] gap-4">
                    <div className="h-6 w-24 bg-gray-200 rounded-md" />
                    <div className="h-6 w-40 bg-gray-200 rounded-md" />
                    <div className="h-6 w-32 bg-gray-200 rounded-md" />
                    <div className="h-6 w-20 bg-gray-200 rounded-md ml-auto" />
                  </div>
                </div>
              ))}

              <div className="mt-6 p-4 border-t border-gray-200 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_2fr_1fr] gap-4">
                  <div></div>
                  <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse" />
                  <div></div>
                  <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Monthly Grocery Spendings
          </h2>
          <p className="text-purple-100 text-sm mt-1 font-medium">
            View all grocery expenses for {month}
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-2 inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-purple-800">
                {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} recorded
              </span>
            </div>
            
            <SingleMonthYearPicker
              value={month}
              onChange={setMonth}
              collections={["expenses"]}
              className="h-10 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 shadow-sm"
            />
          </div>

          <div>
            {expenses.length > 0 ? (
              <table className="w-full table-auto border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-1 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{fontSize: '12px'}}>Date</th>
                    <th className="px-1 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{fontSize: '12px'}}>Description</th>
                    <th className="px-1 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{fontSize: '12px'}}>Shopper</th>
                    <th className="px-1 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right" style={{fontSize: '12px'}}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-1 py-1 text-sm text-gray-800 whitespace-nowrap" style={{fontSize: '13px'}}>{formatDate(expense.date)}</td>
                      <td className="px-1 py-1 text-sm text-gray-800 whitespace-nowrap" style={{fontSize: '13px'}}>{expense.expenseTitle || expense.expenseType}</td>
                      <td className="px-1 py-1 text-sm text-gray-600 whitespace-nowrap" style={{fontSize: '13px'}}>
                        {expense.shopperName ? (
                          <span className="inline-flex items-center">
                            <span className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-medium mr-1">
                              {expense.shopperName.charAt(0)}
                            </span>
                            {expense.shopperName}
                          </span>
                        ) : (
                          'Unknown'
                        )}
                      </td>
                      <td className="px-1 py-1 text-sm font-semibold text-right text-gray-900 whitespace-nowrap" style={{fontSize: '13px'}}>৳ {expense.amountSpent}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td></td>
                    <td className="px-1 py-1 text-sm font-medium text-gray-700 whitespace-nowrap" colSpan={2}>
                      Total Groceries
                      <span className="ml-1 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {expenses.length}
                      </span>
                    </td>
                    <td className="px-1 py-1 text-base font-bold text-right text-gray-900 whitespace-nowrap">৳ {totalSpending}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 font-medium">No expenses found for {month}</p>
                <p className="text-gray-400 text-sm mt-1">Try selecting a different month or adding new expenses</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceriesSpendings;