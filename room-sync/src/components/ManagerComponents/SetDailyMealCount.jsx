"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import DatePickerMealCount from "./DatePickerMealCount";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const DailyMealCountForm = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyMealCount, setDailyMealCount] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [monthlyMealCount, setMonthlyMealCount] = useState({});
  const [members, setMembers] = useState([]); // State for members from Firestore
  const [existingDocId, setExistingDocId] = useState(null); // Track existing document month

  const { toast } = useToast();

  // Fetch active members from Firestore on mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersRef = collection(db, "members");
        const q = query(membersRef, where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const membersData = querySnapshot.docs.map((doc) => ({
          member_id: doc.data().id, // Assuming 'id' is the field
          member_name: doc.data().fullname, // Assuming 'fullname' is the field
        }));
        setMembers(membersData);
        console.log("Fetched members:", membersData);

        // Initialize dailyMealCount with empty values for all members
        setDailyMealCount(
          Object.fromEntries(membersData.map((member) => [member.member_id, ""]))
        );
      } catch (error) {
        console.error("Error fetching members: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch members.",
          variant: "destructive",
        });
      }
    };

    fetchMembers();
  }, [toast]);

  // Fetch existing meal count data when the date changes
  useEffect(() => {
    const fetchMealCount = async () => {
      try {
        const pickedMonth = format(selectedDate, "yyyy-MM");
        const docRef = doc(db, "individualMeals", pickedMonth);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setExistingDocId(pickedMonth); // Store the month as the document ID
          const dayKey = format(selectedDate, "dd");
          const updatedDailyMealCount = {};

          members.forEach((member) => {
            const meals = data.mealCounts[member.member_id] || [];
            const dayEntry = meals.find((entry) => entry.startsWith(dayKey));
            updatedDailyMealCount[member.member_id] = dayEntry
              ? dayEntry.split(" ")[1]
              : "";
          });

          setDailyMealCount(updatedDailyMealCount);
        } else {
          // Reset fields if no data exists for the selected month
          setExistingDocId(null);
          setDailyMealCount(
            Object.fromEntries(members.map((member) => [member.member_id, ""]))
          );
        }
      } catch (error) {
        console.error("Error fetching meal count: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch existing meal count data.",
          variant: "destructive",
        });
      }
    };

    if (members.length > 0) {
      fetchMealCount();
    }
  }, [selectedDate, members, toast]);

  const handleInputChange = (e, member_id) => {
    const value = e.target.value;
    if (!isNaN(value) && parseInt(value) >= 0) {
      setDailyMealCount({ ...dailyMealCount, [member_id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = Object.values(dailyMealCount).every(
      (count) => count !== "" && count !== null
    );

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "All meal count fields must be filled out!",
        variant: "destructive",
      });
      return;
    }

    const pickedMonth = format(selectedDate, "yyyy-MM");
    let starDate = 1;

    try {
      const docRef = doc(db, "individualMeals", pickedMonth);
      const docSnap = await getDoc(docRef);
      let existingData = docSnap.exists() ? docSnap.data() : { mealCounts: {} };

      for (const [memberId] of Object.entries(dailyMealCount)) {
        let meals = existingData.mealCounts[memberId] || [];
        const secondLastMeal = meals.length > 1 ? meals[meals.length - 2] : "";
        starDate = meals.length === 0 ? 0 : parseInt(secondLastMeal.slice(0, 2));
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }

    const startDate = starDate;
    if (selectedDate.getDate() - startDate !== 1) {
      toast({
        title: "Validation Error",
        description: `Please fill out the meal count for date ${startDate + 1} first`,
        variant: "destructive",
      });
      return;
    }

    setDailyMealCount((prev) => ({
      ...prev,
      date: format(selectedDate, "yyyy-MM-dd"),
    }));

    setIsModalOpen(true);
  };

  const handleReset = () => {
    setDailyMealCount(
      Object.fromEntries(members.map((member) => [member.member_id, ""]))
    );
    setSelectedDate(new Date());
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
    setMonthlyMealCount(updatedMonthlyMealCount);

    try {
      const month = dailyMealCount.date.slice(0, 7);
      const docRef = doc(db, "individualMeals", month);
      const docSnap = await getDoc(docRef);
      let existingData = docSnap.exists() ? docSnap.data() : { mealCounts: {} };

      const { date, ...mealData } = dailyMealCount;

      for (const [memberId, mealCount] of Object.entries(mealData)) {
        let meals = existingData.mealCounts[memberId] || [];
        const lastSum = meals.length > 0 ? parseInt(meals[meals.length - 1].split(" ")[1], 10) : 0;

        // Remove existing entry for this date if it exists
        meals = meals.filter((entry) => !entry.startsWith(date.slice(-2)));
        if (meals.length > 0 && meals[meals.length - 1].startsWith("Total")) {
          meals.pop(); // Remove old total if it exists
        }

        meals.push(`${dailyMealCount.date.slice(-2)} ${parseInt(mealCount, 10)}`);
        const newSum = lastSum + parseInt(mealCount, 10) - (meals.length > 1 ? parseInt(meals[meals.length - 2].split(" ")[1], 10) : 0);
        meals.push(`Total ${newSum.toString()}`);

        existingData.mealCounts[memberId] = meals;
      }

      await setDoc(docRef, existingData, { merge: true });

      toast({
        title: "Success!",
        description: "Meal counts submitted successfully!",
        variant: "success",
      });
    } catch (e) {
      console.error("Error updating document: ", e);
      toast({
        title: "Error",
        description: "Failed to submit meal counts. Please try again.",
        variant: "destructive",
      });
    }

    setIsConfirmed(false);
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

          <div className="flex space-x-4">
            <Button onClick={handleReset} variant="secondary">
              Reset
            </Button>
            <Button type="submit">{existingDocId ? "Update" : "Set"} Counts</Button>
          </div>
        </form>

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