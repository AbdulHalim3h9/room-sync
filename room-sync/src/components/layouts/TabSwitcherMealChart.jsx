import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mealCountData } from "@/mealCountData";
import CreditChart from "../CreditChart";
import MealCountMonth from "../MealCountMonth";

const TabSwitcherMealChart = ({ data }) => {
  return (
    <div className="">
      <Tabs defaultValue="chart" className="w-[600px]">
        <TabsList className="fixed left-1/2 -translate-x-1/2 top-2">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="mealcount">Meal Count</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-10" value="chart">
          <CreditChart data={data} ></CreditChart>
        </TabsContent>
        <TabsContent className="mt-16" value="mealcount">
          <MealCountMonth data={mealCountData}/>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabSwitcherMealChart;