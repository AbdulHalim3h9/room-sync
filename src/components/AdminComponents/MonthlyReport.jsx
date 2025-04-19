// src/components/AdminComponents/MonthlyReport.jsx
import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
// import { FaFileAlt, FaTimes } from 'react-icons/fa';

const MonthlyReport = ({ members, transactions, meals }) => {
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [monthTitle, setMonthTitle] = useState('');

  useEffect(() => {
    // Calculate previous month
    const previousMonth = subMonths(new Date(), 1);
    setMonthTitle(format(previousMonth, 'MMMM yyyy'));
    
    // Calculate report data for previous month
    if (members && transactions && meals) {
      calculateReportData(previousMonth);
    }
  }, [members, transactions, meals]);

  const calculateReportData = (targetMonth) => {
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    
    const data = members.map(member => {
      // Filter transactions and meals for this member in the target month
      const memberTransactions = transactions.filter(t => 
        t.memberId === member.id && 
        new Date(t.date) >= monthStart && 
        new Date(t.date) <= monthEnd
      );
      
      const memberMeals = meals.filter(m => 
        m.memberId === member.id && 
        new Date(m.date) >= monthStart && 
        new Date(m.date) <= monthEnd
      );
      
      // Calculate metrics
      const fundedAmount = memberTransactions
        .filter(t => t.type === 'FUND')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const mealCount = memberMeals.length;
      
      const consumedAmount = memberMeals
        .reduce((sum, m) => sum + m.cost, 0);
      
      const balance = fundedAmount - consumedAmount;
      
      return {
        id: member.id,
        name: member.name,
        fundedAmount,
        mealCount,
        consumedAmount,
        balance // Positive means due to member, negative means member owes
      };
    });
    
    setReportData(data);
  };

  return (
    <>
      {/* Floating action button */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
        <button
          onClick={() => setShowReport(!showReport)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
          aria-label="Show monthly report"
        >
          {/* <FaFileAlt size={24} /> */}
        </button>
      </div>

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Financial Report: {monthTitle}</h2>
              <button 
                onClick={() => setShowReport(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                {/* <FaTimes size={20} /> */}
              </button>
            </div>
            
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funded Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumed Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((row) => (
                      <tr key={row.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{row.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.fundedAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.mealCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.consumedAmount.toFixed(2)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${row.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.balance >= 0 ? 
                            `Due: ${row.balance.toFixed(2)}` : 
                            `Owes: ${Math.abs(row.balance).toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonthlyReport;