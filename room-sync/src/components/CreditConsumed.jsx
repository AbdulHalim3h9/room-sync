import React from 'react'
import CreditChart from './CreditChart'
import NavigateMembers from './layouts/NavigateMembers'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { membersData } from "@/membersData";
import TabSwitcherMealChart from './layouts/TabSwitcherMealChart';

const CreditConsumed = () => {
  return (
    <div>
      
      <Routes>
        <Route path="/" element={`hello`} />
        {/* <Route
          path=":member_id"
          element={<CreditChart data={membersData} />}
        /> */}
        <Route path=':member_id' element={<TabSwitcherMealChart data={membersData} />} ></Route>
      </Routes>
      <Outlet></Outlet>
      
      <NavigateMembers />
    </div>
  )
}

export default CreditConsumed
