"use client";

import React, { useState, useEffect } from "react";
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

const MealCountMonth = () => {
  const { memberId } = useParams();
  const { members, loading: membersLoading, error: membersError } = React.useContext(MembersContext);
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
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
  if (member?.meals) {
    member.meals.forEach((meal, index, arr) => {
      if (index === arr.length - 1 && meal.startsWith("Total")) {
        mealsMap.set("Total", meal.split(" ")[1]);
      } else {
        mealsMap.set(meal.slice(0, 2), meal.slice(3));
      }
    });
  }

  const firstHalf = new Map([...mealsMap].filter(([day]) => parseInt(day) <= 16 || day === "Total"));
  const secondHalf = new Map([...mealsMap].filter(([day]) => parseInt(day) > 16));

  const formatDate = (day) => {
    if (day === "Total") {
      return <span>Total</span>;
    }
    const dateString = `${month}-${day.padStart(2, "0")}`;
    const date = new Date(dateString);
    const options = { day: "numeric" };
    const weekday = date.toLocaleString("en-US", { weekday: "short" });
    const formattedDay = date.toLocaleDateString("en-US", options);
    return (
      <span>
        {formattedDay} <span className="text-gray-600">{weekday}</span>
      </span>
    );
  };

  if (isLoading || membersLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-gray-700">Loading meal data</p>
            <p className="text-sm text-gray-500">Please wait while we fetch your information</p>
          </div>
        </div>
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-red-500">
        {membersError}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">
          Monthly Meal Count
        </h2>
        <SingleMonthYearPicker
          value={month}
          onChange={setMonth}
          collections={["individualMeals"]}
        />
      </div>

      {!member ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No meal data available for this member.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-6">
            <div className={`flex ${secondHalf.size === 0 ? "w-full" : "gap-4 md:gap-8"}`}>
              <div className={secondHalf.size === 0 ? "w-full" : "w-1/2"}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-center font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700">Meal Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(firstHalf).map(([day, count], index) => (
                      <TableRow 
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`} 
                        key={index}
                      >
                        <TableCell className="p-3 text-center text-gray-700">{formatDate(day)}</TableCell>
                        <TableCell className="p-3 text-center font-medium text-indigo-600">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {secondHalf.size > 0 && (
                <div className="w-1/2">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-center font-semibold text-gray-700">Date</TableHead>
                        <TableHead className="text-center font-semibold text-gray-700">Meal Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from(secondHalf).map(([day, count], index) => (
                        <TableRow 
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`} 
                          key={index}
                        >
                          <TableCell className="p-3 text-center text-gray-700">{formatDate(day)}</TableCell>
                          <TableCell className="p-3 text-center font-medium text-indigo-600">{count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealCountMonth;