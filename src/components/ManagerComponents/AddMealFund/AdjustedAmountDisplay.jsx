import React from "react";

const AdjustedAmountDisplay = ({ amount, previousMonthDues, isFirstEntry, adjustedAmount }) => {
  if (!isFirstEntry || previousMonthDues === null || !amount) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="font-medium text-amber-800">Adjusted Amount</p>
          <div className="text-sm mt-1 space-y-1">
            <p className="text-amber-700">
              Original amount: <span className="font-medium">{Number(amount).toFixed(2)} BDT</span>
            </p>
            <p className="text-amber-700">
              {previousMonthDues >= 0 ? "Added" : "Subtracted"} balance: <span className="font-medium">{Math.abs(previousMonthDues).toFixed(2)} BDT</span>
            </p>
            <p className={`text-amber-900 font-semibold ${adjustedAmount >= 0 ? "text-amber-900" : "text-red-900"}`}>
              Final amount: {adjustedAmount.toFixed(2)} BDT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustedAmountDisplay;