"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// Note: Add @/components/ui/radio-group if available (e.g., via Shadcn UI)
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { db } from "@/firebase";
import {
  collection,
  getDoc,
  setDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import IndividualPayablesForm from "./SetIndividual";
import SingleMonthYearPicker from "../SingleMonthYearPicker";
import { useToast } from "@/hooks/use-toast";

const SharedPayablesInputs = ({ formData, onChange }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="roomRent" className="block text-sm font-semibold text-gray-800">
          Room Rent
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">৳</span>
          </div>
          <Input
            id="roomRent"
            type="number"
            value={formData.roomRent}
            onChange={(e) => onChange("roomRent", e.target.value)}
            placeholder="Enter amount"
            className="pl-8 h-11 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Monthly room rent amount</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="diningRent" className="block text-sm font-semibold text-gray-800">
          Dining Rent
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">৳</span>
          </div>
          <Input
            id="diningRent"
            type="number"
            value={formData.diningRent}
            onChange={(e) => onChange("diningRent", e.target.value)}
            placeholder="Enter amount"
            className="pl-8 h-11 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Monthly dining space rent</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="serviceCharge" className="block text-sm font-semibold text-gray-800">
          Service Charge
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">৳</span>
          </div>
          <Input
            id="serviceCharge"
            type="number"
            value={formData.serviceCharge}
            onChange={(e) => onChange("serviceCharge", e.target.value)}
            placeholder="Enter amount"
            className="pl-8 h-11 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Monthly service charge amount</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="khalasBill" className="block text-sm font-semibold text-gray-800">
          Khala's Bill
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">৳</span>
          </div>
          <Input
            id="khalasBill"
            type="number"
            value={formData.khalasBill}
            onChange={(e) => onChange("khalasBill", e.target.value)}
            placeholder="Enter amount"
            className="pl-8 h-11 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Monthly payment for Khala</p>
      </div>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="utilityBill" className="block text-sm font-semibold text-gray-800">
        Utility Bill
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">৳</span>
        </div>
        <Input
          id="utilityBill"
          type="number"
          value={formData.utilityBill}
          onChange={(e) => onChange("utilityBill", e.target.value)}
          placeholder="Enter amount"
          className="pl-8 h-11 rounded-lg border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">Combined electricity, water, gas bills</p>
    </div>
  </div>
);

const PayablesForm = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [formType, setFormType] = useState("shared");
  const [formData, setFormData] = useState({
    roomRent: "",
    diningRent: "",
    serviceCharge: "",
    khalasBill: "",
    utilityBill: "",
    status: "Pending",
  });
  const [activeMembers, setActiveMembers] = useState([]);
  const { toast } = useToast();

  const fetchActiveMembers = useCallback(async () => {
    try {
      const membersCollectionRef = collection(db, "members");
      const querySnapshot = await getDocs(membersCollectionRef);
      const membersList = querySnapshot.docs
        .map((doc) => ({
          id: doc.data().id,
          name: doc.data().fullname,
          resident: doc.data().resident,
          activeFrom: doc.data().activeFrom,
          archiveFrom: doc.data().archiveFrom,
        }))
        .filter((member) => {
          if (!member.activeFrom) return false;
          const activeFromDate = new Date(member.activeFrom + "-01");
          const selectedMonthDate = new Date(selectedMonth + "-01");
          if (activeFromDate > selectedMonthDate) return false;
          if (member.archiveFrom) {
            const archiveFromDate = new Date(member.archiveFrom + "-01");
            return selectedMonthDate < archiveFromDate;
          }
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      setActiveMembers(membersList);
      console.log("Fetched active members for", selectedMonth, ":", membersList);
      if (membersList.length === 0) {
        toast({
          title: "No Active Members",
          description: `No members are active for ${selectedMonth}.`,
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    } catch (error) {
      console.error("Error fetching active members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch active members.",
        variant: "destructive",
        className: "z-[1002]",
      });
    }
  }, [selectedMonth, toast]);

  useEffect(() => {
    fetchActiveMembers();
  }, [fetchActiveMembers]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors = [];
    const fields = [
      { key: "roomRent", label: "Room Rent" },
      { key: "diningRent", label: "Dining Rent" },
      { key: "serviceCharge", label: "Service Charge" },
      { key: "khalasBill", label: "Khala's Bill" },
      { key: "utilityBill", label: "Utility Bill" },
    ];

    fields.forEach(({ key, label }) => {
      const value = formData[key];
      if (!value) {
        errors.push(label);
      } else if (!/^\d+$/.test(value)) {
        errors.push(`${label} must be a number`);
      }
    });

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

    const sharedPayables = [
      { name: "Room Rent", amount: parseInt(formData.roomRent) || 0 },
      { name: "Dining Rent", amount: parseInt(formData.diningRent) || 0 },
      { name: "Service Charge", amount: parseInt(formData.serviceCharge) || 0 },
      { name: "Khala's Bill", amount: parseInt(formData.khalasBill) || 0 },
      { name: "Utility Bill", amount: parseInt(formData.utilityBill) || 0 },
    ];

    try {
      const docRef = doc(db, "payables", selectedMonth);
      const docSnap = await getDoc(docRef);
      let existingBills = docSnap.exists() ? docSnap.data().bills || [] : [];

      const membersWithoutBills = activeMembers.filter(
        (member) => !existingBills.some((bill) => bill.id === member.id)
      );

      const updatedBills = [
        ...existingBills,
        ...membersWithoutBills.map((member) => {
          const filteredPayables = sharedPayables.filter((payable) => {
            if (member.resident === "room" && payable.name === "Dining Rent") return false;
            if (member.resident === "dining" && payable.name === "Room Rent") return false;
            return true;
          });

          return {
            id: member.id,
            name: member.name,
            status: formData.status,
            payables: filteredPayables,
          };
        }),
      ];

      await setDoc(docRef, { bills: updatedBills }, { merge: true });

      toast({
        title: "Success",
        description: `Shared payables for ${selectedMonth} have been set.`,
        className: "z-[1002]",
      });

      setFormData({
        roomRent: "",
        diningRent: "",
        serviceCharge: "",
        khalasBill: "",
        utilityBill: "",
        status: "Pending",
      });
    } catch (error) {
      console.error("Error uploading/updating data:", error);
      toast({
        title: "Error",
        description: "Failed to set payables. Please try again.",
        variant: "destructive",
        className: "z-[1002]",
      });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Manage Payables for {selectedMonth}
          </h1>
          <p className="text-indigo-100 text-sm mt-1 font-medium">
            {formType === "shared" ? 
              "Set shared monthly bills distributed among all members" : 
              "Add individual charges for specific members"}
          </p>
        </div>

        <div className="p-5 sm:p-8">
          {/* Month Picker Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Label htmlFor="monthPicker" className="block text-sm font-semibold text-gray-800">
                Select Month
              </Label>
              <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 shadow-sm">
                <SingleMonthYearPicker
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  collections={["payables"]}
                />
              </div>
            </div>
          </div>

          {/* Form Type Selection */}
          <div className="mb-8">
            <Label className="block mb-3 text-sm font-semibold text-gray-800">
              Payable Type
            </Label>
            <div className="flex flex-wrap gap-4">
              <label className="relative flex items-center group">
                <input
                  type="radio"
                  value="shared"
                  checked={formType === "shared"}
                  onChange={() => setFormType("shared")}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-indigo-500 peer-checked:bg-indigo-500 transition-all">
                  {formType === "shared" && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 peer-checked:text-indigo-600 cursor-pointer">
                  Shared Bills
                </span>
              </label>
              <label className="relative flex items-center group">
                <input
                  type="radio"
                  value="individual"
                  checked={formType === "individual"}
                  onChange={() => setFormType("individual")}
                  className="peer sr-only"
                />
                <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-indigo-500 peer-checked:bg-indigo-500 transition-all">
                  {formType === "individual" && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 peer-checked:text-indigo-600 cursor-pointer">
                  Individual Payables
                </span>
              </label>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {formType === "shared" ? (
              <>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
                  <h3 className="text-sm font-semibold text-indigo-800 mb-2">About Shared Bills</h3>
                  <p className="text-xs text-indigo-700">These bills will be distributed among all active members based on their residence type (room or dining).</p>
                </div>
                
                <SharedPayablesInputs
                  formData={formData}
                  onChange={handleInputChange}
                />
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-medium rounded-lg shadow-sm transition-colors duration-200 focus:ring-4 focus:ring-indigo-200 focus:ring-opacity-50"
                    disabled={activeMembers.length === 0}
                  >
                    Set Shared Payables
                  </Button>
                  {activeMembers.length === 0 && (
                    <p className="text-xs text-center text-red-500 mt-2">
                      No active members for the selected month
                    </p>
                  )}
                </div>
              </>
            ) : (
              <IndividualPayablesForm selectedMonth={selectedMonth} />
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PayablesForm;