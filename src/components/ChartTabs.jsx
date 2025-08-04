import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import RealtimeCharts from "./RealtimeCharts";
import { BarChart2, Clock } from "lucide-react";
import { formatDistance } from "date-fns";
import LastUpdated from "./LastUpdated";

export default function ChartTabs({
  realtimeData,
  pieContributionData,
  pieConsumptionData,
  dueMembers,
  mealRate,
  lastUpdated,
}) {
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
    <Card className="shadow-lg overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <BarChart2 className="h-4 w-4" />
            <span>Realtime Summary</span>
          </div>
          {lastUpdated && (
            <div className="text-xs text-gray-500">
              <LastUpdated timestamp={lastUpdated} />
            </div>
          )}
        </div>
        <RealtimeCharts
          realtimeData={realtimeData}
          pieContributionData={pieContributionData}
          pieConsumptionData={pieConsumptionData}
          dueMembers={dueMembers}
          mealRate={mealRate}
        />
      </CardContent>
    </Card>
  );
}