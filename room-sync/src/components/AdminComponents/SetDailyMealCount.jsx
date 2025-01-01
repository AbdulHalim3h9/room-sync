import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
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
  // const [selectedDate, setSelectedDate] = useState(""); // State for selected date

  useEffect(() => {
    setDailyMealCount((prev) => ({
      ...prev,
      ...Object.fromEntries(members.map((member) => [member.member_id, ""])),
    }));
  }, []);
  

  const handleInputChange = (e, member_id) => {
    const value = e.target.value;
    if (!isNaN(value) && parseInt(value) >= 0) {
      setDailyMealCount({ ...dailyMealCount, [member_id]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDailyMealCount((prev) => ({ ...prev, date: format(selectedDate, "yyyy-MM-dd")}));
    
    console.log("Submitted Meal Counts:", dailyMealCount);
    setIsModalOpen(true); // Open modal when form is submitted
  };

  const handleReset = () => {
    setDailyMealCount(
      Object.fromEntries(members.map((member) => [member.id, ""]))
    );
    setSelectedDate(""); // Reset the date picker as well
  };

  // Confirm submission
  const handleConfirmSubmit = () => {
    setIsConfirmed(true); // Set confirmation state to true
    setIsModalOpen(false); // Close modal
    alert("Meal counts submitted successfully!");
    console.log("Meal counts submitted:", dailyMealCount);
    console.log("Date selected:", selectedDate);
    // Here you can perform further actions like saving to Firestore
  };

  // Close modal without submitting
  const closeModal = () => {
    setIsModalOpen(false);
  };


  return (
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
              {selectedDate ? format(selectedDate, "EEEE, MMM dd, yyyy") : <span>Pick the date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
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
              placeholder="0"
              className="w-[6ch] text-center appearance-none"
            />
          </div>
        ))}

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
            <h3 className="font-light mb-4">{selectedDate ? format(selectedDate, "MMM dd, EEEE") : "No Date Selected"}</h3>
            <ul>
              {members.map((member) => (
                <li className="p-2 flex justify-between" key={member.member_id}>
                  <span>{member.member_name}:</span> <span>{dailyMealCount[member.member_id]}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between">
              <Button onClick={closeModal} variant="secondary">
                Close
              </Button>
              <Button onClick={handleConfirmSubmit}>
                Confirm Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMealCountForm;
