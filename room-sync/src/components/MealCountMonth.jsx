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
  // Convert member_id to string for consistency
  const member = data.find((m) => String(m.memberId) === String(member_id));
  console.log("Member:", member);

  // Split meal counts into two groups: 1-16, 17-31
  const firstColumn = member?.meals.slice(0, 16)|| [];
  const secondColumn = member?.meals.slice(16, 31)|| [];
  // const firstColumn = member?.meals || [];
  

    const { month, setMonth } = useMonth(); // Use the context to manage the month state
    // Handle date change from SingleMonthYearPicker
    const handleDateChange = (newMonth) => {
      setMonth(newMonth); // Set the new month in the context
    };

    useEffect(() => {
      if (!month) return;
    
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

  return (
    <div>
      <div className="flex justify-end mr-4 md:mr-8 mb-10">
        <SingleMonthYearPicker onChange={handleDateChange} />
      </div>
    <div className="flex gap-4 md:gap-8">
      {/* First Column: 1-16 */}
      {/* <div className="w-1/2">
      
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Meal Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {firstColumn.map((count, index) => (
              <TableRow className="even:bg-gray-50 odd:bg-white" key={index}>
                <TableCell className="p-[0.3rem] text-center">{index + 1}</TableCell>
                <TableCell className="p-[0.3rem] text-center">{count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div> */}

      {/* Second Column: 17-31 */}
      {/* <div className="w-1/2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Meal Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {secondColumn.map((count, index) => (
              <TableRow className="even:bg-gray-50 odd:bg-white" key={index}>
                <TableCell className="p-[0.3rem] text-center">{index + 17}</TableCell>
                <TableCell className="p-[0.3rem] text-center">{count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div> */}

<div className={`flex ${secondColumn.length === 0 ? "w-full" : "gap-4 md:gap-8"}`}>
  {/* First Column: 1-16 */}
  <div className={secondColumn.length === 0 ? "w-full" : "w-1/2"}>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Date</TableHead>
          <TableHead className="text-center">Meal Count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {firstColumn.map((count, index) => (
          <TableRow className="even:bg-gray-50 odd:bg-white" key={index}>
            <TableCell className="p-[0.3rem] text-center">{index + 1}</TableCell>
            <TableCell className="p-[0.3rem] text-center">{count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>

  {/* Second Column: 17-31 */}
  {secondColumn.length > 0 && (
    <div className="w-1/2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Meal Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {secondColumn.map((count, index) => (
            <TableRow className="even:bg-gray-50 odd:bg-white" key={index}>
              <TableCell className="p-[0.3rem] text-center">{index + 17}</TableCell>
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
