"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useMonth } from "@/App";
import SingleMonthYearPicker from "../SingleMonthYearPicker";

const AddMealFund = () => {
  const { toast } = useToast();
  const { month, setMonth } = useMonth(); // month is "YYYY-MM" (e.g., "2025-04")
  const [selectedDonor, setSelectedDonor] = useState("");
  const [amount, setAmount] = useState("");
  const [previousAmount, setPreviousAmount] = useState(0);
  const [members, setMembers] = useState([]);

  // Fetch active members from Firestore
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersRef = collection(db, "members");
        const q = query(membersRef, where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const membersData = querySnapshot.docs.map((doc) => ({
          member_id: doc.data().id,
          member_name: doc.data().fullname,
        }));
        setMembers(membersData);
        console.log("Fetched members:", membersData);
      } catch (error) {
        console.error("Error fetching members: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch members.",
          variant: "destructive",
        });
      }
    };

    fetchMembers();
  }, [toast]);

  // Fetch previous donation amount for the selected donor and month
  useEffect(() => {
    if (!selectedDonor || !month) return;

    const fetchPreviousAmount = async () => {
      const docId = `${month}-${selectedDonor}`; // e.g., "2025-04-John"
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
        });
      }
    };

    fetchPreviousAmount();
  }, [selectedDonor, month, toast]);

  // Save meal fund and contribution data
  const saveMealFund = async (selectedMonth, donor, newAmount) => {
    try {
      // Update meal_funds with cumulative amount
      const mealFundsDocId = `${selectedMonth}-${donor}`; // e.g., "2025-04-John"
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

      // Save contribution to contributionConsumption
      const contribConsumpDocId = `${selectedMonth}-${donor}`; // e.g., "2025-04-John"
      const contribConsumpRef = doc(db, "contributionConsumption", contribConsumpDocId);
      const contribConsumpSnap = await getDoc(contribConsumpRef);
      const existingContribData = contribConsumpSnap.exists() ? contribConsumpSnap.data() : {};

      await setDoc(
        contribConsumpRef,
        {
          member: donor,
          month: selectedMonth,
          contribution: updatedAmount,
          consumption: existingContribData.consumption || 0, // Preserve existing consumption if any
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
        description: "Failed to save meal fund or contribution.",
        variant: "destructive",
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
        title: "Success!",
        description: "Donation has been successfully added.",
        variant: "success",
      });

      setAmount("");
      setPreviousAmount(totalAmount);
    } catch (error) {
      console.error("Error adding donation:", error);
      toast({
        title: "Error",
        description: "Failed to add donation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMonthChange = (newMonth) => {
    console.log("Selected new month in AddMealFund:", newMonth);
    setMonth(newMonth);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Add Meal Fund</h1>
      <div className="flex justify-end mr-4 md:mr-8 mb-10">
        <SingleMonthYearPicker
          value={month}
          onChange={handleMonthChange}
          collections={["meal_funds"]}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="donor" className="block mb-1">
            Donor Name
          </Label>
          <select
            id="donor"
            value={selectedDonor}
            onChange={(e) => setSelectedDonor(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Select a donor</option>
            {members.map((member) => (
              <option key={member.member_id} value={member.member_name}>
                {member.member_name}
              </option>
            ))}
          </select>
        </div>

        {previousAmount > 0 && (
          <div className="bg-gray-100 p-3 rounded-md">
            <strong>Previously Added:</strong> {previousAmount} BDT
          </div>
        )}

        <div>
          <Label htmlFor="amount" className="block mb-1">
            Additional Amount
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter additional amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div>
          <Button className="w-full" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddMealFund;