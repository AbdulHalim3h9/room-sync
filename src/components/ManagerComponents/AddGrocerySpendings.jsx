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
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  setDoc as firestoreSetDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import DatePickerMealCount from "./DatePickerMealCount";

const AddGrocerySpendings = () => {
  const [amountSpent, setAmountSpent] = useState("");
  const [selectedShopper, setSelectedShopper] = useState("");
  const [expenseType, setExpenseType] = useState("groceries");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [members, setMembers] = useState([]);
  const [datesWithData, setDatesWithData] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembersAndDates = async () => {
      try {
        // Fetch members active on selectedDate
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
            const selectedDateStart = new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate()
            );
            if (activeFromDate > selectedDateStart) return false;
            if (member.archiveFrom) {
              const archiveFromDate = new Date(member.archiveFrom + "-01");
              return selectedDateStart < archiveFromDate;
            }
            return true;
          })
          .sort((a, b) => a.member_name.localeCompare(b.member_name));
        setMembers(membersData);
        console.log("Fetched active members for", selectedDate.toISOString().split("T")[0], ":", membersData);
        if (membersData.length === 0 && expenseType === "groceries") {
          toast({
            title: "No Active Members",
            description: `No members are active for ${selectedDate.toLocaleDateString()}.`,
            variant: "destructive",
            className: "z-[1002]",
          });
        }

        // Fetch dates with expense data
        const expensesRef = collection(db, "expenses");
        const expenseDocs = await getDocs(expensesRef);
        const dates = new Set();
        for (const monthDoc of expenseDocs.docs) {
          const monthId = monthDoc.id; // e.g., "2025-04"
          // Validate monthId format (YYYY-MM)
          if (!/^\d{4}-\d{2}$/.test(monthId)) {
            console.log(`Skipping invalid monthId: ${monthId}`);
            continue;
          }
          const monthExpensesRef = collection(db, "expenses", monthId, "expenses");
          const monthDocs = await getDocs(monthExpensesRef);
          monthDocs.forEach((doc) => {
            const data = doc.data();
            if (data.date) {
              const expenseDate = new Date(data.date);
              if (!isNaN(expenseDate.getTime()) && expenseDate <= new Date()) {
                dates.add(
                  new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate()).getTime()
                );
              }
            }
          });
        }
        setDatesWithData(Array.from(dates).map((time) => new Date(time)));
      } catch (error) {
        console.error("Error fetching data: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch members or expense data.",
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    };

    fetchMembersAndDates();
  }, [selectedDate, expenseType, toast]);

  const generateDocumentId = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  const saveTotalSpendings = async (month) => {
    try {
      const expensesRef = collection(db, "expenses", month, "expenses");
      const querySnapshot = await getDocs(expensesRef);
      const newTotalSpendings = querySnapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (parseInt(data.amountSpent) || 0);
      }, 0);

      const summaryRef = doc(db, "mealSummaries", month);
      const summarySnap = await getDoc(summaryRef);
      const existingData = summarySnap.exists() ? summarySnap.data() : {};
      const existingTotalMeals = existingData.totalMealsAllMembers || 0;

      const mealRate =
        existingTotalMeals > 0
          ? (newTotalSpendings / existingTotalMeals).toFixed(2)
          : 0;

      await firestoreSetDoc(
        summaryRef,
        {
          totalSpendings: newTotalSpendings,
          mealRate: parseFloat(mealRate),
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving total spendings:", error);
      toast({
        title: "Error",
        description: "Failed to save total spendings or meal rate.",
        variant: "destructive",
        className: "z-[1002]",
      });
    }
  };

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
        className: "z-[1002]",
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
    const docId = generateDocumentId(selectedDate);
    const expenseData = {
      amountSpent: parseInt(amountSpent),
      shopperId: selectedShopper || null,
      expenseType,
      expenseTitle: expenseType === "other" ? expenseTitle : null,
      date: formattedDate,
    };

    try {
      // Ensure the parent document exists
      const monthDocRef = doc(db, "expenses", docId);
      await firestoreSetDoc(monthDocRef, { createdAt: new Date().toISOString() }, { merge: true });

      const expensesRef = collection(db, "expenses", docId, "expenses");
      await addDoc(expensesRef, expenseData);

      toast({
        title: "Success",
        description: "Expense added successfully.",
        className: "z-[1002]",
      });

      await saveTotalSpendings(docId);

      setAmountSpent("");
      setSelectedShopper("");
      setExpenseType("groceries");
      setExpenseTitle("");
      setSelectedDate(new Date());

      // Update datesWithData
      const newDate = new Date(formattedDate);
      if (!datesWithData.some((d) => d.getTime() === newDate.getTime())) {
        setDatesWithData((prev) => [
          ...prev,
          new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
        ]);
      }
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
        className: "z-[1002]",
      });
    }
  };

  return (
    <div className="w-full max-w-[98vw] sm:max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div>
        {/* Header without background color */}
        <div className="px-4 py-5 sm:py-6 border-b-2 border-blue-600 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-800 tracking-tight">
            Add Grocery or Other Expense
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
            Record expenses for meal management
          </p>
        </div>

        <div className="p-5 sm:p-8">
          {/* Date Picker Section */}
          <div className="mb-8">
            <Label className="block mb-2 text-sm font-semibold text-gray-800">
              Select Date
            </Label>
            <div className="p-3">
              <DatePickerMealCount
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                datesWithData={datesWithData}
              />
            </div>
          </div>

          {/* Expense Type Selection */}
          <div className="mb-8">
            <Label className="block mb-3 text-sm font-semibold text-gray-800">
              Expense Type
            </Label>
            <div className="flex flex-wrap gap-4">
              <label className="relative flex items-center group">
                <input
                  type="radio"
                  id="groceries"
                  name="expenseType"
                  value="groceries"
                  checked={expenseType === "groceries"}
                  onChange={() => setExpenseType("groceries")}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all">
                  {expenseType === "groceries" && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
                <Label htmlFor="groceries" className="ml-2 text-sm font-medium text-gray-700 peer-checked:text-blue-600 cursor-pointer">
                  Groceries
                </Label>
              </label>
              <label className="relative flex items-center group">
                <input
                  type="radio"
                  id="other"
                  name="expenseType"
                  value="other"
                  checked={expenseType === "other"}
                  onChange={() => setExpenseType("other")}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all">
                  {expenseType === "other" && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
                <Label htmlFor="other" className="ml-2 text-sm font-medium text-gray-700 peer-checked:text-blue-600 cursor-pointer">
                  Other Expense
                </Label>
              </label>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Amount Spent Field */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="block text-sm font-semibold text-gray-800">
                  Amount Spent
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">৳</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amountSpent}
                    onChange={(e) => setAmountSpent(e.target.value)}
                    className="pl-8 h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter the total amount spent in BDT</p>
              </div>

              {/* Expense Title Field - Only for "Other" type */}
              {expenseType === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="title" className="block text-sm font-semibold text-gray-800">
                    Expense Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="E.g., Cooking gas, Utilities"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-base shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Briefly describe the expense</p>
                </div>
              )}

              {/* Shopper Selection - Only for "Groceries" type */}
              {expenseType === "groceries" && (
                <div className="space-y-2">
                  <Label htmlFor="shopper" className="block text-sm font-semibold text-gray-800">
                    Shopper
                  </Label>
                  <Select value={selectedShopper} onValueChange={setSelectedShopper}>
                    <SelectTrigger
                      id="shopper"
                      className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-base shadow-sm"
                    >
                      <SelectValue placeholder="Select a shopper" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                      {members.length > 0 ? (
                        members.map((member) => (
                          <SelectItem 
                            key={member.member_id} 
                            value={member.member_id}
                            className="py-2.5 text-base font-medium"
                          >
                            {member.member_name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No active members for this date
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Select who purchased the groceries</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-lg shadow-sm transition-colors duration-200 focus:ring-4 focus:ring-blue-200 focus:ring-opacity-50"
                disabled={expenseType === "groceries" && members.length === 0}
              >
                {expenseType === "groceries" ? "Add Grocery Expense" : "Add Other Expense"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGrocerySpendings;