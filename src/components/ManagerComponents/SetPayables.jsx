"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore";
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
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNum = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthNum}`; // e.g., "2025-04"
  });
  const [activeMembers, setActiveMembers] = useState([]);

  const { toast } = useToast();

  useEffect(() => {
    const fetchActiveMembers = async () => {
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
        console.error("Error fetching active members: ", error);
        toast({
          title: "Error",
          description: "Failed to fetch active members.",
          variant: "destructive",
        });
      }
    };

    fetchActiveMembers();
  }, [toast]);

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth); // Expecting "YYYY-MM" format
  };

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
        errors.push(`${fieldName.replace(/([A-Z])/g, " $1").trim()}`);
      } else if (!/^\d+$/.test(value)) {
        errors.push(
          `${fieldName.replace(/([A-Z])/g, " $1").trim()} must be a number`
        );
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

    if (!validateForm()) {
      return;
    }

    const sharedPayables = [
      { name: "Room Rent", amount: parseInt(roomRent) || 0 },
      { name: "Dining Rent", amount: parseInt(diningRent) || 0 },
      { name: "Service Charge", amount: parseInt(serviceCharge) || 0 },
      { name: "Khala's Bill", amount: parseInt(khalasBill) || 0 },
      { name: "Utility Bill", amount: parseInt(utilityBill) || 0 },
    ];

    try {
      const billsCollectionRef = collection(db, "payables");
      const docRef = doc(billsCollectionRef, selectedMonth); // Use selectedMonth as document ID
      const docSnapshot = await getDocs(query(billsCollectionRef, where("__name__", "==", selectedMonth)));
      let existingBills = [];

      if (!docSnapshot.empty) {
        existingBills = docSnapshot.docs[0].data().bills || [];
      }

      const membersWithoutBills = activeMembers.filter(
        (member) => !existingBills.some((bill) => bill.id === member.id)
      );

      const updatedBills = [
        ...existingBills,
        ...membersWithoutBills.map((member) => {
          const filteredPayables = sharedPayables.filter((payable) => {
            if (member.resident === "room" && payable.name === "Dining Rent")
              return false;
            if (member.resident === "dining" && payable.name === "Room Rent")
              return false;
            return true;
          });

          return {
            id: member.id,
            name: member.name,
            status: status,
            payables: filteredPayables,
          };
        }),
      ];

      // Save directly under the month as the document ID, with only the bills array
      await setDoc(docRef, { bills: updatedBills }, { merge: true });

      toast({
        title: "Success!",
        description: `Shared payables for ${selectedMonth} have been successfully set/updated.`,
        variant: "success",
      });

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
      <h1 className="text-xl font-bold mb-6">Add payables for {selectedMonth}</h1>
      <div className="mb-6">
        <Label htmlFor="monthPicker" className="block mb-1">
          Select Month
        </Label>
        <SingleMonthYearPicker
          value={selectedMonth}
          onChange={handleMonthChange}
          collections={["payables"]}
        />
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
          <SetIndividual selectedMonth={selectedMonth} />
        )}
      </form>
    </div>
  );
};

export default SetPayables;