"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/firebase";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import SingleMonthYearPicker from "../SingleMonthYearPicker";

const AddMealFund = () => {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNum = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthNum}`;
  });
  const { toast } = useToast();
  const [selectedDonor, setSelectedDonor] = useState("");
  const [amount, setAmount] = useState("");
  const [previousAmount, setPreviousAmount] = useState(0);
  const [members, setMembers] = useState([]);
  const [previousMonthDues, setPreviousMonthDues] = useState(null);
  const [isFirstEntry, setIsFirstEntry] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch members active for the selected month
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersRef = collection(db, "members");
        const querySnapshot = await getDocs(membersRef);
        const membersData = querySnapshot.docs
          .map((doc) => ({
            member_id: doc.data().id,
            member_name: doc.data().fullname,
            activeFrom: doc.data().activeFrom,
            archiveFrom: doc.data().archiveFrom,
          }))
          .filter((member) => {
            if (!member.activeFrom) return false;
            const activeFromDate = new Date(member.activeFrom + "-01");
            const selectedMonthDate = new Date(month + "-01");
            if (activeFromDate > selectedMonthDate) return false;
            if (member.archiveFrom) {
              const archiveFromDate = new Date(member.archiveFrom + "-01");
              return selectedMonthDate < archiveFromDate;
            }
            return true;
          })
          .sort((a, b) => a.member_name.localeCompare(b.member_name));
        setMembers(membersData);
        console.log("Fetched active members for", month, ":", membersData);
        if (membersData.length === 0) {
          toast({
            title: "No Active Members",
            description: `No members are active for ${month}.`,
            variant: "destructive",
            className: "z-[1002]",
          });
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        toast({
          title: "Error",
          description: "Failed to fetch members.",
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    };

    fetchMembers();
  }, [month, toast]);

  // Check first entry and previous month's balance
  useEffect(() => {
    const checkFirstEntryAndBalance = async () => {
      if (!selectedDonor || !month) {
        setIsFirstEntry(false);
        setPreviousMonthDues(null);
        return;
      }

      try {
        // Check if this is first entry for the month
        const docId = `${month}-${selectedDonor}`;
        const docRef = doc(db, "meal_funds", docId);
        const docSnap = await getDoc(docRef);
        const firstEntry = !docSnap.exists();
        setIsFirstEntry(firstEntry);

        // Always fetch previous month's balance
        const previousMonthDate = new Date(month + "-01");
        previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
        const previousMonth = previousMonthDate.toISOString().split("T")[0].split("-").slice(0, 2).join("-");
        
        const contribConsumpRef = collection(db, "contributionConsumption");
        const contribSnapshot = await getDocs(contribConsumpRef);
        
        let previousBalance = 0;
        contribSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.month === previousMonth && data.member === selectedDonor) {
            const contribution = data.contribution || 0;
            const consumption = data.consumption || 0;
            previousBalance = contribution - consumption;
          }
        });

        setPreviousMonthDues(previousBalance);
      } catch (error) {
        console.error("Error checking first entry and balance:", error);
        toast({
          title: "Error",
          description: "Failed to check previous month's balance.",
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    };

    checkFirstEntryAndBalance();
  }, [selectedDonor, month, toast]);

  // Fetch previous donation amount
  useEffect(() => {
    if (!selectedDonor || !month) {
      setPreviousAmount(0);
      return;
    }

    const fetchPreviousAmount = async () => {
      const docId = `${month}-${selectedDonor}`;
      const docRef = doc(db, "meal_funds", docId);
      try {
        const docSnap = await getDoc(docRef);
        const totalAmount = docSnap.exists() ? docSnap.data().amount || 0 : 0;
        setPreviousAmount(totalAmount);
        console.log(`Previous amount for ${selectedDonor} in ${month}: ${totalAmount}`);
      } catch (error) {
        console.error("Error fetching previous amount:", error);
        toast({
          title: "Error",
          description: "Failed to fetch previous donation amount.",
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    };

    fetchPreviousAmount();
  }, [selectedDonor, month, toast]);

  // Save meal fund and contribution data
  const saveMealFund = async (selectedMonth, donor, newAmount) => {
    try {
      let adjustedAmount = newAmount;
      if (isFirstEntry && previousMonthDues !== null) {
        adjustedAmount = newAmount + previousMonthDues;
        
        // Show confirmation dialog for adjustment
        const confirm = window.confirm(
          `This is the first meal fund entry for ${donor} in ${selectedMonth}.\n` +
          `Previous month's balance: ${previousMonthDues.toFixed(2)} BDT\n` +
          `Original amount: ${newAmount.toFixed(2)} BDT\n` +
          `Adjusted amount: ${adjustedAmount.toFixed(2)} BDT\n\n` +
          `Proceed with adjusted amount?`
        );
        
        if (!confirm) {
          return;
        }
      }

      // Verify donor is active for the month
      const donorMember = members.find((m) => m.member_name === donor);
      if (!donorMember) {
        throw new Error("Selected donor not found.");
      }
      const activeFromDate = new Date(donorMember.activeFrom + "-01");
      const selectedMonthDate = new Date(selectedMonth + "-01");
      if (activeFromDate > selectedMonthDate) {
        throw new Error("Selected donor is not active for this month.");
      }
      if (donorMember.archiveFrom) {
        const archiveFromDate = new Date(donorMember.archiveFrom + "-01");
        if (selectedMonthDate >= archiveFromDate) {
          throw new Error("Selected donor is not active for this month.");
        }
      }

      // Update meal_funds with cumulative amount
      const mealFundsDocId = `${selectedMonth}-${donor}`;
      const mealFundsRef = doc(db, "meal_funds", mealFundsDocId);
      const mealFundsSnap = await getDoc(mealFundsRef);
      const existingAmount = mealFundsSnap.exists() ? mealFundsSnap.data().amount || 0 : 0;
      const updatedAmount = isFirstEntry ? adjustedAmount : existingAmount + newAmount;

      await setDoc(
        mealFundsRef,
        {
          donor,
          amount: updatedAmount,
          month: selectedMonth,
          timestamp: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update totalMealFund in mealSummaries
      const summaryRef = doc(db, "mealSummaries", selectedMonth);
      const summarySnap = await getDoc(summaryRef);
      const existingData = summarySnap.exists() ? summarySnap.data() : {};
      const existingTotalMealFund = existingData.totalMealFund || 0;
      const amountToAdd = isFirstEntry ? adjustedAmount : newAmount;
      const updatedTotalMealFund = existingTotalMealFund + amountToAdd;

      await setDoc(
        summaryRef,
        {
          totalMealFund: updatedTotalMealFund,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update contribution to contributionConsumption
      const contribConsumpDocId = `${selectedMonth}-${donor}`;
      const contribConsumpRef = doc(db, "contributionConsumption", contribConsumpDocId);
      const contribConsumpSnap = await getDoc(contribConsumpRef);
      const existingContribData = contribConsumpSnap.exists() ? contribConsumpSnap.data() : {};

      await setDoc(
        contribConsumpRef,
        {
          member: donor,
          month: selectedMonth,
          contribution: updatedAmount,
          consumption: existingContribData.consumption || 0,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log(`Updated meal fund for ${mealFundsDocId}: ${updatedAmount}`);
      console.log(`Updated total meal fund for ${selectedMonth}: ${updatedTotalMealFund}`);
      console.log(`Updated contribution for ${contribConsumpDocId}: ${updatedAmount}`);
    } catch (error) {
      console.error("Error saving meal fund:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save meal fund or contribution.",
        variant: "destructive",
        className: "z-[1002]",
      });
      throw error;
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!selectedDonor) {
      errors.push("Donor Name");
    }
    if (!amount) {
      errors.push("Amount");
    } else if (!/^\d+$/.test(amount)) {
      errors.push("Amount must be a number");
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", ") + " is required.",
        variant: "destructive",
        className: "z-[1002]",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newAmount = Number(amount);
    
    setIsLoading(true);
    try {
      await saveMealFund(month, selectedDonor, newAmount);

      toast({
        title: "Success",
        description: `Added ${newAmount} BDT from ${selectedDonor} for ${month}.`,
        className: "z-[1002]",
      });

      setAmount("");
      // Do not reset selectedDonor or previousMonthDues to keep UI state
      // Fetch updated previous amount
      const docId = `${month}-${selectedDonor}`;
      const docRef = doc(db, "meal_funds", docId);
      const docSnap = await getDoc(docRef);
      const totalAmount = docSnap.exists() ? docSnap.data().amount || 0 : 0;
      setPreviousAmount(totalAmount);
    } catch (error) {
      // Error already toasted in saveMealFund
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate adjusted amount if needed
  const adjustedAmount = isFirstEntry && previousMonthDues !== null && amount ? 
    Number(amount) + previousMonthDues : null;

  return (
    <div className="w-full max-w-[98vw] sm:max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Add Meal Fund
          </h1>
          <p className="text-sm sm:text-base text-green-50 mt-1 font-medium">
            Record meal fund contributions from members
          </p>
        </div>

        <div className="p-5 sm:p-8">
          {/* Month Picker Section */}
          <div className="mb-8 bg-gray-50 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Label className="block text-sm font-semibold text-gray-800">
                Select Month
              </Label>
              <div className="p-2 bg-white rounded-md shadow-sm border border-gray-200">
                <SingleMonthYearPicker
                  value={month}
                  onChange={(newMonth) => setMonth(newMonth)}
                  collections={["meal_funds"]}
                />
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donor Selection */}
            <div className="space-y-2">
              <Label htmlFor="donor" className="block text-sm font-semibold text-gray-800">
                Donor Name
              </Label>
              <Select value={selectedDonor} onValueChange={setSelectedDonor}>
                <SelectTrigger 
                  className="h-11 rounded-lg border-gray-200 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 text-base shadow-sm"
                >
                  <SelectValue placeholder="Select a donor" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                  {members.length > 0 ? (
                    members.map((member) => (
                      <SelectItem 
                        key={member.member_id} 
                        value={member.member_name}
                        className="py-2.5 text-base font-medium"
                      >
                        {member.member_name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No active members for {month}
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Select the member who is adding funds</p>
            </div>

            {/* Previous Month Balance Section */}
            {previousMonthDues !== null && (
              <div className={`border-l-4 p-4 rounded-lg mb-4 ${
                previousMonthDues >= 0 ? "bg-blue-50 border-blue-500" : "bg-red-50 border-red-500"
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                      previousMonthDues >= 0 ? "text-blue-600" : "text-red-600"
                    }`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className={`font-medium ${
                      previousMonthDues >= 0 ? "text-blue-700" : "text-red-700"
                    }`}>Previous Month Balance</p>
                    <p className={`text-sm ${
                      previousMonthDues >= 0 ? "text-blue-600" : "text-red-600"
                    } mt-1`}>
                      {previousMonthDues >= 0 ? (
                        <>Surplus of <span className="font-semibold">{previousMonthDues.toFixed(2)} BDT</span> from previous month</>
                      ) : (
                        <>Deficit of <span className="font-semibold">{Math.abs(previousMonthDues).toFixed(2)} BDT</span> from previous month</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Previous Amount Display */}
            {previousAmount !== 0 && (
              <div className={`bg-green-50 rounded-lg border border-green-100 p-4 text-sm text-gray-700 flex items-center`}>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-gray-800">Current Month Contribution:</span>{" "}
                  <span className={`font-semibold ${previousAmount >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {previousAmount.toFixed(2)} BDT
                  </span>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="block text-sm font-semibold text-gray-800">
                Additional Amount
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">৳</span>
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-11 rounded-lg border-gray-200 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 text-base [appearance:textfield] [&::-webkit-outer ⟸spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the additional amount in BDT</p>
            </div>

            {/* Adjusted Amount Section */}
            {adjustedAmount !== null && (
              <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-amber-800">Adjusted Amount</p>
                    <div className="text-sm mt-1 space-y-1">
                      <p className="text-amber-700">
                        Original amount: <span className="font-medium">{Number(amount).toFixed(2)} BDT</span>
                      </p>
                      <p className="text-amber-700">
                        {previousMonthDues >= 0 ? "Added" : "Subtracted"} balance: <span className="font-medium">{Math.abs(previousMonthDues).toFixed(2)} BDT</span>
                      </p>
                      <p className={`text-amber-900 font-semibold ${adjustedAmount >= 0 ? "text-amber-900" : "text-red-900"}`}>
                        Final amount: {adjustedAmount.toFixed(2)} BDT
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-base font-medium rounded-lg shadow-md transition-colors duration-200 focus:ring-4 focus:ring-green-200 focus:ring-opacity-50"
                disabled={members.length === 0 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Add Meal Fund"
                )}
              </Button>
              {members.length === 0 && (
                <p className="text-xs text-center text-red-500 mt-2">
                  No active members for the selected month
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMealFund;