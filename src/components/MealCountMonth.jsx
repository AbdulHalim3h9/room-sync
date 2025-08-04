"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { MembersContext } from "@/contexts/MembersContext";
import { MonthContext } from "@/contexts/MonthContext";

const MealCountMonth = () => {
  const { memberId } = useParams();
  const { members, loading: membersLoading, error: membersError } = useContext(MembersContext);
  const { month, setMonth } = useContext(MonthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [mealData, setMealData] = useState([]);

  const fetchMealData = async (selectedMonth) => {
    if (!selectedMonth) {
      return;
    }
    setIsLoading(true);
    try {
      const docRef = doc(db, "individualMeals", selectedMonth);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data().mealCounts || {};
        const formattedData = Object.entries(data).map(([id, meals]) => ({
          memberId: id,
          meals,
        }));
        setMealData(formattedData);
      } else {
        setMealData([]);
      }
    } catch (error) {
      console.error("Error fetching meal data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (month) fetchMealData(month);
  }, [month]);

  const member = mealData.find((m) => m.memberId === memberId) || mealData[0];

  const mealsMap = new Map();
  let totalCount = "0";
  if (member?.meals) {
    member.meals.forEach((meal, index, arr) => {
      if (index === arr.length - 1 && meal.startsWith("Total")) {
        totalCount = meal.split(" ")[1];
      } else {
        mealsMap.set(meal.slice(0, 2), meal.slice(3));
      }
    });
  }

  // Split into two halves and sort each half
  const firstHalf = new Map(
    [...mealsMap.entries()]
      .filter(([day]) => parseInt(day) <= 16)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  );
  const secondHalf = new Map(
    [...mealsMap.entries()]
      .filter(([day]) => parseInt(day) > 16)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  );

  // Combine into a single array of rows for synchronized display
  const maxRows = Math.max(firstHalf.size, secondHalf.size);
  const tableRows = Array.from({ length: maxRows }, (_, i) => {
    const firstHalfEntries = [...firstHalf.entries()];
    const secondHalfEntries = [...secondHalf.entries()];
    
    return {
      firstHalf: firstHalfEntries[i] || [],
      secondHalf: secondHalfEntries[i] || [],
    };
  });

  const formatDate = (day) => {
    if (!day) return null;
    const dateString = `${month}-${day.padStart(2, "0")}`;
    const date = new Date(dateString);
    const weekday = date.toLocaleString("en-US", { weekday: "short" });
    const formattedDay = date.toLocaleDateString("en-US", { day: "numeric" });
    return (
      <span>
        {formattedDay} <span className="text-gray-500 text-xs">{weekday}</span>
      </span>
    );
  };

  if (isLoading || membersLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (membersError) {
    return <div className="text-red-500 text-center p-4">{membersError}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Meal Count for {member?.memberName || 'Member'}</h2>
        <SingleMonthYearPicker 
          value={month}
          onChange={setMonth}
          collections={["individualMeals"]}
          className="h-9 sm:h-10 rounded-lg border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 shadow-sm"
        />
      </div>

      {!member ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No meal data available for this member.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-4">
            {/* First table (Days 1-16) */}
            <div
              className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${
                secondHalf.size === 0 ? "w-full" : "flex-1"
              }`}
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-2/3 px-2 py-2 text-left font-medium text-gray-700">
                      Date (1-16)
                    </TableHead>
                    <TableHead className="w-1/3 px-2 py-2 text-left font-medium text-gray-700">
                      Meals
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map((row, index) => (
                    <TableRow
                      key={row.firstHalf[0] || `empty-${index}`}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <TableCell className="px-2 py-2">
                        {formatDate(row.firstHalf[0])}
                      </TableCell>
                      <TableCell className="px-2 py-2 font-medium text-indigo-600">
                        {row.firstHalf[1] || ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Second table (Days 17-31) - Conditionally rendered */}
            {secondHalf.size > 0 && (
              <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-2/3 px-2 py-2 text-left font-medium text-gray-700">
                        Date (17-31)
                      </TableHead>
                      <TableHead className="w-1/3 px-2 py-2 text-left font-medium text-gray-700">
                        Meals
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableRows.map((row, index) => (
                      <TableRow
                        key={row.secondHalf[0] || `empty-${index}`}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <TableCell className="px-2 py-2">
                          {formatDate(row.secondHalf[0])}
                        </TableCell>
                        <TableCell className="px-2 py-2 font-medium text-indigo-600">
                          {row.secondHalf[1] || ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Total Row */}
          <div
            className={`bg-white rounded-lg border border-gray-200 p-4 ${
              secondHalf.size > 0 ? "xl:w-full" : "xl:w-1/2"
            }`}
          >
            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-md">
              <span className="font-medium text-gray-700">Total Meals This Month</span>
              <span className="text-xl font-bold text-indigo-600">{totalCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealCountMonth;