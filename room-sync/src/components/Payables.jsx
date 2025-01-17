import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import billsData from "@/bills.json";
import MonthYearPicker from "./SingleMonthYearPicker";
import { useMonth } from "@/App";

const Payables = () => {
  const { month, setMonth } = useMonth(); // Access the context
  const [bills, setBills] = useState([]);

  // Update bills when month changes
  useEffect(() => {// Format the month
    console.log("Current month:", month); // Log the current month
    console.log("Selected bills:", billsData[month]); // Log the bills data for the selected month
    const selectedBills = billsData[month]?.bills || [];
    setBills(selectedBills);
  }, [month]);
  // Handle date change from MonthYearPicker
  const handleDateChange = (newMonth) => {
    setMonth(newMonth); // Set the new month
  };

  return (
    <div>
      <div className="container p-6 ">
        <h3 className="text-2xl text-center">Monthly Payables and Dues</h3>
        <div className="flex justify-end my-4">

       <MonthYearPicker onChange={handleDateChange} />
        </div>
      <div className="mx-auto  grid grid-cols-1 sm:gap-2 md:gap-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {bills.map((bill) => (
        <Card key={bill.id} className="flex bg-slate-50 shadow-xl"> {/* Add shadow to the Card */}
          <div className="flex flex-col items-center w-full"> {/* Center content horizontally */}
            <CardHeader>
              <CardTitle>
                <h3 className="text-center">{bill.name}</h3>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="w-full flex flex-col items-center"> {/* Center content within CardContent */}
            <hr className="w-full border-gray-300 border-dashed my-2" /> 
              {bill.payables.map((payable, index) => (
                <div key={index} className="flex justify-between w-full max-w-[300px]">
                  <span className="px-4">{payable.name}:</span>
                  <span>{payable.amount}tk</span>
                </div>
              ))}
              <hr className="w-full border-gray-300 border-dashed my-2" /> 
              <div className="flex justify-between w-full max-w-[300px] py-2">
                <span className="px-4">**Total:</span>
                <span>
                  {bill.payables.reduce((total, payable) => total + payable.amount, 0)}tk
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
