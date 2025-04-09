import React, { useState } from "react";
import NavigateMembers from "./layouts/NavigateMembers";
import { Routes, Route } from "react-router-dom";
import TabSwitcherMealChart from "./layouts/TabSwitcherMealChart";
import ResponsiveChartWrapper from "./ResponsiveChartWrapper";

const CreditConsumed = () => {
  const [members, setMembers] = useState([]);

  const handleMembersFetched = (fetchedMembers) => {
    setMembers(fetchedMembers);
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