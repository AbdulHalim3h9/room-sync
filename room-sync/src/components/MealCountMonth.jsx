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

const MealCountMonth = ({ data }) => {
  const { member_id } = useParams();
  const member = data.find((m) => m.member_id === parseInt(member_id));

  // Split meal counts into two groups: 1-16, 17-31
  const firstColumn = member.meal_count.slice(0, 16);  // Dates 1-16
  const secondColumn = member.meal_count.slice(16, 31);  // Dates 17-31

  return (
    <div className="flex gap-4 md:gap-8">
      {/* First Column: 1-16 */}
      <div className="w-1/2">
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
    </div>
  );
};

export default MealCountMonth;
