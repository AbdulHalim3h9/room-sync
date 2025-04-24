"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import DatePickerMealCount from "./DatePickerMealCount";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, date, members, mealCounts }) => {
  if (!isOpen) return null;

  const formattedDate = date ? format(new Date(date), "MMMM dd, yyyy (EEEE)") : "No Date Selected";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full bg-white rounded-md max-w-md animate-in fade-in duration-200">
        <div className="px-4 py-5 border-b-2 border-purple-600">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-800 tracking-tight">Meal Counts Summary</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
            {formattedDate}
          </p>
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

const MemberMealInput = ({ member, mealCount, onChange }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold text-sm">
        {member.name.charAt(0)}
      </div>
      <Label 
        htmlFor={`member-${member.id}`} 
        className="text-sm font-medium text-gray-800 cursor-pointer"
      >
        {member.name}
      </Label>
    </div>
    
    <div className="relative w-full sm:w-auto">
      <Input
        id={`member-${member.id}`}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={mealCount || ""}
        onChange={(e) => onChange(e, member.id)}
        placeholder="0"
        className="w-full sm:w-24 h-10 text-center font-medium text-gray-800 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none sm:hidden">
        meals
      </div>
    </div>
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
      const selectedMonth = format(selectedDate, "yyyy-MM");
      const membersRef = collection(db, "members");
      const querySnapshot = await getDocs(membersRef);
      const membersData = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (!data.id || !data.fullname) {
            console.warn(`Invalid member data in doc ${doc.id}:`, data);
            return null;
          }
          return {
            id: data.id,
            name: data.fullname,
            activeFrom: data.activeFrom,
            archiveFrom: data.archiveFrom,
          };
        })
        .filter((member) => {
          if (!member || !member.activeFrom) return false;
          const activeFromDate = new Date(member.activeFrom + "-01");
          const selectedMonthDate = new Date(selectedMonth + "-01");
          if (activeFromDate > selectedMonthDate) return false;
          if (member.archiveFrom) {
            const archiveFromDate = new Date(member.archiveFrom + "-01");
            return selectedMonthDate < archiveFromDate;
          }
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      if (membersData.length === 0) {
        toast({
          title: "No Active Members",
          description: `No members are active for ${selectedMonth}.`,
          variant: "destructive",
        });
      }

      setMembers(membersData);
      setMealCounts(
        Object.fromEntries(membersData.map((member) => [member.id, ""]))
      );

      const individualMealsRef = collection(db, "individualMeals");
      const mealDocs = await getDocs(individualMealsRef);
      const dates = new Set();

      for (const monthDoc of mealDocs.docs) {
        const month = monthDoc.id;
        if (!/^\d{4}-\d{2}$/.test(month)) {
          console.log(`Skipping invalid month: ${month}`);
          continue;
        }
        const data = monthDoc.data();
        Object.values(data.mealCounts || {}).forEach((meals) => {
          meals.forEach((entry) => {
            if (!entry.startsWith("Total")) {
              const [day] = entry.split(" ");
              const dateStr = `${month}-${day.padStart(2, "0")}`;
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                dates.add(date.getTime());
              }
            }
          });
        });
      }

      setDatesWithData(Array.from(dates).map((time) => new Date(time)));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch members or meal data.",
        variant: "destructive",
      });
    }
  }, [selectedDate, toast]);

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
    if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
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

      // Calculate total meals per member and overall
      for (const [memberId, meals] of Object.entries(mealCountsData)) {
        const totalEntry = meals.find((meal) => meal.startsWith("Total"));
        if (totalEntry) {
          const total = parseInt(totalEntry.split(" ")[1]) || 0;
          memberTotals[memberId] = total;
          totalMealsAllMembers += total;
        }
      }

      // Fetch mealSummaries
      const summaryRef = doc(db, "mealSummaries", month);
      const summarySnap = await getDoc(summaryRef);
      const existingData = summarySnap.exists() ? summarySnap.data() : {};
      const existingTotalMeals = existingData.totalMealsAllMembers || 0;
      const existingTotalSpendings = existingData.totalSpendings || 0;

      // Check if totalSpendings is available
      if (existingTotalSpendings === 0) {
        console.warn(`No totalSpendings found for month ${month}. Cannot calculate mealRate.`);
        toast({
          title: "Warning",
          description: "No spending data available for this month. Consumption will be set to 0.",
          variant: "destructive",
        });
      }

      const updatedTotalMeals = existingTotalMeals + totalMealsAllMembers;
      const mealRate =
        existingTotalSpendings > 0 && updatedTotalMeals > 0
          ? (existingTotalSpendings / updatedTotalMeals).toFixed(2)
          : 0;

      // Update mealSummaries
      await setDoc(
        summaryRef,
        {
          totalMealsAllMembers: updatedTotalMeals,
          totalSpendings: existingTotalSpendings,
          mealRate: parseFloat(mealRate),
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update contributionConsumption for each member
      for (const member of members) {
        const memberId = member.id;
        const memberName = member.name;
        const totalMeals = memberTotals[memberId] || 0;
        const consumption = totalMeals * parseFloat(mealRate);
        
        // Debug logging
        console.log({
          memberId,
          memberName,
          totalMeals,
          mealRate,
          consumption,
          existingTotalSpendings,
          updatedTotalMeals,
        });

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
        onConfirm={handleConfirmSubmit}
        date={selectedDate}
        members={members}
        mealCounts={mealCounts}
      />
    </div>
  );
};

export default DailyMealForm;