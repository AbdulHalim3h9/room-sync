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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Add Meal Fund</h1>
      <div className="flex justify-end mb-6">
        <SingleMonthYearPicker
          value={month}
          onChange={(newMonth) => setMonth(newMonth)}
          collections={["meal_funds"]}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="donor" className="block mb-2 text-sm font-medium text-gray-700">
            Donor Name
          </Label>
          <Select value={selectedDonor} onValueChange={setSelectedDonor}>
            <SelectTrigger className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select a donor" />
            </SelectTrigger>
            <SelectContent>
              {members.length > 0 ? (
                members.map((member) => (
                  <SelectItem key={member.member_id} value={member.member_name}>
                    {member.member_name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No active members for {month}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {previousAmount > 0 && (
          <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
            <strong>Previously Added:</strong> {previousAmount} BDT
          </div>
        )}

        <div>
          <Label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-700">
            Additional Amount
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter additional amount (BDT)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-md"
          disabled={members.length === 0}
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default AddMealFund;