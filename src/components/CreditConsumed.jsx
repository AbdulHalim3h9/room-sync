import React from "react";
import NavigateMembers from "./layouts/NavigateMembers";
import { Routes, Route } from "react-router-dom";
import TabSwitcherMealChart from "./layouts/TabSwitcherMealChart";
import ResponsiveChartWrapper from "./ResponsiveChartWrapper";
import { MembersContext } from "@/contexts/MembersContext";

const CreditConsumed = () => {
  const { members, loading, error } = React.useContext(MembersContext);

  if (loading) {
    return <div className="text-center text-gray-600">Loading members...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <NavigateMembers />
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