import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RealtimeCharts from "./RealtimeCharts";
import CarryforwardSection from "./CarryforwardSection";
import { Clock, BarChart2, Repeat } from "lucide-react";
import { format, formatDistance } from "date-fns";

export default function ChartTabs({
  realtimeData,
  carryforwardData,
  pieContributionData,
  pieConsumptionData,
  dueMembers,
  mealRate,
  mealCounts,
  totalGroceries,
  totalMeals,
  activeMembersPrevious,
  month,
  lastUpdates,
}) {
  const [activeTab, setActiveTab] = useState("realtime");

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never updated";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  return (
    <Card className="mb-8 shadow-lg overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-4 pb-2">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 rounded-lg p-1">
            <TabsTrigger 
              value="realtime" 
              className="flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:font-semibold"
            >
              <BarChart2 className="h-4 w-4" />
              Realtime Summary
            </TabsTrigger>
            <TabsTrigger 
              value="carryforward" 
              className="flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:font-semibold"
            >
              <Repeat className="h-4 w-4" />
              Carryforward
            </TabsTrigger>
          </TabsList>
        </div>
        <CardContent className="p-4">
          <TabsContent value="realtime" className="mt-0">
            <RealtimeCharts
              realtimeData={realtimeData}
              pieContributionData={pieContributionData}
              pieConsumptionData={pieConsumptionData}
              dueMembers={dueMembers}
              mealRate={mealRate}
            />
          </TabsContent>
          <TabsContent value="carryforward" className="mt-0">
            <CarryforwardSection
              members={activeMembersPrevious}
              month={month}
              carryforwardData={carryforwardData}
              mealCounts={mealCounts}
              mealRate={mealRate}
              totalGroceries={totalGroceries}
              totalMeals={totalMeals}
            />
          </TabsContent>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t py-3 text-xs text-gray-500">
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="h-3 w-3" />
            <span>Last updated: {formatTimestamp(lastUpdates.mealFund)}</span>
          </div>
        </CardFooter>
      </Tabs>
    </Card>
  );
}