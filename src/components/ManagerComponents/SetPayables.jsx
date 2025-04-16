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
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="roomRent" className="block mb-2 text-sm font-medium text-gray-700">
          Room Rent
        </Label>
        <Input
          id="roomRent"
          type="number"
          value={formData.roomRent}
          onChange={(e) => onChange("roomRent", e.target.value)}
          placeholder="Enter room rent (BDT)"
          className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <div>
        <Label htmlFor="diningRent" className="block mb-2 text-sm font-medium text-gray-700">
          Dining Rent
        </Label>
        <Input
          id="diningRent"
          type="number"
          value={formData.diningRent}
          onChange={(e) => onChange("diningRent", e.target.value)}
          placeholder="Enter dining rent (BDT)"
          className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>
    <div>
      <Label htmlFor="serviceCharge" className="block mb-2 text-sm font-medium text-gray-700">
        Service Charge
      </Label>
      <Input
        id="serviceCharge"
        type="number"
        value={formData.serviceCharge}
        onChange={(e) => onChange("serviceCharge", e.target.value)}
        placeholder="Enter service charge (BDT)"
        className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
    <div>
      <Label htmlFor="khalasBill" className="block mb-2 text-sm font-medium text-gray-700">
        Khala's Bill
      </Label>
      <Input
        id="khalasBill"
        type="number"
        value={formData.khalasBill}
        onChange={(e) => onChange("khalasBill", e.target.value)}
        placeholder="Enter Khala's bill (BDT)"
        className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
    <div>
      <Label htmlFor="utilityBill" className="block mb-2 text-sm font-medium text-gray-700">
        Utility Bill
      </Label>
      <Input
        id="utilityBill"
        type="number"
        value={formData.utilityBill}
        onChange={(e) => onChange("utilityBill", e.target.value)}
        placeholder="Enter utility bill (BDT)"
        className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
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
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Add Payables for {selectedMonth}</h1>
      <div className="mb-6">
        <Label htmlFor="monthPicker" className="block mb-2 text-sm font-medium text-gray-700">
          Select Month
        </Label>
        <SingleMonthYearPicker
          value={selectedMonth}
          onChange={setSelectedMonth}
          collections={["payables"]}
        />
      </div>
      <div className="mb-6">
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="shared"
              checked={formType === "shared"}
              onChange={() => setFormType("shared")}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Shared Bill</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="individual"
              checked={formType === "individual"}
              onChange={() => setFormType("individual")}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Individual Payables</span>
          </label>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formType === "shared" ? (
          <>
            <SharedPayablesInputs
              formData={formData}
              onChange={handleInputChange}
            />
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-md"
              disabled={activeMembers.length === 0}
            >
              Submit
            </Button>
          </>
        ) : (
          <IndividualPayablesForm selectedMonth={selectedMonth} />
        )}
      </form>
    </div>
  );
};

export default PayablesForm;