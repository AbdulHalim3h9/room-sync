import React from "react";
import CarryforwardTable from "./CarryforwardTable";

export default function CarryforwardSection({
  members,
  month,
  carryforwardData,
  mealCounts,
  mealRate,
  totalGroceries,
  totalMeals,
}) {
  return (
    <CarryforwardTable
      members={members}
      month={month}
      carryforwardData={carryforwardData}
      mealCounts={mealCounts}
      mealRate={mealRate}
      totalGroceries={totalGroceries}
      totalMeals={totalMeals}
    />
  );
}