import React from 'react';
import CreditChart from './CreditChart';
import NavigateMembers from './layouts/NavigateMembers';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { membersData } from "@/membersData";
import TabSwitcherMealChart from './layouts/TabSwitcherMealChart';
import Overview from './Overview';
import ResponsiveChartWrapper from './ResponsiveChartWrapper';

const CreditConsumed = () => {
  return (
    <div>
      {/* Navigation Component */}
      <NavigateMembers />

      {/* Routes Setup */}
      <Routes>
        <Route path="/" element={<ResponsiveChartWrapper />} />
        <Route 
          path=":member_id" 
          element={<TabSwitcherMealChart data={membersData} />} 
        />
      </Routes>

      {/* Nested Route Rendering */}
      <Outlet />
    </div>
  );
};

export default CreditConsumed;
