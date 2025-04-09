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
  const [members, setMembers] = useState([]);
  const [existingDocId, setExistingDocId] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersRef = collection(db, "members");
        const q = query(membersRef, where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const membersData = querySnapshot.docs.map((doc) => ({
          member_id: doc.data().id,
          member_name: doc.data().fullname,
        }));
        setMembers(membersData);
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

  useEffect(() => {
    const fetchMealCount = async () => {
      try {
        const pickedMonth = format(selectedDate, "yyyy-MM");
        const docRef = doc(db, "individualMeals", pickedMonth);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setExistingDocId(pickedMonth);
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
    if (selectedDate.getDate() - startDate !== 1 && selectedDate.getDate() > startDate) {
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

  const saveMealSummariesAndConsumption = async (month, mealCounts) => {
    try {
      // Calculate total meals for all members and per member
      const memberTotals = {};
      let totalMealsAllMembers = 0;

      for (const [memberId, meals] of Object.entries(mealCounts)) {
        const totalEntry = meals.find((meal) => meal.startsWith("Total"));
        if (totalEntry) {
          const total = parseInt(totalEntry.split(" ")[1]) || 0;
          memberTotals[memberId] = total;
          totalMealsAllMembers += total;
        }
      }

      // Update mealSummaries
      const summaryRef = doc(db, "mealSummaries", month);
      const summarySnap = await getDoc(summaryRef);
      const existingData = summarySnap.exists() ? summarySnap.data() : {};
      const existingTotalMeals = existingData.totalMealsAllMembers || 0;
      const existingTotalSpendings = existingData.totalSpendings || 0;

      const updatedTotalMeals = existingTotalMeals + totalMealsAllMembers;
      const mealRate =
        updatedTotalMeals > 0
          ? (existingTotalSpendings / updatedTotalMeals).toFixed(2)
          : 0;

      await setDoc(
        summaryRef,
        {
          totalMealsAllMembers: updatedTotalMeals,
          mealRate: parseFloat(mealRate),
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

      // Save contribution and consumption for each member
      for (const member of members) {
        const memberId = member.member_id;
        const memberName = member.member_name;
        const totalMeals = memberTotals[memberId] || 0;
        const consumption = totalMeals * parseFloat(mealRate);

        const contribConsumpDocId = `${month}-${memberName}`; // e.g., "2025-04-John"
        const contribConsumpRef = doc(db, "contributionConsumption", contribConsumpDocId);
        const contribConsumpSnap = await getDoc(contribConsumpRef);
        const existingContribData = contribConsumpSnap.exists() ? contribConsumpSnap.data() : {};

        await setDoc(
          contribConsumpRef,
          {
            member: memberName,
            month,
            contribution: existingContribData.contribution || 0, // Preserve existing contribution
            consumption: consumption || 0,
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );

        console.log(`Updated contributionConsumption for ${contribConsumpDocId}: contribution=${existingContribData.contribution || 0}, consumption=${consumption}`);
      }

      console.log(`Updated total meals for ${month}: ${updatedTotalMeals}`);
      console.log(`Updated meal rate for ${month}: ${mealRate}`);
    } catch (error) {
      console.error("Error saving meal summaries or consumption:", error);
      toast({
        title: "Error",
        description: "Failed to save meal summaries or consumption.",
        variant: "destructive",
      });
    }
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

        meals = meals.filter(
          (entry) =>
            !entry.startsWith(date.slice(-2)) && !entry.startsWith("Total")
        );

        meals.push(`${date.slice(-2)} ${parseInt(mealCount, 10)}`);

        const newSum = meals.reduce((sum, entry) => {
          const [, count] = entry.split(" ");
          return sum + parseInt(count, 10);
        }, 0);

        meals.push(`Total ${newSum}`);
        existingData.mealCounts[memberId] = meals;
      }

      await setDoc(docRef, existingData, { merge: true });

      await saveMealSummariesAndConsumption(month, existingData.mealCounts);

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