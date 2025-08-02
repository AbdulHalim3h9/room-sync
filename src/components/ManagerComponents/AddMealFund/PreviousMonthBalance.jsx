import React from "react";

const PreviousMonthBalance = ({ previousMonthDues }) => {
  if (previousMonthDues === null) return null;

  return (
    <div className={`border-l-4 p-4 rounded-lg mb-4 ${
      previousMonthDues >= 0 ? "bg-blue-50 border-blue-500" : "bg-red-50 border-red-500"
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
            previousMonthDues >= 0 ? "text-blue-600" : "text-red-600"
          }`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className={`font-medium ${
            previousMonthDues >= 0 ? "text-blue-700" : "text-red-700"
          }`}>Previous Month Balance</p>
          <p className={`text-sm ${
            previousMonthDues >= 0 ? "text-blue-600" : "text-red-600"
          } mt-1`}>
            {previousMonthDues >= 0 ? (
              <>Surplus of <span className="font-semibold">{previousMonthDues.toFixed(2)} BDT</span> from previous month</>
            ) : (
              <>Deficit of <span className="font-semibold">{Math.abs(previousMonthDues).toFixed(2)} BDT</span> from previous month</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreviousMonthBalance;