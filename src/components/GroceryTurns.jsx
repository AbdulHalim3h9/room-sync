import React, { useState, useEffect } from "react";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import LastUpdated from "./LastUpdated";

const GroceriesSpendings = () => {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNum = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthNum}`;
  });
  const [expenses, setExpenses] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
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
      setExpenses([]);
      setLastUpdated(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const expensesRef = collection(db, "expenses", monthString, "expenses");
      const snapshot = await getDocs(expensesRef);
      const expensesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          date: data.date?.toDate ? data.date.toDate() : data.date,
        };
      });

      const monthDocRef = doc(db, "expenses", monthString);
      const monthDoc = await getDoc(monthDocRef);
      const lastUpdatedTimestamp = monthDoc.exists() ? monthDoc.data().createdAt : null;
      setLastUpdated(lastUpdatedTimestamp);

      const expensesWithShopperNames = await Promise.all(
        expensesData.map(async (expense) => {
          if (expense.shopper) {
            const memberRef = doc(db, "members", expense.shopper);
            const memberDoc = await getDoc(memberRef);
            return {
              ...expense,
              shopperId: memberDoc.exists() ? memberDoc.data().fullname : "",
            };
          }
          return { ...expense };
        })
      );

      setExpenses(expensesWithShopperNames);
    } catch (error) {
      setExpenses([]);
      setLastUpdated(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(month);
  }, [month]);

  const totalSpending = expenses.reduce(
    (total, expense) => total + parseFloat(expense.amountSpent || 0),
    0
  ).toFixed(2);

  if (loading) {
    return (
      <div className="w-full max-w-[98vw] sm:max-w-6xl mx-auto px-4 sm:px-0 py-6">
        <div className="overflow-hidden">
          <div className="px-4 sm:px-0 py-5 sm:py-6 animate-pulse">
            <div className="h-8 w-64 sm:h-9 sm:w-72 bg-gray-200 rounded-md" />
            <div className="h-4 w-48 sm:w-56 bg-gray-200 rounded-md mt-2" />
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
              <div className="h-9 w-40 sm:h-10 sm:w-48 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-9 w-32 sm:h-10 sm:w-36 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="p-3 border border-gray-100 rounded-lg bg-gray-50 animate-pulse">
                  <div className="flex flex-col gap-2">
                    <div className="h-5 w-24 bg-gray-200 rounded-md" />
                    <div className="h-5 w-32 bg-gray-200 rounded-md" />
                    <div className="h-5 w-28 bg-gray-200 rounded-md" />
                    <div className="h-5 w-20 bg-gray-200 rounded-md ml-auto" />
                  </div>
                </div>
              ))}
              <div className="mt-5 p-3 border-t border-gray-200 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <div className="h-5 w-32 bg-gray-200 rounded-md" />
                  <div className="h-5 w-24 bg-gray-200 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[98vw] sm:max-w-6xl mx-auto px-4 sm:px-0 py-0">
      <div>
        <div className="px-4 py-5 sm:py-6 border-b-2 border-purple-600">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-800 tracking-tight">
            Monthly Grocery Spendings
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mt-1 font-medium">
            View all grocery expenses for {month}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-1.5 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-purple-800">
                {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} recorded
              </span>
            </div>
            <SingleMonthYearPicker
              value={month}
              onChange={setMonth}
              collections={["expenses"]}
              className="h-9 sm:h-10 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 shadow-sm w-full sm:w-auto"
            />
          </div>

          <div>
            {expenses.length > 0 ? (
              <div>
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-1 py-1 sm:px-2 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider text-left w-[20%]">Date</th>
                      <th className="px-1 py-1 sm:px-2 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider text-left w-[30%]">Description</th>
                      <th className="px-1 py-1 sm:px-2 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider text-left w-[30%]">Shopper</th>
                      <th className="px-1 py-1 sm:px-2 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider text-right w-[20%]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-1 py-1 sm:px-2 sm:py-2 text-xs sm:text-sm md:text-base text-gray-800 whitespace-nowrap">{formatDate(expense.date)}</td>
                        <td className="px-1 py-1 sm:px-2 sm:py-2 text-xs sm:text-sm md:text-base text-gray-800 whitespace-nowrap">{expense.expenseTitle || expense.expenseType}</td>
                        <td className="px-1 py-1 sm:px-2 sm:py-2 text-xs sm:text-sm md:text-base text-gray-800 whitespace-nowrap">
                          {expense.shopperId ? (
                            <span className="inline-flex items-center">
                              <span className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-medium mr-1 sm:mr-1.5 md:mr-2">
                                {expense.shopperId.charAt(0)}
                              </span>
                              {expense.shopperId}
                            </span>
                          ) : (
                            ''
                          )}
                        </td>
                        <td className="px-1 py-1 sm:px-2 sm:py-2 text-xs sm:text-sm md:text-base font-semibold text-right text-gray-900 whitespace-nowrap">৳ {parseFloat(expense.amountSpent).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td></td>
                      <td className="px-1 py-1 sm:px-2 sm:py-2 text-xs sm:text-sm md:text-base font-medium text-gray-700 whitespace-nowrap" colSpan={2}>
                        Total Groceries
                        <span className="ml-1 bg-purple-100 text-purple-800 text-[10px] sm:text-xs md:text-sm font-semibold px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full">
                          {expenses.length}
                        </span>
                      </td>
                      <td className="px-1 py-1 sm:px-2 sm:py-2 text-xs sm:text-sm md:text-base font-bold text-right text-gray-900 whitespace-nowrap">৳ {totalSpending}</td>
                    </tr>
                  </tfoot>
                </table>
                <LastUpdated timestamp={lastUpdated} />
              </div>
            ) : (
              <div>
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-400 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-gray-500 font-medium text-sm">No expenses found for {month}</p>
                  <p className="text-gray-400 text-xs mt-1">Try selecting a different month or adding new expenses</p>
                </div>
                <LastUpdated timestamp={lastUpdated} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceriesSpendings;