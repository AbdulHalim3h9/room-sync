"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import SingleMonthYearPicker from "./SingleMonthYearPicker";

const Payables = () => {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNum = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthNum}`;
  });
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultMonth = (() => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNum = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthNum}`;
  })();

  const handleDateChange = (newMonth) => {
    setMonth(newMonth);
  };

  const fetchBills = async (selectedMonth) => {
    try {
      setLoading(true);
      const docRef = doc(db, "payables", selectedMonth);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const billsData = docSnap.data().bills || [];
        setBills(billsData);
        console.log("Fetched payables:", billsData);
      } else {
        console.log("No document found for", selectedMonth);
        setBills([]);
      }
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const effectiveMonth = month || defaultMonth;
    console.log("Fetching bills for:", effectiveMonth);
    fetchBills(effectiveMonth);
  }, [month]);

  if (loading) {
    return (
      <div className="w-full max-w-[98vw] sm:max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="overflow-hidden mb-8">
          <div className="px-4 py-5 sm:py-6 animate-pulse">
            <div className="h-8 w-64 sm:h-9 sm:w-72 bg-gray-200 rounded-md mx-auto" />
            <div className="h-4 w-48 sm:w-56 bg-gray-200 rounded-md mt-2 mx-auto" />
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <div className="w-48 h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 shadow-sm animate-pulse"
            >
              <div className="p-5 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="h-6 w-32 bg-gray-200 rounded-md" />
                  <div className="h-4 w-24 bg-gray-200 rounded-md" />
                </div>
              </div>
              <div className="p-5">
                <div className="h-12 w-full bg-gray-200 rounded-md mb-3" />
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="h-5 w-1/2 bg-gray-200 rounded-md" />
                      <th className="h-5 w-1/2 bg-gray-200 rounded-md" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(3)].map((_, i) => (
                      <tr key={i}>
                        <td className="h-5 w-1/2 bg-gray-200 rounded-md" />
                        <td className="h-5 w-1/2 bg-gray-200 rounded-md" />
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="h-5 w-1/2 bg-gray-200 rounded-md mt-3 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatDisplayMonth = (monthStr) => {
    const [year, monthNum] = monthStr.split("-");
    const monthName = new Date(`${year}-${monthNum}-01`).toLocaleString(
      "default",
      { month: "long" }
    );
    return `${monthName} ${year}`;
  };

  const getDueDate = (monthStr) => {
    const [year, monthNum] = monthStr.split("-");
    const due = new Date(year, monthNum - 1, 10); // 10th day of the selected month
    return due.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPaymentDueBy = (monthStr) => {
    const [year, monthNum] = monthStr.split("-");
    const monthName = new Date(`${year}-${monthNum}-01`).toLocaleString(
      "default",
      { month: "long" }
    );
    return `10th of ${monthName}`;
  };

  return (
    <div className="w-full max-w-[98vw] sm:max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header without card or background color */}
      <div className="px-4 py-5 sm:py-6 border-b-2 border-purple-600 text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-purple-800 tracking-tight">
          Monthly Payables and Dues
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
          {formatDisplayMonth(month || defaultMonth)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:items-center sm:justify-between gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-2 inline-flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-medium text-purple-800">
            {bills.length} {bills.length === 1 ? "bill" : "bills"} for this month
          </span>
        </div>

        <SingleMonthYearPicker
          value={month || defaultMonth}
          onChange={(newMonth) => setMonth(newMonth)}
          collections={["payables"]}
          className="h-10 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 shadow-sm"
        />
      </div>

      {bills.length > 0 ? (
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill) => {
            const effectiveMonth = month || defaultMonth;
            const totalAmount = bill.payables.reduce(
              (total, payable) => total + payable.amount,
              0
            );
            return (
              <div
                key={bill.id}
                className="bg-white border border-gray-200 shadow-sm transition-shadow duration-200"
              >
                {/* Invoice Header */}
                <div className="p-5 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {bill.name}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {formatDisplayMonth(effectiveMonth)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <div></div> {/* Empty div to maintain flex layout */}
                    <div className="text-right">
                      <p>Due Date:</p>
                      <p>{getDueDate(effectiveMonth)}</p>
                    </div>
                  </div>
                </div>

                {/* Billing Information */}
                <div className="p-5 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="font-semibold text-gray-800">From:</p>
                      <p>{bill.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">To:</p>
                      <p>Refer to the manager</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Items Table */}
                <div className="p-5">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                          Description
                        </th>
                        <th className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bill.payables.map((payable, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-2 py-2 text-sm text-gray-700">
                            {payable.name}
                          </td>
                          <td className="px-2 py-2 text-sm text-gray-900 text-right">
                            ৳ {payable.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Section */}
                  <div className="mt-4 text-sm">
                    <div className="flex justify-between py-2 border-t border-gray-200">
                      <span className="font-bold text-gray-800">Total:</span>
                      <span className="font-bold text-lg text-purple-700">
                        ৳ {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div className="mt-4 text-xs text-gray-600 border-t border-gray-200 pt-3">
                    <p className="font-semibold">Payment Terms:</p>
                    <p>
                      Please make payment by {getPaymentDueBy(effectiveMonth)}
                    </p>
                    <p>Reference: {bill.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 font-medium">
            No payables found for {formatDisplayMonth(month || defaultMonth)}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Try selecting a different month or adding new payables
          </p>
        </div>
      )}
    </div>
  );
};

export default Payables;