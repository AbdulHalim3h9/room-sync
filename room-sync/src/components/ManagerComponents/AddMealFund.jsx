"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase"; // Firebase import
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast"; // Toast hook
import { membersData } from "@/membersData";
import SingleMonthYearPicker from "../SingleMonthYearPicker";

const AddMealFund = () => {
  const { toast } = useToast(); // Toast notification
  const [selectedDonor, setSelectedDonor] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );

  // Validate form inputs
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const data = {
      donor: selectedDonor,
      amount: Number(amount),
      month: selectedMonth,
      timestamp: new Date(),
    };

    try {
      await addDoc(collection(db, "meal_funds"), data);
      toast({
        title: "Success!",
        description: "Donation has been successfully added.",
        variant: "success",
      });

      // Reset form
      setSelectedDonor("");
      setAmount("");
    } catch (error) {
      console.error("Error adding donation:", error);
      toast({
        title: "Error",
        description: "Failed to add donation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Add Meal Fund</h1>

      {/* Month-Year Picker */}
      <SingleMonthYearPicker onChange={setSelectedMonth} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donor Selection */}
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
            {membersData.map((member) => (
              <option key={member.member_id} value={member.member_name}>
                {member.member_name}
              </option>
            ))}
          </select>
        </div>

        {/* Donation Amount */}
        <div>
          <Label htmlFor="amount" className="block mb-1">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter donation amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Submit Button */}
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
