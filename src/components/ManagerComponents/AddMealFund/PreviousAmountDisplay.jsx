import React from "react";

const PreviousAmountDisplay = ({ previousAmount }) => {
  if (previousAmount === 0) return null;

  return (
    <div className="bg-green-50 rounded-lg border border-green-100 p-4 text-sm text-gray-700 flex items-center">
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <span className="font-medium text-gray-800">Current Month Contribution:</span>{" "}
        <span className={`font-semibold ${previousAmount >= 0 ? "text-green-700" : "text-red-700"}`}>
          {previousAmount.toFixed(2)} BDT
        </span>
      </div>
    </div>
  );
};

export default PreviousAmountDisplay;