import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, DollarSign, Utensils, ShoppingBag, Receipt } from "lucide-react";
import { format, formatDistance } from "date-fns";

export default function LatestUpdate({ lastUpdates }) {
  const [showUpdateDetails, setShowUpdateDetails] = useState(false);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never updated";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  const formatExactTimestamp = (timestamp) => {
    if (!timestamp) return "Never updated";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return "Unknown";
    }
  };

  const updateTypes = [
    { type: "Meal Fund", timestamp: lastUpdates.mealFund, icon: <DollarSign className="h-5 w-5" />, bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-100", accent: "text-blue-600" },
    { type: "Meal Count", timestamp: lastUpdates.mealCount, icon: <Utensils className="h-5 w-5" />, bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-100", accent: "text-purple-600" },
    { type: "Grocery", timestamp: lastUpdates.grocery, icon: <ShoppingBag className="h-5 w-5" />, bg: "bg-green-100", text: "text-green-700", border: "border-green-100", accent: "text-green-600" },
    { type: "Payables", timestamp: lastUpdates.payables, icon: <Receipt className="h-5 w-5" />, bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-100", accent: "text-amber-600" },
  ];

  let latestType = null;
  let latestTime = null;

  updateTypes.forEach((update) => {
    if (!update.timestamp) return;
    const updateTime = update.timestamp.toDate ? update.timestamp.toDate() : new Date(update.timestamp);
    if (!latestTime || updateTime > latestTime) {
      latestType = update.type;
      latestTime = updateTime;
    }
  });

  if (!latestType || !latestTime) return null;

  return (
    <Card className="mb-6 shadow-lg overflow-hidden">
      <div className={`bg-gradient-to-r ${showUpdateDetails ? "from-blue-50 to-indigo-50" : "from-blue-100 to-indigo-100"} transition-colors duration-300`}>
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-medium">Latest Update</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpdateDetails((prev) => !prev)}
              className="h-8 px-3 text-xs font-medium"
            >
              {showUpdateDetails ? "Hide Details" : "Show Details"}
            </Button>
          </div>
          <CardDescription>
            <span className="font-medium">{latestType}</span> was updated {formatTimestamp(latestTime)}
          </CardDescription>
        </CardHeader>
        {showUpdateDetails && (
          <CardContent className="pt-4 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {updateTypes.map((update) => (
                <div
                  key={update.type}
                  className={`bg-white p-4 rounded-lg shadow-sm border ${update.border} flex items-start gap-3`}
                >
                  <div className={`p-2 ${update.bg} ${update.text} rounded-full`}>
                    {update.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">{update.type}</h3>
                    <p className="text-xs text-gray-500">{formatTimestamp(update.timestamp)}</p>
                    <p className={`text-xs ${update.accent} mt-1`}>{formatExactTimestamp(update.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </div>
    </Card>
  );
}