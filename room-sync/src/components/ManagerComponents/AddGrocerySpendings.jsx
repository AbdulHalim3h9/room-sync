"use client"

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { membersData } from "@/membersData";
import { DatePick } from "./DatePick";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const AddGrocerySpendings = () => {
  const [amountSpent, setAmountSpent] = useState("");
  const [selectedShopper, setSelectedShopper] = useState("");
  const [expenseType, setExpenseType] = useState("groceries");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [date, setDate] = useState(new Date());

  const { toast } = useToast();

  // Validation function
  const validateForm = () => {
    const errors = [];

    // Validate amountSpent
    if (!amountSpent) {
      errors.push("Amount Spent is required");
    } else if (!/^\d+$/.test(amountSpent)) {
      errors.push("Amount Spent must be a number");
    }

    // Validate based on expenseType
    if (expenseType === "groceries" && !selectedShopper) {
      errors.push("Shopper is required for groceries");
    }

    if (expenseType === "other" && !expenseTitle) {
      errors.push("Expense Title is required for other expenses");
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    const data = {
      amountSpent: parseInt(amountSpent), // Convert to number
      shopper: selectedShopper || null,
      expenseType,
      expenseTitle: expenseType === "other" ? expenseTitle : null,
      date: date.toISOString(),
    };

    try {
      await addDoc(collection(db, "expenses"), data);
      toast({
        title: "Success!",
        description: "Expense has been successfully added.",
        variant: "success",
      });
      // Clear the form after submission
      setAmountSpent("");
      setSelectedShopper("");
      setExpenseType("groceries");
      setExpenseTitle("");
      setDate(new Date());
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Add Grocery or Other Expense</h1>
      <DatePick selectedDate={date} setSelectedDate={setDate} />

      <div className="flex space-x-4 mb-6">
        <div>
          <input
            type="radio"
            id="groceries"
            name="expenseType"
            value="groceries"
            checked={expenseType === "groceries"}
            onChange={() => setExpenseType("groceries")}
          />
          <Label htmlFor="groceries" className="ml-2">
            Groceries
          </Label>
        </div>

        <div>
          <input
            type="radio"
            id="other"
            name="expenseType"
            value="other"
            checked={expenseType === "other"}
            onChange={() => setExpenseType("other")}
          />
          <Label htmlFor="other" className="ml-2">
            Other
          </Label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="amount" className="block mb-1">
            Amount Spent
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount spent"
            value={amountSpent}
            onChange={(e) => setAmountSpent(e.target.value)}
            className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {expenseType === "other" && (
          <div>
            <Label htmlFor="title" className="block mb-1">
              Expense Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter expense title"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {expenseType === "groceries" && (
          <div>
            <Label htmlFor="shopper" className="block mb-1">
              Shopper
            </Label>
            <select
              id="shopper"
              value={selectedShopper}
              onChange={(e) => setSelectedShopper(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">Select a shopper</option>
              {membersData.map((member) => (
                <option key={member.member_id} value={member.member_name}>
                  {member.member_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Button className="w-full" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddGrocerySpendings;