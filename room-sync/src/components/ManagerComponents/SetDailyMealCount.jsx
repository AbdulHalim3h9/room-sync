import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, isAfter, endOfToday, eachDayOfInterval, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { membersData as members } from "@/membersData";

const DailyMealCountForm = () => {
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for the date picked
  const [dailyMealCount, setDailyMealCount] = useState({}); // State for meal counts
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [isConfirmed, setIsConfirmed] = useState(false); // Confirmation state
  const [monthlyMealCount, setMonthlyMealCount] = useState({}); // Monthly meal counts
  const [error, setError] = useState(""); // State to hold validation error message
  const [missingDates, setMissingDates] = useState([]); // State to hold missing dates

  useEffect(() => {
    setDailyMealCount((prev) => ({
      ...prev,
      ...Object.fromEntries(members.map((member) => [member.member_id, ""])),
    }));
  }, []);

  useEffect(() => {
    // Reset the form and error when the selected date changes
    setDailyMealCount(
      Object.fromEntries(members.map((member) => [member.member_id, ""]))
    );
    setError(""); // Reset the error state
  }, [selectedDate]);

  const handleInputChange = (e, member_id) => {
    const value = e.target.value;
    if (!isNaN(value) && parseInt(value) >= 0) {
      setDailyMealCount({ ...dailyMealCount, [member_id]: value });
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  // Validate meal counts
  const isValid = Object.values(dailyMealCount).every((count) => count !== "" && count !== null);

  if (!isValid) {
    setError("All fields must be filled out!");
    return;
  }


  // Check for missing dates
const pickedMonth = format(selectedDate, "yyyy-MM");

// Flatten all dates for the picked month across all members
const aggregatedDays = Object.values(monthlyMealCount).flatMap(memberData => {
  return memberData[pickedMonth] ? Object.keys(memberData[pickedMonth]).map(Number) : [];
});

// Find the earliest and latest day of data for the picked month
const startDate = aggregatedDays.length > 0 
  ? new Date(`${pickedMonth}-${Math.max(...aggregatedDays)}`) 
  : startOfMonth(selectedDate);

const endDate = selectedDate;

// Generate all dates in the interval
const allDates = eachDayOfInterval({ start: startDate, end: endDate });

// Filter out missing dates
const missingDates = allDates.filter(date => {
  const day = Number(format(date, "d")); // Get the day of the month as a number
  return !aggregatedDays.includes(day);
});



  // Filter out the selected date from the missing dates

  const filteredMissing = missingDates.filter(date => format(date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd"));

  if (filteredMissing.length > 0) {
    const firstMissingDate = filteredMissing[0];
    setMissingDates(filteredMissing);
    let errorMessage;
    if (filteredMissing.length === 1) {
      errorMessage = `Fill in the meal count for ${format(firstMissingDate, "MMM dd")}`;
    } else if (filteredMissing.length === 2) {
      errorMessage = `Fill in the meal counts for ${format(firstMissingDate, "MMM dd")} and ${format(filteredMissing[1], "MMM dd")}`;
    } else {
      errorMessage = `Fill in the meal counts for ${filteredMissing.length} missing dates starting from ${format(firstMissingDate, "MMM dd")} to ${format(filteredMissing[filteredMissing.length - 1], "MMM dd")}`;
    }
    alert(errorMessage);
    setError(errorMessage);
    return;
  }

  setDailyMealCount((prev) => ({
    ...prev,
    date: format(selectedDate, "yyyy-MM-dd"),
  }));

  console.log("Submitted Meal Counts:", dailyMealCount);
  setIsModalOpen(true); // Open modal when form is submitted
};


  const handleReset = () => {
    setDailyMealCount(
      Object.fromEntries(members.map((member) => [member.member_id, ""]))
    );
    setSelectedDate(""); // Reset the date picker as well
  };

  // Add daily meal count to monthly meal count
  const addDailyToMonthlyMealCount = (dailyMealCount, monthlyMealCount) => {
    const { date, ...counts } = dailyMealCount;
    const [year, month, day] = date.split("-");
    const monthKey = `${year}-${month}`;
    const dayKey = parseInt(day, 10);

    const updatedMonthlyMealCount = { ...monthlyMealCount };

    Object.entries(counts).forEach(([memberId, count]) => {
      if (count) {
        const memberKey = `memberid_${memberId}`;

        // Initialize the member if it doesn't exist
        if (!updatedMonthlyMealCount[memberKey]) {
          updatedMonthlyMealCount[memberKey] = {};
        }

        // Initialize the month if it doesn't exist
        if (!updatedMonthlyMealCount[memberKey][monthKey]) {
          updatedMonthlyMealCount[memberKey][monthKey] = {};
        }

        // Add the meal count for the specific day
        updatedMonthlyMealCount[memberKey][monthKey][dayKey] =
          parseInt(count, 10);
      }
    });

    return updatedMonthlyMealCount;
  };

  // Confirm submission
  const handleConfirmSubmit = () => {
    setIsConfirmed(true); // Set confirmation state to true
    setIsModalOpen(false); // Close modal

    const updatedMonthlyMealCount = addDailyToMonthlyMealCount(
      dailyMealCount,
      monthlyMealCount
    );

    setMonthlyMealCount(updatedMonthlyMealCount); // Update the state
    alert("Meal counts submitted successfully!");
    console.log("Meal counts submitted:", dailyMealCount);
    console.log("Monthly meal count:", updatedMonthlyMealCount);
    setIsConfirmed(false); // Reset confirmation state
  };

  // Close modal without submitting
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-md mx-auto p-4 mb-8">
        <h1 className="text-xl font-bold mb-4">Set Daily Meal Count</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            {/* this is the date picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[230px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "EEEE, MMM dd, yyyy")
                    : "Pick the date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => isAfter(date, endOfToday())}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Meal Counts for Members */}
          {members.map((member) => (
            <div key={member.member_id} className="flex items-center space-x-12">
              <Label htmlFor={`member-${member.member_id}`} className="w-28">
                {member.member_name}
              </Label>
              <Input
                id={`member-${member.member_id}`}
                type="text"
                value={dailyMealCount[member.member_id] || ""}
                onChange={(e) => handleInputChange(e, member.member_id)}
                placeholder=""
                className="w-[6ch] text-center appearance-none"
              />
            </div>
          ))}

          {/* Validation Error Message */}
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* Submit and Reset Buttons */}
          <div className="flex space-x-4">
            <Button onClick={handleReset} variant="secondary">
              Reset
            </Button>
            <Button type="submit">Set Counts</Button>
          </div>
        </form>

        {/* Modal for showing summary and confirming */}
        {isModalOpen && !isConfirmed && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-[250px]">
              <h2 className="text-lg font-semibold">Meal Counts Summary </h2>
              <h3 className="font-light mb-4">
                {selectedDate
                  ? format(selectedDate, "MMM dd, EEEE")
                  : "No Date Selected"}
              </h3>
              <ul>
                {members.map((member) => (
                  <li className="p-2 flex justify-between" key={member.member_id}>
                    <span>{member.member_name}:</span>{" "}
                    <span>{dailyMealCount[member.member_id]}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between">
                <Button onClick={closeModal} variant="secondary">
                  Close
                </Button>
                <Button onClick={handleConfirmSubmit}>Confirm Submit</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyMealCountForm;
