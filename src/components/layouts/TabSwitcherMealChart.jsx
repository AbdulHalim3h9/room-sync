import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreditChart from "../CreditChart";
import MealCountMonth from "../MealCountMonth";

const TabSwitcherMealChart = ({ members }) => {
  return (
    <div>
      <Tabs defaultValue="chart">
        <TabsList className="fixed left-1/2 -translate-x-1/2 top-2">
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