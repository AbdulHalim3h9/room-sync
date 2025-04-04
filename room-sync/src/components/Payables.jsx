"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import MonthYearPicker from "./SingleMonthYearPicker";
import { useMonth } from "@/App";

const Payables = () => {
  const defaultMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const { month, setMonth } = useMonth(defaultMonth); // Default month
  const [bills, setBills] = useState([]);

  // Handle date change from MonthYearPicker
  const handleDateChange = (newMonth) => {
    const [year, month] = newMonth.split("-");
    const monthName = new Date(`${year}-${month}-01`).toLocaleString("default", {
      month: "long",
    });
    setMonth(`${monthName} ${year}`);
  };

  // Fetch bills from Firestore
  const fetchBills = async (selectedMonth) => {
    try {
      const payablesRef = collection(db, "payables");
      const q = query(payablesRef, where("month", "==", selectedMonth));
      const querySnapshot = await getDocs(q);
      console.log("Query snapshot:", querySnapshot.empty, q, selectedMonth, payablesRef);
      if (!querySnapshot.empty) {
        const billsData = [];
        querySnapshot.forEach((doc) => {
          billsData.push(...doc.data().bills);
        });
        setBills(billsData);
        console.log("Fetched payables:", billsData);
      } else {
        console.log("No matching documents!");
        setBills([]);
      }
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    }
  };

  // Fetch bills on initial render and when month changes
  useEffect(() => {
    if (month) {
      fetchBills(month);
    }
  }, [month]);

  // Trigger initial fetch on component mount
  useEffect(() => {
    fetchBills(defaultMonth); // Fetch data with default month on mount
  }, []); // Empty dependency array ensures it runs only once on mount

  return (
    <div>
      <div className="container p-6">
        <h3 className="text-2xl text-center">Monthly Payables and Dues</h3>
        <div className="flex justify-end my-4">
          <MonthYearPicker onChange={handleDateChange} />
        </div>
        <div className="mx-auto grid grid-cols-1 sm:gap-2 md:gap-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => (
            <Card key={bill.id} className="flex bg-slate-50 shadow-xl">
              <div className="flex flex-col items-center w-full">
                <CardHeader>
                  <CardTitle>
                    <h3 className="text-center">{bill.name}</h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="w-full flex flex-col items-center">
                  <hr className="w-full border-gray-300 border-dashed my-2" />
                  {bill.payables.map((payable, index) => (
                    <div
                      key={index}
                      className="flex justify-between w-full max-w-[300px]"
                    >
                      <span className="px-4">{payable.name}:</span>
                      <span>{payable.amount}tk</span>
                    </div>
                  ))}
                  <hr className="w-full border-gray-300 border-dashed my-2" />
                  <div className="flex justify-between w-full max-w-[300px] py-2">
                    <span className="px-4">**Total:</span>
                    <span>
                      {bill.payables.reduce(
                        (total, payable) => total + payable.amount,
                        0
                      )}
                      tk
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payables;