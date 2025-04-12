import React, { useState } from "react";
import NavigateMembers from "./layouts/NavigateMembers";
import { Routes, Route } from "react-router-dom";
import TabSwitcherMealChart from "./layouts/TabSwitcherMealChart";
import ResponsiveChartWrapper from "./ResponsiveChartWrapper";
import { useMonth } from "@/App";
import SingleMonthYearPicker from "./SingleMonthYearPicker";

const CreditConsumed = () => {
  const { month, setMonth } = useMonth();
  const [members, setMembers] = useState([]);

  const handleMembersFetched = (fetchedMembers) => {
    setMembers(fetchedMembers);
  };

  const handleMonthChange = (newMonth) => {
    console.log("Month changed to:", newMonth);
    setMonth(newMonth); // Update the context with "YYYY-MM" format
  };

  return (
    <div>
      <NavigateMembers onMembersFetched={handleMembersFetched} />
      <Routes>
        <Route path="/" element={<ResponsiveChartWrapper />} />
        <Route
          path=":memberId"
          element={<TabSwitcherMealChart members={members} />}
        />
      </Routes>
    </div>
  );
};

export default CreditConsumed;