import React, { createContext, useState, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Layout from "./components/layouts/layout";
import BottomNavigation from "./components/layouts/BottomNavigation";
import CreditConsumed from "./components/CreditConsumed";
import Payables from "./components/Payables";
import Groceries_spendings from "./components/GroceryTurns";
import AddMealFund from "./components/ManagerComponents/AddMealFund";
import AddGrocerySpendings from "./components/ManagerComponents/AddGrocerySpendings";
import SetDailyMealCount from "./components/ManagerComponents/SetDailyMealCount";
import SetPayables from "./components/ManagerComponents/SetPayables";
import MembersList from "./components/AdminComponents/MembersList";
import RegisterMember from "./components/AdminComponents/RegisterMember";
import MemberDetails from "./components/AdminComponents/MemberDetails";
import RegistrationForm from "./components/RegisterAdminManager";

// Create the context
const MonthContext = createContext();

// Custom hook for accessing the context
export const useMonth = () => useContext(MonthContext);

const App = () => {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Ensure 2 digits
    return `${year}-${month}`; // Format as "YYYY-MM"
  });

  return (
    <MonthContext.Provider value={{ month, setMonth }}>
        <Layout />
        <Routes>
          <Route path="*" element={<CreditConsumed />} />
          <Route path="/creditconsumed/*" element={<CreditConsumed />} />
          <Route path="/payables" element={<Payables />} />
          <Route path="/groceries_spendings" element={<Groceries_spendings />} />
          <Route path="/add-grocery-spendings" element={<AddGrocerySpendings />} />
          <Route path="/add-meal-fund" element={<AddMealFund />} />
          <Route path="/set-payables" element={<SetPayables />} />
          <Route path="/set-daily-meal-count" element={<SetDailyMealCount />} />
          <Route path="/register-member" element={<RegisterMember />} />
          <Route path="/members" element={<MembersList />} />
          <Route path="/member-details" element={<MemberDetails />} />
          <Route path="/register" element={<RegistrationForm/>} />
        </Routes>
        <BottomNavigation />
    </MonthContext.Provider>
  );
};

export default App;