import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "react-router-dom";

const MealCountMonth = ({ data }) => {
  const { member_id } = useParams();
  const member = data.find((m) => m.member_id === parseInt(member_id));

  // Split meal counts into three groups: 1-10, 11-20, 21-31
  const firstColumn = member.meal_count.slice(0, 10);  // Dates 1-10
  const secondColumn = member.meal_count.slice(10, 20);  // Dates 11-20
  const thirdColumn = member.meal_count.slice(20, 31);   // Dates 21-31

  return (
    <div className="flex gap-8">
      {/* First Column: 1-10 */}
      <div className="w-1/3">
        <Table>
          <TableCaption>Dates 1-10 Meal Counts</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Meal Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {firstColumn.map((count, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Second Column: 11-20 */}
      <div className="w-1/3">
        <Table>
          <TableCaption>Dates 11-20 Meal Counts</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Meal Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {secondColumn.map((count, index) => (
              <TableRow key={index}>
                <TableCell>{index + 11}</TableCell>
                <TableCell>{count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Third Column: 21-31 */}
      <div className="w-1/3">
        <Table>
          <TableCaption>Dates 21-31 Meal Counts</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Meal Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {thirdColumn.map((count, index) => (
              <TableRow key={index}>
                <TableCell>{index + 21}</TableCell>
                <TableCell>{count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MealCountMonth;
