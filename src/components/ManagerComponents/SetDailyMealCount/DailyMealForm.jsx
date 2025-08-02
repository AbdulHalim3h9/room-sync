"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import DatePickerMealCount from "./DatePickerMealCount";
import ConfirmationModal from "./ConfirmationModal";
import MemberMealInput from "./MemberMealInput";
import useMealData from "./useMealData";
import { validateSubmission, handleConfirmSubmit } from "./mealUtils";

const DailyMealForm = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealCounts, setMealCounts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { members, datesWithData, existingDocId, fetchMembersAndDates, fetchMealCounts, toast } = useMealData(selectedDate, mealCounts, setMealCounts);

  const handleInputChange = (e, memberId) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
      setMealCounts((prev) => ({ ...prev, [memberId]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateSubmission(selectedDate, mealCounts, toast);
    if (isValid) {
      setMealCounts((prev) => ({
        ...prev,
        date: format(selectedDate, "yyyy-MM-dd"),
      }));
      setIsModalOpen(true);
    }
  };

  const handleReset = () => {
    setMealCounts(
      Object.fromEntries(members.map((member) => [member.id, ""]))
    );
    setSelectedDate(new Date());
  };

  return (
    <div className="w-full max-w-[98vw] sm:max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div>
        <div className="px-4 py-5 sm:py-6 border-b-2 border-purple-600 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-purple-800 tracking-tight">
            Set Daily Meal Count
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
            Record meal counts for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "today"}
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">About Daily Meal Counts</h3>
            <p className="text-xs text-gray-700">Use this form to record the number of meals consumed by each member for a specific date. This information is used to calculate meal costs.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4">
              <Label className="text-sm font-semibold text-gray-800 mb-3 block">Select Date</Label>
              <DatePickerMealCount
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                datesWithData={datesWithData}
              />
              <p className="text-xs text-gray-500 mt-2">Dates with existing data are highlighted</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Member Meal Counts</h3>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {members.length} members
                </div>
              </div>
              
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No active members for this month</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <MemberMealInput
                      key={member.id}
                      member={member}
                      mealCount={mealCounts[member.id]}
                      onChange={handleInputChange}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
              <Button 
                type="button"
                onClick={handleReset} 
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg h-11 shadow-sm transition-colors"
              >
                Reset Form
              </Button>
              <Button 
                type="submit" 
                disabled={members.length === 0}
                className="w-full sm:w-auto h-11 bg-purple-600 hover:bg-purple-700 text-white text-base font-medium rounded-lg shadow-sm transition-colors duration-200 focus:ring-4 focus:ring-purple-200 focus:ring-opacity-50 px-6"
              >
                {existingDocId ? "Update" : "Save"} Meal Counts
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => handleConfirmSubmit(mealCounts, members, datesWithData, setDatesWithData, setIsModalOpen, toast)}
        date={selectedDate}
        members={members}
        mealCounts={mealCounts}
      />
    </div>
  );
};

export default DailyMealForm;