"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SingleMonthYearPicker from "../SingleMonthYearPicker";
import PreviousMonthBalance from "./AddMealFund/PreviousMonthBalance";
import PreviousAmountDisplay from "./AddMealFund/PreviousAmountDisplay";
import AdjustedAmountDisplay from "./AddMealFund/AdjustedAmountDisplay";
import useMealFundData from "./AddMealFund/useMealFundData";
import { validateForm, saveMealFund } from "./AddMealFund/mealFundUtils";

const AddMealFund = () => {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNum = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthNum}`;
  });
  const [selectedDonor, setSelectedDonor] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { members, previousAmount, previousMonthDues, isFirstEntry, toast } = useMealFundData(month, selectedDonor);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(selectedDonor, amount, toast)) return;

    const newAmount = Number(amount);
    setIsLoading(true);
    try {
      await saveMealFund(month, selectedDonor, newAmount, isFirstEntry, previousMonthDues, members, toast);
      toast({
        title: "Success",
        description: `Added ${newAmount} BDT from ${selectedDonor} for ${month}.`,
        className: "z-[1002]",
      });
      setAmount("");
      // Trigger re-fetch of previous amount via useMealFundData
    } catch (error) {
      // Error already toasted in saveMealFund
    } finally {
      setIsLoading(false);
    }
  };

  const adjustedAmount = isFirstEntry && previousMonthDues !== null && amount ? Number(amount) + previousMonthDues : null;

  return (
    <div className="w-full max-w-[98vw] sm:max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="px-6 py-5 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Add Meal Fund
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
          Record meal fund contributions from members
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5 sm:p-8">
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

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <PreviousMonthBalance previousMonthDues={previousMonthDues} />
            <PreviousAmountDisplay previousAmount={previousAmount} />
            <AdjustedAmountDisplay amount={amount} previousMonthDues={previousMonthDues} isFirstEntry={isFirstEntry} adjustedAmount={adjustedAmount} />

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

            <div className="pt-4">
              <Button
                type="submit"
                disabled={members.length === 0 || isLoading}
                isLoading={isLoading}
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