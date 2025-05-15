"use client";

import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layouts/layout";
import BottomNavigation from "./components/layouts/BottomNavigation";
import Dashboard from './components/Dashboard';
import FloatingPaymentButton from './components/layouts/FloatingPaymentButton';
import FloatingCarryforwardButton from './components/layouts/FloatingCarryforwardButton';
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
import { MembersProvider } from "./contexts/MembersContext";

// ErrorBoundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <MembersProvider>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen relative">
          <Layout>
          <Routes>
            <Route path="*" element={<Dashboard />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/payables" element={<Payables />} />
            <Route path="/groceries_spendings" element={<Groceries_spendings />} />
            <Route path="/add-grocery-spendings" element={<AddGrocerySpendings />} />
            <Route path="/add-meal-fund" element={<AddMealFund />} />
            <Route path="/set-payables" element={<SetPayables />} />
            <Route path="/set-daily-meal-count" element={<SetDailyMealCount />} />
            <Route path="/register-member" element={<RegisterMember />} />
            <Route path="/members" element={<MembersList />} />
            <Route path="/member-details" element={<MemberDetails />} />
            <Route path="/register" element={<RegistrationForm />} />
          </Routes>
        </Layout>
        <FloatingCarryforwardButton />
        <FloatingPaymentButton />
        <BottomNavigation />
      </div>
      </ErrorBoundary>
    </MembersProvider>
  );
};

export default App;