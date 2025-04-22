import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';

const CarryforwardTable = ({
  members,
  month,
  carryforwardData,
  mealCounts,
  mealRate,
  totalGroceries,
  totalMeals
}) => {
  const getPreviousMonth = (month) => {
    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const formatMonthDisplay = (monthStr) => {
    const [year, monthNum] = monthStr.split("-").map(Number);
    return format(new Date(year, monthNum - 1, 1), "MMMM yyyy");
  };

  const previousMonth = getPreviousMonth(month);

  return (
    <div className="w-full">
      <CardTitle className="text-lg font-medium mb-4">
        পূর্ববর্তী মাসের জের: {formatMonthDisplay(previousMonth)}
      </CardTitle>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>নাম</TableHead>
            <TableHead>জমাকৃত পরিমাণ (টাকা)</TableHead>
            <TableHead>মিল সংখ্যা</TableHead>
            <TableHead>মিল খরচ (টাকা)</TableHead>
            <TableHead>পাবে (টাকা)</TableHead>
            <TableHead>দিবে (টাকা)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const contribution = carryforwardData.find((d) => d.name === (member.shortname || member.memberName))?.given || 0;
            const consumption = carryforwardData.find((d) => d.name === (member.shortname || member.memberName))?.eaten || 0;
            const mealCount = mealCounts.previous[member.memberName] || 0;
            const consumptionCost = mealRate.previous !== "N/A" && mealRate.previous !== "Error" ? 
              (mealCount * parseFloat(mealRate.previous)).toFixed(2) : 
              "প্রযোজ্য নয়";
            const balance = contribution - consumption;
            const awes = balance > 0 ? balance.toFixed(2) : "0.00";
            const dues = balance < 0 ? Math.abs(balance).toFixed(2) : "0.00";

            return (
              <TableRow key={member.memberId}>
                <TableCell>{member.shortname || member.memberName}</TableCell>
                <TableCell>{contribution.toFixed(2)}</TableCell>
                <TableCell>{mealCount}</TableCell>
                <TableCell>{consumptionCost}</TableCell>
                <TableCell className="text-green-500">{awes}</TableCell>
                <TableCell className="text-red-500">{dues}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Card className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">মোট বাজার</p>
            <p className="text-sm text-gray-600">{totalGroceries.previous ? `${totalGroceries.previous.toFixed(2)} টাকা` : "প্রযোজ্য নয়"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">মোট মিল</p>
            <p className="text-sm text-gray-600">{totalMeals.previous || "প্রযোজ্য নয়"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">মিল রেট</p>
            <p className="text-sm text-gray-600">{mealRate.previous || "প্রযোজ্য নয়"} টাকা</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CarryforwardTable;