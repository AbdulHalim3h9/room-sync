"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import {
  collection,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import IndividualPayablesForm from "./SetIndividual";
import SingleMonthYearPicker from "../SingleMonthYearPicker";
import { useToast } from "@/hooks/use-toast";

const SharedPayablesInputs = ({ formData, onChange }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="roomRent" className="block mb-1">
          Room Rent
        </Label>
        <Input
          id="roomRent"
          type="number"
          value={formData.roomRent}
          onChange={(e) => onChange("roomRent", e.target.value)}
          placeholder="Enter room rent"
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <div>
        <Label htmlFor="diningRent" className="block mb-1">
          Dining Rent
        </Label>
        <Input
          id="diningRent"
          type="number"
          value={formData.diningRent}
          onChange={(e) => onChange("diningRent", e.target.value)}
          placeholder="Enter dining rent"
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>
    <div>
      <Label htmlFor="serviceCharge" className="block mb-1">
        Service Charge
      </Label>
      <Input
        id="serviceCharge"
        type="number"
        value={formData.serviceCharge}
        onChange={(e) => onChange("serviceCharge", e.target.value)}
        placeholder="Enter service charge"
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
    <div>
      <Label htmlFor="khalasBill" className="block mb-1">
        Khala's Bill
      </Label>
      <Input
        id="khalasBill"
        type="number"
        value={formData.khalasBill}
        onChange={(e) => onChange("khalasBill", e.target.value)}
        placeholder="Enter Khala's bill"
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
    <div>
      <Label htmlFor="utilityBill" className="block mb-1">
        Utility Bill
      </Label>
      <Input
        id="utilityBill"
        type="number"
        value={formData.utilityBill}
        onChange={(e) => onChange("utilityBill", e.target.value)}
        placeholder="Enter utility bill"
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
      const q = query(membersCollectionRef, where("status", "==", "active"));
      const querySnapshot = await getDocs(q);
      const membersList = querySnapshot.docs.map((doc) => ({
        id: doc.data().id,
        name: doc.data().fullname,
        resident: doc.data().resident,
      }));
      setActiveMembers(membersList);
    } catch (error) {
      console.error("Error fetching active members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch active members.",
        variant: "destructive",
      });
    }
  }, [toast]);

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
        title: "Success!",
        description: `Shared payables for ${selectedMonth} have been successfully set/updated.`,
        variant: "success",
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
        description: "Failed to set/update payables. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Add Payables for {selectedMonth}</h1>
      <div className="mb-6">
        <Label htmlFor="monthPicker" className="block mb-1">
          Select Month
        </Label>
        <SingleMonthYearPicker
          value={selectedMonth}
          onChange={setSelectedMonth}
          collections={["payables"]}
        />
      </div>
      <div className="mb-6">
        <label className="mr-4">
          <input
            type="radio"
            value="shared"
            checked={formType === "shared"}
            onChange={() => setFormType("shared")}
            className="mr-2"
          />
          Shared Bill
        </label>
        <label>
          <input
            type="radio"
            value="individual"
            checked={formType === "individual"}
            onChange={() => setFormType("individual")}
            className="mr-2"
          />
          Individual Payables
        </label>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formType === "shared" ? (
          <>
            <SharedPayablesInputs
              formData={formData}
              onChange={handleInputChange}
            />
            <Button type="submit" className="w-full">
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