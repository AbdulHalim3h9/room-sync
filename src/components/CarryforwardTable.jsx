import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCw } from "lucide-react";

const CarryforwardTable = ({
  members,
  month,
  carryforwardData,
  mealCounts,
  mealRate,
  totalGroceries,
  totalMeals
}) => {
  const [previousMonth] = useState(() => {
    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });

  const formatMonthDisplay = (monthStr) => {
    const [year, monthNum] = monthStr.split("-").map(Number);
    return format(new Date(year, monthNum - 1, 1), "MMMM yyyy");
  };

  const [isLandscape, setIsLandscape] = useState(true);
  const tableRef = React.createRef(null);
  const containerRef = React.createRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (tableRef.current) {
        const contentWidth = tableRef.current.scrollWidth;
        const contentHeight = tableRef.current.scrollHeight;
        
        setDimensions({
          width: contentWidth,
          height: contentHeight
        });
      }
    };

    // Initial calculation and on window resize
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [members, carryforwardData, isLandscape]); // Recalculate when data or orientation changes

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsLandscape(false);
      } else {
        setIsLandscape(true);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Mobile view controls */}
      <div className="flex justify-center my-4 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLandscape(!isLandscape)}
          className="flex items-center gap-2"
        >
          {isLandscape ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <RotateCw className="h-4 w-4" />
          )}
          {isLandscape ? "Portrait View" : "Landscape View"}
        </Button>
      </div>

      {/* Outer container - no extra height in landscape mode */}
      <div 
        ref={containerRef}
        className={`relative w-full ${isLandscape ? '' : 'overflow-auto'}`}
        style={{
          height: !isLandscape ? `${dimensions.width}px` : 'auto',
          maxHeight: !isLandscape ? '90vh' : 'auto'
        }}
      >
        {/* Inner content container */}
        <div
          ref={tableRef}
          className={`min-w-[600px] md:w-full transition-all duration-300 ease-in-out ${isLandscape ? 'overflow-x-auto' : ''}`}
          style={!isLandscape ? {
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'rotate(90deg) translateY(-100%)',
            transformOrigin: 'top left',
            width: `${dimensions.height}px`,
            height: `${dimensions.width}px`
          } : {}}
        >
          <CardTitle className="text-lg font-medium mb-4">
            পূর্ববর্তী মাসের জের: {formatMonthDisplay(previousMonth)}
          </CardTitle>
          <Table className="border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="px-2 py-2">নাম</TableHead>
                <TableHead className="px-2 py-2">জমাকৃত পরিমাণ (টাকা)</TableHead>
                <TableHead className="px-2 py-2">মিল সংখ্যা</TableHead>
                <TableHead className="px-2 py-2">মিল খরচ (টাকা)</TableHead>
                <TableHead className="px-2 py-2">পাবে (টাকা)</TableHead>
                <TableHead className="px-2 py-2">দিবে (টাকা)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const contribution = carryforwardData.find((d) => d.name === (member.shortname || member.memberName))?.given || 0;
                const consumption = carryforwardData.find((d) => d.name === (member.shortname || member.memberName))?.eaten || 0;
                const mealCount = mealCounts.previous[member.memberName] || 0;
                const consumptionCost =
                  mealRate.previous !== "N/A" && mealRate.previous !== "Error"
                    ? (mealCount * parseFloat(mealRate.previous)).toFixed(2)
                    : "প্রযোজ্য নয়";
                const balance = contribution - consumption;
                const awes = balance > 0 ? balance.toFixed(2) : "0.00";
                const dues = balance < 0 ? Math.abs(balance).toFixed(2) : "0.00";

                return (
                  <TableRow key={member.memberId}>
                    <TableCell className="px-2 py-1">{member.shortname || member.memberName}</TableCell>
                    <TableCell className="px-2 py-1">{contribution.toFixed(2)}</TableCell>
                    <TableCell className="px-2 py-1">{mealCount}</TableCell>
                    <TableCell className="px-2 py-1">{consumptionCost}</TableCell>
                    <TableCell className="px-2 py-1 text-green-500">{awes}</TableCell>
                    <TableCell className="px-2 py-1 text-red-500">{dues}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Card className="mt-2 p-2 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center mx-2">
                <p className="text-sm font-semibold text-gray-700 mr-1">মোট বাজার:</p>
                <p className="text-sm text-gray-600">
                  {totalGroceries.previous ? `${totalGroceries.previous.toFixed(2)} টাকা` : "প্রযোজ্য নয়"}
                </p>
              </div>
              <div className="flex items-center mx-2">
                <p className="text-sm font-semibold text-gray-700 mr-1">মোট মিল:</p>
                <p className="text-sm text-gray-600">{totalMeals.previous || "প্রযোজ্য নয়"}</p>
              </div>
              <div className="flex items-center mx-2">
                <p className="text-sm font-semibold text-gray-700 mr-1">মিল রেট:</p>
                <p className="text-sm text-gray-600">{mealRate.previous || "প্রযোজ্য নয়"} টাকা</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarryforwardTable;