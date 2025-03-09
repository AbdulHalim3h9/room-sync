import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "react-router-dom";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { useMonth } from "@/App";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/firebase"; // Import Firebase configuration


const MealCountMonth = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const { member_id } = useParams();
  const { month, setMonth } = useMonth(); // Use the context to manage the month state

  // Convert member_id to string for consistency
  const member = data.find((m) => String(m.memberId) === String(member_id));
  console.log("Member:", member);

  let mapMeals = new Map();
  member?.meals.forEach((meal, index, arr) => {
    if (index === arr.length - 1) {
      // Skip slicing for the last meal
      mapMeals.set(meal.slice(0, 5), meal.slice(6));
    } else {
      mapMeals.set(meal.slice(0, 2), meal.slice(3));
    }
  });
  

  // Create two new Maps for the split ranges
  let firstColumn = new Map();
  let secondColumn = new Map();
  let day = 1;
  // Iterate over mapMeals and distribute keys
  mapMeals.forEach((value, key) => {
    console.log("keyyyyyy:", key, value);
    if (day >= 1 && day <= 16) {
      firstColumn.set(key, value);
    } else if (day >= 17 && day <= 32) {
      secondColumn.set(key, value);
    }
    day++;
  });

  const handleDateChange = (newMonth) => {
    setMonth(newMonth); // Set the new month in the context
  };

  useEffect(() => {
    if (!month) return;
    console.log(month);
    const fetchData = async () => {
      setLoading(true);
      try {
        // Reference the document for the selected month
        const docRef = doc(db, "individualMeals", month);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const mealData = docSnap.data().mealCounts || {};
          console.log("Fetched data:", mealData);

          // Convert the object into an array of members
          const formattedData = Object.entries(mealData).map(([memberId, meals]) => ({
            memberId,
            meals,
          }));

          setData(formattedData); // Update state with formatted data
          console.log("Formatted data:", formattedData);
        } else {
          console.log("No data found for this month");
          setData([]); // Reset if no data is found
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month]); // Runs when month changes

  if (loading) {
    return (
      <div className="flex justify-center mt-24 items-center">
        <img src="/loading.gif" alt="Loading..." className="w-16 h-16" />
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateF) => {
    if (dateF.startsWith("T")) {
      return(
      <span>Total</span>
      );
    }
    const dateString = `${month}-${dateF}`;
    const date = new Date(dateString);
    const options = { day: "numeric" };
    const weekday = date.toLocaleString("en-US", { weekday: "short" });
    const formattedDate = date.toLocaleDateString("en-US", options);
    return (
      <span>
        {formattedDate} <span className="text-gray-600">{weekday}</span>
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-end mr-4 md:mr-8 mb-10">
        <SingleMonthYearPicker onChange={handleDateChange} />
      </div>

      <div className="flex gap-4 md:gap-8">
        <div className={`flex ${secondColumn.size === 0 ? "w-full" : "gap-4 md:gap-8"}`}>
          {/* First Column: 1-16 */}
          <div className={secondColumn.size === 0 ? "w-full" : "w-1/2"}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Meal Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(firstColumn).map(([key, count], index) => (
                  <TableRow className="even:bg-gray-50 odd:bg-white" key={index}>
                    <TableCell className="p-[0.3rem] text-center">
                      {formatDate(key)}
                    </TableCell>
                    <TableCell className="p-[0.3rem] text-center">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Second Column: 17-31 */}
          {secondColumn.size > 0 && (
            <div className="w-1/2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Meal Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(secondColumn).map(([key, count], index) => (
                    <TableRow className="even:bg-gray-50 odd:bg-white" key={index}>
                      <TableCell className="p-[0.3rem] text-center">
                        {formatDate(`${month}-${key}`)}
                      </TableCell>
                      <TableCell className="p-[0.3rem] text-center">{count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealCountMonth;

