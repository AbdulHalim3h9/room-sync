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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
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
import { addToGlobalSpendings } from "@/utils/globalFundManager";

const AddGrocerySpendings = () => {
  const [amountSpent, setAmountSpent] = useState("");
  const [selectedShopper, setSelectedShopper] = useState("");
  const [expenseType, setExpenseType] = useState("groceries");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [members, setMembers] = useState([]);
  const [datesWithData, setDatesWithData] = useState([]);
  const [payLater, setPayLater] = useState(false);
  const [showPayLaterDialog, setShowPayLaterDialog] = useState(false);
  const [dueNote, setDueNote] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("low");
  const [contactInfo, setContactInfo] = useState("");
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
        // Only include paid expenses (not payLater) in total spendings
        if (!data.payLater) {
          return sum + (parseInt(data.amountSpent) || 0);
        }
        return sum;
      }, 0);

      // Add to global spendings (month-independent)
      if (newTotalSpendings > 0) {
        await addToGlobalSpendings(newTotalSpendings);
      }

      // Update monthly meal summaries for meal rate calculation
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
          totalSpendings: newTotalSpendings, // Monthly spendings for meal rate calculation
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

    if (payLater && (!dueNote || !dueDate)) {
      errors.push("Due Note and Due Date are required for Pay Later expenses.");
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

  const handlePayLaterToggle = (checked) => {
    if (checked) {
      setShowPayLaterDialog(true);
    } else {
      setPayLater(false);
      setDueNote(""); // Reset due note when pay later is toggled off
      setDueDate("");
      setPriority("low");
      setContactInfo("");
    }
  };

  const confirmPayLater = () => {
    setPayLater(true);
    setShowPayLaterDialog(false);
  };

  const cancelPayLater = () => {
    setPayLater(false);
    setDueNote(""); // Reset due note when pay later is canceled
    setDueDate("");
    setPriority("low");
    setContactInfo("");
    setShowPayLaterDialog(false);
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
      payLater,
    };

    try {
      // Ensure the parent document exists for expenses
      const monthDocRef = doc(db, "expenses", docId);
      await firestoreSetDoc(monthDocRef, { createdAt: new Date().toISOString() }, { merge: true });

      // Add expense to expenses collection
      const expensesRef = collection(db, "expenses", docId, "expenses");
      const expenseDocRef = await addDoc(expensesRef, expenseData);

      // If payLater is true, add to dues collection
      if (payLater) {
        const duesMonthDocRef = doc(db, "dues", docId);
        await firestoreSetDoc(duesMonthDocRef, { createdAt: new Date().toISOString() }, { merge: true });

        const duesRef = collection(db, "dues", docId, "dues");
        const dueData = {
          expenseId: expenseDocRef.id,
          amount: parseInt(amountSpent),
          shopperId: selectedShopper || null,
          expenseType,
          expenseTitle: expenseType === "other" ? expenseTitle : null,
          date: formattedDate,
          paymentStatus: "pending",
          dueNote: dueNote || null, // Store due note, null if empty
          dueDate: dueDate || null, // Store due date, null if empty
          priority: priority || null, // Store priority, null if empty
          contactInfo: contactInfo || null, // Store contact info, null if empty
          createdAt: new Date().toISOString(),
        };
        await addDoc(duesRef, dueData);
      }

      toast({
        title: "Success",
        description: `Expense added successfully${payLater ? " (marked as Pay Later)" : ""}.`,
        className: "z-[1002]",
      });

      await saveTotalSpendings(docId);

      setAmountSpent("");
      setSelectedShopper("");
      setExpenseType("groceries");
      setExpenseTitle("");
      setSelectedDate(new Date());
      setPayLater(false);
      setDueNote("");
      setDueDate("");
      setPriority("low");
      setContactInfo("");

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
        description: "Failed to add expense or due. Please try again.",
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
                    placeholder="E.g., Chingri, Noodles party"
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

            {/* Pay Later Toggle */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pay-later"
                  checked={payLater}
                  onCheckedChange={handlePayLaterToggle}
                />
                <Label htmlFor="pay-later" className="text-sm font-semibold text-gray-800">
                  Pay Later
                </Label>
              </div>
              <p className="text-xs text-gray-500">Mark this expense to be paid later</p>
            </div>

            {/* Pay Later Fields - Only when Pay Later is enabled */}
            {payLater && (
              <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="due-note" className="block text-sm font-semibold text-gray-800">
                    Due Note
                  </Label>
                  <Input
                    id="due-note"
                    type="text"
                    placeholder="E.g., Bacchar dokane baki, or specific details"
                    value={dueNote}
                    onChange={(e) => setDueNote(e.target.value)}
                    className="h-11 rounded-lg border-gray-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 text-base shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional note about the due payment</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due-date" className="block text-sm font-semibold text-gray-800">
                      Due Date
                    </Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="h-11 rounded-lg border-gray-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 text-base shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">When this due should be paid</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="block text-sm font-semibold text-gray-800">
                      Priority Level
                    </Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="h-11 rounded-lg border-gray-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 text-base shadow-sm">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                        <SelectItem value="low" className="py-2.5 text-base font-medium">Low</SelectItem>
                        <SelectItem value="medium" className="py-2.5 text-base font-medium">Medium</SelectItem>
                        <SelectItem value="high" className="py-2.5 text-base font-medium">High</SelectItem>
                        <SelectItem value="urgent" className="py-2.5 text-base font-medium">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">How urgent this payment is</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-info" className="block text-sm font-semibold text-gray-800">
                    Contact Information
                  </Label>
                  <Input
                    id="contact-info"
                    type="text"
                    placeholder="E.g., Shop owner's phone number or address"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="h-11 rounded-lg border-gray-200 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 text-base shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact details for the person/shop to be paid</p>
                </div>
              </div>
            )}

            {/* Pay Later Confirmation Dialog */}
            <AlertDialog open={showPayLaterDialog} onOpenChange={setShowPayLaterDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Pay Later</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to mark this expense as "Pay Later"? This will record the expense as unpaid and may affect future calculations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={cancelPayLater}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmPayLater}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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