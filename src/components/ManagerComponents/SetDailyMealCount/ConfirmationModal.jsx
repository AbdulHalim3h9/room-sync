import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, date, members, mealCounts }) => {
  if (!isOpen) return null;

  const formattedDate = date ? format(new Date(date), "MMMM dd, yyyy (EEEE)") : "No Date Selected";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full bg-white rounded-md max-w-md animate-in fade-in duration-200">
        <div className="px-4 py-5 border-b-2 border-purple-600">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-800 tracking-tight">Meal Counts Summary</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">{formattedDate}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <p className="text-xs text-gray-700">Please review the meal counts below before confirming submission.</p>
          </div>
          
          <div className="max-h-[240px] overflow-y-auto mb-4 rounded-lg border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Member</th>
                  <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">Meals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{member.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 text-right font-medium">{mealCounts[member.id]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button 
              onClick={onClose} 
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg h-10"
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 px-5"
            >
              Confirm & Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;