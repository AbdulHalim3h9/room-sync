"use client"

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import SetIndividual from "./SetIndividual";
import SingleMonthYearPicker from "../SingleMonthYearPicker";
import { useToast } from "@/hooks/use-toast";

const SetPayables = () => {
  const [formType, setFormType] = useState("apartment");
  const [roomRent, setRoomRent] = useState("");
  const [diningRent, setDiningRent] = useState("");
  const [serviceCharge, setServiceCharge] = useState("");
  const [khalasBill, setKhalasBill] = useState("");
  const [utilityBill, setUtilityBill] = useState("");
  const [status, setStatus] = useState("Pending");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );

  const { toast } = useToast();

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  // Validation function
  const validateForm = () => {
    const errors = [];
    const fields = {
      roomRent,
      diningRent,
      serviceCharge,
      khalasBill,
      utilityBill,
    };

    Object.entries(fields).forEach(([fieldName, value]) => {
      if (!value) {
        errors.push(`${fieldName.replace(/([A-Z])/g, ' $1').trim()} is required`);
      } else if (!/^\d+$/.test(value)) {
        errors.push(`${fieldName.replace(/([A-Z])/g, ' $1').trim()} must be a number`);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return false;
    }
    return true; // No errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    const payables = [
      { name: "Room Rent", amount: parseInt(roomRent) || 0 },
      { name: "Dining Rent", amount: parseInt(diningRent) || 0 },
      { name: "Service Charge", amount: parseInt(serviceCharge) || 0 },
      { name: "Khala's Bill", amount: parseInt(khalasBill) || 0 },
      { name: "Utility Bill", amount: parseInt(utilityBill) || 0 },
    ];

    const bills = [
      { id: 1, name: "Abdul Halim Khan", status: status, payables: [...payables] },
      { id: 2, name: "Shakil", status: status, payables: [...payables] },
      { id: 3, name: "Ahad", status: status, payables: [...payables] },
      { id: 4, name: "Mafi", status: status, payables: [...payables] },
      { id: 5, name: "Pran", status: status, payables: [...payables] },
      { id: 6, name: "Alhaz", status: status, payables: [...payables] },
      { id: 7, name: "Abdan", status: status, payables: [...payables] },
      { id: 8, name: "AbdKhan", status: status, payables: [...payables] },
    ];

    const billData = {
      month: selectedMonth,
      bills,
    };

    try {
      const billsCollectionRef = collection(db, "payables");
      const q = query(billsCollectionRef, where("month", "==", selectedMonth));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(db, "payables", docId);
        await updateDoc(docRef, billData);
        toast({
          title: "Success!",
          description: "Payables have been successfully updated.",
          variant: "success",
        });
      } else {
        await addDoc(billsCollectionRef, billData);
        toast({
          title: "Success!",
          description: "Payables have been successfully set.",
          variant: "success",
        });
      }

      setRoomRent("");
      setDiningRent("");
      setServiceCharge("");
      setKhalasBill("");
      setUtilityBill("");
      setStatus("Pending");
    } catch (error) {
      console.error("Error uploading/updating data: ", error);
      toast({
        title: "Error",
        description: "Failed to set/update payables. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormTypeChange = (e) => {
    setFormType(e.target.value);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">
        Add payables for {selectedMonth}
      </h1>

      <div className="mb-6">
        <Label htmlFor="monthPicker" className="block mb-1">
          Select Month
        </Label>
        <SingleMonthYearPicker onChange={handleMonthChange} />
      </div>

      <div className="mb-6">
        <label className="mr-4">
          <input
            type="radio"
            value="apartment"
            checked={formType === "apartment"}
            onChange={handleFormTypeChange}
            className="mr-2"
          />
          Shared bill
        </label>
        <label>
          <input
            type="radio"
            value="individuals"
            checked={formType === "individuals"}
            onChange={handleFormTypeChange}
            className="mr-2"
          />
          Set Individuals
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formType === "apartment" ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomRent" className="block mb-1">
                  Room Rent
                </Label>
                <Input
                  id="roomRent"
                  type="number"
                  value={roomRent}
                  onChange={(e) => setRoomRent(e.target.value)}
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
                  value={diningRent}
                  onChange={(e) => setDiningRent(e.target.value)}
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
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
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
                value={khalasBill}
                onChange={(e) => setKhalasBill(e.target.value)}
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
                value={utilityBill}
                onChange={(e) => setUtilityBill(e.target.value)}
                placeholder="Enter utility bill"
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="mt-6">
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </div>
          </>
        ) : (
          <SetIndividual />
        )}
      </form>
    </div>
  );
};

export default SetPayables;