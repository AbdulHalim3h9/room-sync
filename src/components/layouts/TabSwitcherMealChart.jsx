import React, { useEffect, useContext } from "react";
import { MembersContext } from "../../contexts/MembersContext"; // Adjust the path as necessary
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreditChart from "../CreditChart";
import MealCountMonth from "../MealCountMonth";

const TabSwitcherMealChart = () => {
  const { members, loading, error } = React.useContext(MembersContext);
  useEffect(() => {
    console.log("Members in TabSwitcherMealChart:", members);
  }, [members]);
  return (
    <div>
      <Tabs defaultValue="chart">
        <TabsList className="sticky top-0 left-1/2 -translate-x-1/2 z-20 bg-white p-2 shadow-sm">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="mealcount">Meal Count</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-10" value="chart">
          <CreditChart members={members} />
        </TabsContent>
        <TabsContent className="mt-4 mb-14 mx-8" value="mealcount">
          <MealCountMonth />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabSwitcherMealChart;