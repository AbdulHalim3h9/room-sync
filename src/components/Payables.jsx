"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { useMonth } from "@/App";

const Payables = () => {
  const { month, setMonth } = useMonth();
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
      const docRef = doc(db, "payables", selectedMonth); // Fetch by document ID
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
      <div className="container p-6">
        <h3 className="text-2xl text-center mb-8">Monthly Payables and Dues</h3>
        <div className="flex justify-end my-4">
          <div className="w-48 h-10 bg-primary/10 rounded-md animate-pulse" />
        </div>
        <div className="mx-auto grid grid-cols-1 sm:gap-2 md:gap-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex bg-slate-50 shadow-xl rounded-lg p-4">
              <div className="w-full">
                <div className="h-8 w-3/4 bg-primary/10 rounded-md animate-pulse mb-4" />
                <div className="w-full h-px bg-gray-300 my-2" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between w-full max-w-[300px] mb-2">
                    <div className="h-4 w-24 bg-primary/10 rounded-md animate-pulse" />
                    <div className="h-4 w-16 bg-primary/10 rounded-md animate-pulse" />
                  </div>
                ))}
                <div className="w-full h-px bg-gray-300 my-2" />
                <div className="flex justify-between w-full max-w-[300px] py-2">
                  <div className="h-4 w-16 bg-primary/10 rounded-md animate-pulse" />
                  <div className="h-4 w-20 bg-primary/10 rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatDisplayMonth = (monthStr) => {
    const [year, monthNum] = monthStr.split("-");
    const monthName = new Date(`${year}-${monthNum}-01`).toLocaleString("default", {
      month: "long",
    });
    return `${monthName} ${year}`; // e.g., "March 2025"
  };

  return (
    <div>
      <div className="container p-6">
        <h3 className="text-2xl text-center mb-8">Monthly Payables and Dues</h3>
        <div className="flex justify-end my-4">
          <SingleMonthYearPicker
            value={month || defaultMonth}
            onChange={handleDateChange}
            collections={["payables"]}
          />
        </div>
        <div className="mx-auto grid grid-cols-1 sm:gap-4 md:gap-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {bills.length > 0 ? (
            bills.map((bill) => (
              <Card key={bill.id} className="flex bg-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex flex-col items-center w-full p-6">
                  {/* Receipt Header */}
                  <div className="w-full text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{bill.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatDisplayMonth(month || defaultMonth)}</p>
                  </div>

                  {/* Receipt Content */}
                  <div className="w-full">
                    {/* Top Border */}
                    <div className="border-t-2 border-dashed border-gray-300 mb-4"></div>
                    
                    {/* Items */}
                    <div className="space-y-3">
                      {bill.payables.map((payable, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-700">{payable.name}</span>
                          <span className="font-medium">{payable.amount}tk</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Border */}
                    
                    <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

                    {/* Total */}
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span className="text-gray-800">Total</span>
                      <span className="text-primary">
                        {bill.payables.reduce(
                          (total, payable) => total + payable.amount,
                          0
                        )}
                        tk
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 col-span-full py-8">
              No payables found for {formatDisplayMonth(month || defaultMonth)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payables;