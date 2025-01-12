import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import billsData from "@/bills.json";

const Payables = () => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    // Set the bills data once the component is mounted
    setBills(billsData.bills);
  }, []);

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 sm:gap-2 md:gap-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
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
  );
};

export default Payables;
