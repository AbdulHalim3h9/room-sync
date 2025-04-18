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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 sm:py-8 animate-pulse">
            <div className="h-8 w-64 bg-white/20 rounded-md mx-auto" />
            <div className="h-4 w-48 bg-white/20 rounded-md mt-2 mx-auto" />
          </div>
        </div>
        
        <div className="flex justify-end mb-6">
          <div className="w-48 h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
              <div className="p-5 border-b border-gray-100 bg-gray-50">
                <div className="h-6 w-3/4 bg-gray-200 rounded-md mx-auto" />
                <div className="h-4 w-1/2 bg-gray-200 rounded-md mx-auto mt-2" />
              </div>
              
              <div className="p-5">
                <div className="border-t border-dashed border-gray-200 my-3" />
                
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center mb-3">
                    <div className="h-4 w-24 bg-gray-200 rounded-md" />
                    <div className="h-4 w-16 bg-gray-200 rounded-md" />
                  </div>
                ))}
                
                <div className="border-t border-dashed border-gray-200 my-3" />
                
                <div className="flex justify-between items-center">
                  <div className="h-5 w-16 bg-gray-200 rounded-md" />
                  <div className="h-5 w-20 bg-gray-200 rounded-md" />
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 sm:py-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Monthly Payables and Dues
          </h2>
          <p className="text-purple-100 text-sm mt-1 font-medium">
            {formatDisplayMonth(month || defaultMonth)}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-2 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-purple-800">
            {bills.length} {bills.length === 1 ? 'bill' : 'bills'} for this month
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
          {bills.map((bill) => (
            <div 
              key={bill.id} 
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Receipt Header */}
              <div className="p-5 border-b border-gray-100 bg-gray-50 text-center">
                <h3 className="text-lg font-bold text-gray-800">{bill.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{formatDisplayMonth(month || defaultMonth)}</p>
              </div>
              
              {/* Receipt Content */}
              <div className="p-5">
                {/* Top Border */}
                <div className="border-t border-dashed border-gray-200 my-3"></div>
                
                {/* Items */}
                <div className="space-y-3">
                  {bill.payables.map((payable, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-700">{payable.name}</span>
                      <span className="text-sm font-medium text-gray-900">৳ {payable.amount}</span>
                    </div>
                  ))}
                </div>
                
                {/* Bottom Border */}
                <div className="border-t border-dashed border-gray-200 my-3"></div>
                
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-lg text-purple-700">
                    ৳ {bill.payables.reduce(
                      (total, payable) => total + payable.amount,
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No payables found for {formatDisplayMonth(month || defaultMonth)}</p>
          <p className="text-gray-400 text-sm mt-1">Try selecting a different month or adding new payables</p>
        </div>
      )}
    </div>
  );
};

export default Payables;