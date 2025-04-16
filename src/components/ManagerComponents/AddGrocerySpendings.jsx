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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Add Grocery or Other Expense</h1>
      <div className="mb-6">
        <Label className="block mb-2 text-sm font-medium text-gray-700">
          Select Date
        </Label>
        <DatePickerMealCount
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          datesWithData={datesWithData}
        />
      </div>

      <div className="flex space-x-6 mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            id="groceries"
            name="expenseType"
            value="groceries"
            checked={expenseType === "groceries"}
            onChange={() => setExpenseType("groceries")}
            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
          />
          <Label htmlFor="groceries" className="text-sm font-medium text-gray-700">
            Groceries
          </Label>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            id="other"
            name="expenseType"
            value="other"
            checked={expenseType === "other"}
            onChange={() => setExpenseType("other")}
            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
          />
          <Label htmlFor="other" className="text-sm font-medium text-gray-700">
            Other
          </Label>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-700">
            Amount Spent
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount spent (BDT)"
            value={amountSpent}
            onChange={(e) => setAmountSpent(e.target.value)}
            className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {expenseType === "other" && (
          <div>
            <Label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">
              Expense Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter expense title"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {expenseType === "groceries" && (
          <div>
            <Label htmlFor="shopper" className="block mb-2 text-sm font-medium text-gray-700">
              Shopper
            </Label>
            <Select value={selectedShopper} onValueChange={setSelectedShopper}>
              <SelectTrigger
                id="shopper"
                className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <SelectValue placeholder="Select a shopper" />
              </SelectTrigger>
              <SelectContent>
                {members.length > 0 ? (
                  members.map((member) => (
                    <SelectItem key={member.member_id} value={member.member_id}>
                      {member.member_name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No active members for this date
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-md"
          disabled={expenseType === "groceries" && members.length === 0}
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default AddGrocerySpendings;