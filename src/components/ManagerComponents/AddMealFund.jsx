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

  // Fetch previous donation amount for the selected donor and month
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
      const updatedAmount = existingAmount + newAmount;

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
      const updatedTotalMealFund = existingTotalMealFund + newAmount;

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
    const totalAmount = previousAmount + newAmount;

    try {
      await saveMealFund(month, selectedDonor, newAmount);

      toast({
        title: "Success",
        description: `Added ${newAmount} BDT from ${selectedDonor} for ${month}.`,
        className: "z-[1002]",
      });

      setAmount("");
      setPreviousAmount(totalAmount);
      setSelectedDonor("");
    } catch (error) {
      // Error already toasted in saveMealFund
    }
  };

  return (
    <div className="w-full max-w-[98vw] sm:max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div>
        {/* Header without background color */}
        <div className="px-4 py-5 sm:py-6 border-b-2 border-green-600 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-green-800 tracking-tight">
            Add Meal Fund
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
            Record meal fund contributions from members
          </p>
        </div>

        <div className="p-5 sm:p-8">
          {/* Month Picker Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Label className="block text-sm font-semibold text-gray-800">
                Select Month
              </Label>
              <div className="p-2">
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

            {/* Previous Amount Display */}
            {previousAmount > 0 && (
              <div className="p-4 text-sm text-gray-700 flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-gray-800">Previously Added:</span>{" "}
                  <span className="font-semibold text-green-700">{previousAmount} BDT</span>
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
                  className="pl-8 h-11 rounded-lg border-gray-200 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the additional amount in BDT</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-base font-medium rounded-lg shadow-sm transition-colors duration-200 focus:ring-4 focus:ring-green-200 focus:ring-opacity-50"
                disabled={members.length === 0}
              >
                Add Meal Fund
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