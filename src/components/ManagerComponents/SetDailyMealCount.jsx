"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import DatePickerMealCount from "./DatePickerMealCount";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, date, members, mealCounts }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[250px]">
        <h2 className="text-lg font-semibold">Meal Counts Summary</h2>
        <h3 className="font-light mb-4">
          {date ? format(date, "MMM dd, EEEE") : "No Date Selected"}
        </h3>
        <ul>
          {members.map((member) => (
            <li className="p-2 flex justify-between" key={member.id}>
              <span>{member.name}:</span>
              <span>{mealCounts[member.id]}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
          <Button onClick={onConfirm}>Confirm Submit</Button>
        </div>
      </div>
    </div>
  );
};

const MemberMealInput = ({ member, mealCount, onChange }) => (
  <div className="flex items-center space-x-12">
    <Label htmlFor={`member-${member.id}`} className="w-28">
      {member.name}
    </Label>
    <Input
      id={`member-${member.id}`}
      type="text"
      value={mealCount || ""}
      onChange={(e) => onChange(e, member.id)}
      placeholder=""
      className="w-[6ch] text-center appearance-none"
    />
  </div>
);

const DailyMealForm = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealCounts, setMealCounts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [existingDocId, setExistingDocId] = useState(null);
  const [datesWithData, setDatesWithData] = useState([]);
  const { toast } = useToast();

  const fetchMembersAndDates = useCallback(async () => {
    try {
      const membersRef = collection(db, "members");
      const q = query(membersRef, where("status", "==", "active"));
      const querySnapshot = await getDocs(q);
      const membersData = querySnapshot.docs.map((doc) => ({
        id: doc.data().id,
        name: doc.data().fullname,
      }));

      setMembers(membersData);
      setMealCounts(
        Object.fromEntries(membersData.map((member) => [member.id, ""]))
      );

      const individualMealsRef = collection(db, "individualMeals");
      const mealDocs = await getDocs(individualMealsRef);
      const dates = [];

      mealDocs.forEach((doc) => {
        const data = doc.data();
        const month = doc.id;
        Object.values(data.mealCounts).forEach((meals) => {
          meals.forEach((entry) => {
            if (!entry.startsWith("Total")) {
              const [day] = entry.split(" ");
              const dateStr = `${month}-${day.padStart(2, "0")}`;
              dates.push(new Date(dateStr));
            }
          });
        });
      });

      setDatesWithData(dates);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch members or meal data.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchMealCounts = useCallback(async () => {
    try {
      const monthKey = format(selectedDate, "yyyy-MM");
      const docRef = doc(db, "individualMeals", monthKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setExistingDocId(monthKey);
        const data = docSnap.data();
        const dayKey = format(selectedDate, "dd");
        const updatedMealCounts = {};

        members.forEach((member) => {
          const meals = data.mealCounts[member.id] || [];
          const dayEntry = meals.find((entry) => entry.startsWith(dayKey));
          updatedMealCounts[member.id] = dayEntry ? dayEntry.split(" ")[1] : "";
        });

        setMealCounts(updatedMealCounts);
      } else {
        setExistingDocId(null);
        setMealCounts(
          Object.fromEntries(members.map((member) => [member.id, ""]))
        );
      }
    } catch (error) {
      console.error("Error fetching meal counts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch meal count data.",
        variant: "destructive",
      });
    }
  }, [selectedDate, members, toast]);

  useEffect(() => {
    fetchMembersAndDates();
  }, [fetchMembersAndDates]);

  useEffect(() => {
    if (members.length > 0) {
      fetchMealCounts();
    }
  }, [fetchMealCounts, members]);

  const handleInputChange = (e, memberId) => {
    const value = e.target.value;
    if (!isNaN(value) && parseInt(value) >= 0) {
      setMealCounts((prev) => ({ ...prev, [memberId]: value }));
    }
  };

  const validateSubmission = async () => {
    if (!Object.values(mealCounts).every((count) => count !== "" && count !== null)) {
      toast({
        title: "Validation Error",
        description: "All meal count fields must be filled out!",
        variant: "destructive",
      });
      return false;
    }

    const month = format(selectedDate, "yyyy-MM");
    let startDay = 1;

    try {
      const docRef = doc(db, "individualMeals", month);
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.exists() ? docSnap.data() : { mealCounts: {} };

      for (const [memberId] of Object.entries(mealCounts)) {
        const meals = existingData.mealCounts[memberId] || [];
        const secondLastMeal = meals.length > 1 ? meals[meals.length - 2] : "";
        startDay = meals.length === 0 ? 0 : parseInt(secondLastMeal.slice(0, 2));
      }
    } catch (error) {
      console.error("Error validating data:", error);
      return false;
    }

    if (selectedDate.getDate() - startDay !== 1 && selectedDate.getDate() > startDay) {
      toast({
        title: "Validation Error",
        description: `Please fill out the meal count for date ${startDay + 1} first`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateSubmission();
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

  const updateMonthlyMealCounts = (dailyCounts) => {
    const { date, ...counts } = dailyCounts;
    const [year, month, day] = date.split("-");
    const monthKey = `${year}-${month}`;
    const dayKey = parseInt(day, 10);

    const updatedCounts = {};
    Object.entries(counts).forEach(([memberId, count]) => {
      if (count) {
        const memberKey = `memberid_${memberId}`;
        updatedCounts[memberKey] = {
          ...updatedCounts[memberKey],
          [monthKey]: {
            ...updatedCounts[memberKey]?.[monthKey],
            [dayKey]: parseInt(count, 10),
          },
        };
      }
    });

    return updatedCounts;
  };

  const saveSummariesAndConsumption = async (month, mealCountsData) => {
    try {
      const memberTotals = {};
      let totalMealsAllMembers = 0;

      for (const [memberId, meals] of Object.entries(mealCountsData)) {
        const totalEntry = meals.find((meal) => meal.startsWith("Total"));
        if (totalEntry) {
          const total = parseInt(totalEntry.split(" ")[1]) || 0;
          memberTotals[memberId] = total;
          totalMealsAllMembers += total;
        }
      }

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

      for (const member of members) {
        const memberId = member.id;
        const memberName = member.name;
        const totalMeals = memberTotals[memberId] || 0;
        const consumption = totalMeals * parseFloat(mealRate);

        const contribConsumpDocId = `${month}-${memberName}`;
        const contribConsumpRef = doc(db, "contributionConsumption", contribConsumpDocId);
        const contribConsumpSnap = await getDoc(contribConsumpRef);
        const existingContribData = contribConsumpSnap.exists() ? contribConsumpSnap.data() : {};

        await setDoc(
          contribConsumpRef,
          {
            member: memberName,
            month,
            contribution: existingContribData.contribution || 0,
            consumption: consumption || 0,
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Error saving summaries or consumption:", error);
      toast({
        title: "Error",
        description: "Failed to save meal summaries or consumption.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);
    const month = mealCounts.date.slice(0, 7);
    const updatedMonthlyCounts = updateMonthlyMealCounts(mealCounts);

    try {
      const docRef = doc(db, "individualMeals", month);
      const docSnap = await getDoc(docRef);
      let existingData = docSnap.exists() ? docSnap.data() : { mealCounts: {} };

      const { date, ...mealData } = mealCounts;

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
      await saveSummariesAndConsumption(month, existingData.mealCounts);

      const newDate = new Date(mealCounts.date);
      if (!datesWithData.some((d) => d.getTime() === newDate.getTime())) {
        setDatesWithData((prev) => [...prev, newDate]);
      }

      toast({
        title: "Success!",
        description: "Meal counts submitted successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Error",
        description: "Failed to submit meal counts. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-md mx-auto p-4 mb-8">
        <h1 className="text-xl font-bold mb-4">Set Daily Meal Count</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DatePickerMealCount
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            datesWithData={datesWithData}
          />
          {members.map((member) => (
            <MemberMealInput
              key={member.id}
              member={member}
              mealCount={mealCounts[member.id]}
              onChange={handleInputChange}
            />
          ))}
          <div className="flex space-x-4">
            <Button onClick={handleReset} variant="secondary">
              Reset
            </Button>
            <Button type="submit">{existingDocId ? "Update" : "Set"} Counts</Button>
          </div>
        </form>
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSubmit}
          date={selectedDate}
          members={members}
          mealCounts={mealCounts}
        />
      </div>
    </div>
  );
};

export default DailyMealForm;