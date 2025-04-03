import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format} from "date-fns";
import { membersData as members } from "@/membersData";
import DatePickerMealCount from "./DatePickerMealCount";  // Import DatePicker component
import { db } from "@/firebase"; // Import Firebase configuration
import { doc, getDoc, setDoc } from "firebase/firestore";

const DailyMealCountForm = () => {
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for the date picked
  const [dailyMealCount, setDailyMealCount] = useState({}); // State for meal counts
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [isConfirmed, setIsConfirmed] = useState(false); // Confirmation state
  const [monthlyMealCount, setMonthlyMealCount] = useState({}); // Monthly meal counts
  const [error, setError] = useState(""); // State to hold validation error message

  useEffect(() => {
    setDailyMealCount((prev) => ({
      ...prev,
      ...Object.fromEntries(members.map((member) => [member.member_id, ""])),
    }));
  }, []);

  useEffect(() => {
    // Reset the form and error when the selected date changes
    setDailyMealCount(Object.fromEntries(members.map((member) => [member.member_id, ""])));
    setError(""); // Reset the error state
  }, [selectedDate]);

  const handleInputChange = (e, member_id) => {
    const value = e.target.value;
    if (!isNaN(value) && parseInt(value) >= 0) {
      setDailyMealCount({ ...dailyMealCount, [member_id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate meal counts
    const isValid = Object.values(dailyMealCount).every((count) => count !== "" && count !== null);

    if (!isValid) {
      setError("All fields must be filled out!");
      return;
    }
    // if (error.length > 0) {
    //   return; // Prevent submission if there's an error
    // }
    // Check for missing dates
    const pickedMonth = format(selectedDate, "yyyy-MM");

    let starDate = 1;
    //
    try {
      // Extract month (YYYY-MM format)
const month = pickedMonth//////////////////////////////////////////////////
console.log("Month:", month);
// Reference the monthly document in Firestore
const docRef = doc(db, "individualMeals", month);

// Fetch existing data
const docSnap = await getDoc(docRef);
let existingData = docSnap.exists() ? docSnap.data() : { mealCounts: {} };

// Update the meal counts
for (const [memberId] of Object.entries(dailyMealCount)) {
  let meals = existingData.mealCounts[memberId] || []; // Get existing meals or initialize
  console.log("ExistingMealsData:", meals); // Log the meals array
  // Get the second last element from the meals array
  // if (meals.length == 0) {
  //   meals.push("00 0"); // Push a default value if the array is empty
  // }
  const secondLastMeal = meals.length > 1 ? meals[meals.length - 2] : "";
  
  // Extract the first two characters of the second last element
  starDate = meals.length == 0 ? 0 : parseInt(secondLastMeal.slice(0, 2));

  console.log(meals,secondLastMeal);
  console.log("StarDate:", starDate);  // Output the first two characters
}

    } catch (error) {
      console.log("Error fetching data:", error);
    }
    //

    const startDate = starDate;
    // setError(`Fill out from date ${startDate} first`); // Reset the error state
    console.log("Selected Date:", selectedDate.getDate());
    if (selectedDate.getDate() - startDate != 1) {
      setError(`Fill out from date ${startDate + 1} first`);
      return;
    }
    console.log("StarDate:", startDate);
    

    setDailyMealCount((prev) => ({
      ...prev,
      date: format(selectedDate, "yyyy-MM-dd"),
    }));

    console.log("Submitted Meal Counts:", dailyMealCount);
    setIsModalOpen(true); // Open modal when form is submitted
  };

  const handleReset = () => {
    setDailyMealCount(Object.fromEntries(members.map((member) => [member.member_id, ""])));
    setSelectedDate(""); // Reset the date picker as well
  };

  const addDailyToMonthlyMealCount = (dailyMealCount, monthlyMealCount) => {
    const { date, ...counts } = dailyMealCount;
    const [year, month, day] = date.split("-");
    const monthKey = `${year}-${month}`;
    const dayKey = parseInt(day, 10);

    const updatedMonthlyMealCount = { ...monthlyMealCount };

    Object.entries(counts).forEach(([memberId, count]) => {
      if (count) {
        const memberKey = `memberid_${memberId}`;

        if (!updatedMonthlyMealCount[memberKey]) {
          updatedMonthlyMealCount[memberKey] = {};
        }

        if (!updatedMonthlyMealCount[memberKey][monthKey]) {
          updatedMonthlyMealCount[memberKey][monthKey] = {};
        }

        updatedMonthlyMealCount[memberKey][monthKey][dayKey] = parseInt(count, 10);
      }
    });

    return updatedMonthlyMealCount;
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmed(true);
    setIsModalOpen(false);

    const updatedMonthlyMealCount = addDailyToMonthlyMealCount(dailyMealCount, monthlyMealCount);

    setMonthlyMealCount(updatedMonthlyMealCount); // Update the state
    alert("Meal counts submitted successfully!");
    console.log("Meal counts submitted:", dailyMealCount);
    console.log("Monthly meal count:", updatedMonthlyMealCount);

    try {
      // Extract month (YYYY-MM format)
      const month = dailyMealCount.date.slice(0, 7); // "2025-03"
    
      // Reference the monthly document
      const docRef = doc(db, "individualMeals", month);
    
      // Fetch existing data
      const docSnap = await getDoc(docRef);
      let existingData = docSnap.exists() ? docSnap.data() : { mealCounts: {} };
    
      // Extract meal data without the date
      const { date, ...mealData } = dailyMealCount;
    
      // Update the meal counts
      for (const [memberId, mealCount] of Object.entries(mealData)) {
        let meals = existingData.mealCounts[memberId] || []; // Get existing meals or initialize

        const lastSum = meals.length > 0 ? parseInt(meals[meals.length - 1].split(" ")[1], 10) : 0;
        
        // Remove the last index (previous sum)
        if (meals.length > 0) {
          meals.pop();
        }
    
        // Add new meal count
        // meals.push(parseInt(mealCount, 10));
        meals.push(`${dailyMealCount.date.slice(-2)} ` + parseInt(mealCount, 10));
        // console.log(`${dailyMealCount.date.slice(-2)} ` + parseInt(mealCount, 10));

    
        // Recalculate sum and add to the last index
        //const newSum = meals.reduce((acc, val) => acc + val, 0);
        const newSum = parseInt(lastSum, 10) + parseInt(mealCount, 10);
        console.log("New Sum:", newSum);
        meals.push(`Total ${newSum.toString()}`);
    
        // Update the member's meal count array
        existingData.mealCounts[memberId] = meals;
      }
    
      // Save updated data
      await setDoc(docRef, existingData, { merge: true });
    
      console.log("Meal counts updated successfully");
    } catch (e) {
      console.error("Error updating document: ", e);
    }
    

    setIsConfirmed(false); // Reset confirmation state
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-md mx-auto p-4 mb-8">
        <h1 className="text-xl font-bold mb-4">Set Daily Meal Count</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <DatePickerMealCount selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
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
