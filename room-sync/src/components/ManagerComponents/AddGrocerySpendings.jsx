"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import DatePickerMealCount from "./DatePickerMealCount";

const AddGrocerySpendings = () => {
  const [amountSpent, setAmountSpent] = useState("");
  const [selectedShopper, setSelectedShopper] = useState("");
  const [expenseType, setExpenseType] = useState("groceries");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [existingDocId, setExistingDocId] = useState(null); // Track existing document ID
  const [members, setMembers] = useState([]); // State for members from Firestore

  const { toast } = useToast();

  // Fetch active members from Firestore on mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersRef = collection(db, "members");
        const q = query(membersRef, where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const membersData = querySnapshot.docs.map((doc) => ({
          member_id: doc.data().id, // Assuming 'id' is the field in Firestore
          member_name: doc.data().fullname, // Assuming 'fullname' is the field
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

  // Fetch existing expense data when the date changes
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const formattedDate = new Date(selectedDate).toISOString();
        const expensesRef = collection(db, "expenses");
        const q = query(expensesRef, where("date", "==", formattedDate));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]; // Assume only one expense per date
          const data = doc.data();
          setExistingDocId(doc.id); // Store the document ID
          setAmountSpent(data.amountSpent.toString());
          setSelectedShopper(data.shopper || "");
          setExpenseType(data.expenseType);
          setExpenseTitle(data.expenseTitle || "");
        } else {
          // Reset fields if no data exists for the selected date
          setExistingDocId(null);
          setAmountSpent("");
          setSelectedShopper("");
          setExpenseType("groceries");
          setExpenseTitle("");
        }
      } catch (error) {
        console.error("Error fetching expense: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch existing expense data.",
          variant: "destructive",
        });
      }
    };

    fetchExpense();
  }, [selectedDate, toast]);

  const validateForm = () => {
    const errors = [];

    if (!amountSpent) {
      errors.push("Amount Spent");
    } else if (!/^\d+$/.test(amountSpent)) {
      errors.push("Amount Spent must be a number");
    }

    if (expenseType === "groceries" && !selectedShopper) {
      errors.push("Shopper");
    }

    if (expenseType === "other" && !expenseTitle) {
      errors.push("Expense Title");
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

    if (!validateForm()) {
      return;
    }

    const formattedDate = new Date(selectedDate).toISOString();
    const data = {
      amountSpent: parseInt(amountSpent),
      shopper: selectedShopper || null,
      expenseType,
      expenseTitle: expenseType === "other" ? expenseTitle : null,
      date: formattedDate,
    };

    try {
      if (existingDocId) {
        // Update existing document
        const docRef = doc(db, "expenses", existingDocId);
        await updateDoc(docRef, data);
        toast({
          title: "Success!",
          description: "Expense has been successfully updated.",
          variant: "success",
        });
      } else {
        // Add new document
        await addDoc(collection(db, "expenses"), data);
        toast({
          title: "Success!",
          description: "Expense has been successfully added.",
          variant: "success",
        });
      }

      // Reset form only if adding new (optional: keep data if editing)
      if (!existingDocId) {
        setAmountSpent("");
        setSelectedShopper("");
        setExpenseType("groceries");
        setExpenseTitle("");
        setSelectedDate(new Date());
      }
    } catch (error) {
      console.error("Error adding/updating document: ", error);
      toast({
        title: "Error",
        description: "Failed to add/update expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Add Grocery or Other Expense</h1>
      <DatePickerMealCount
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

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
              {members.map((member) => (
                <option key={member.member_id} value={member.member_name}>
                  {member.member_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Button className="w-full" type="submit">
            {existingDocId ? "Update" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddGrocerySpendings;