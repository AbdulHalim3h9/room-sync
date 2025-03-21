import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase"; // Import Firestore config
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore"; // Firestore imports
import SetIndividual from "./SetIndividual";
import SingleMonthYearPicker from "../SingleMonthYearPicker"; // Import the MonthYearPicker component

const SetPayables = () => {
  const [formType, setFormType] = useState("apartment"); // Default is "apartment"
  const [roomRent, setRoomRent] = useState("");
  const [diningRent, setDiningRent] = useState("");
  const [serviceCharge, setServiceCharge] = useState("");
  const [khalasBill, setKhalasBill] = useState("");
  const [utilityBill, setUtilityBill] = useState("");
  const [status, setStatus] = useState("Pending");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" }) // Default to current month
  );

  // Handle month change from MonthYearPicker
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create the payables array
    const payables = [
      { name: "Room Rent", amount: parseInt(roomRent) || 0 },
      { name: "Dining Rent", amount: parseInt(diningRent) || 0 },
      { name: "Service Charge", amount: parseInt(serviceCharge) || 0 },
      { name: "Khala's Bill", amount: parseInt(khalasBill) || 0 },
      { name: "Utility Bill", amount: parseInt(utilityBill) || 0 },
    ];

    // Create the bills array
    const bills = [
      {
        id: 1, // You can dynamically generate this ID
        name: "Abdul Halim Khan",
        status: status,
        payables: [...payables], // Copy the payables array for each member
      },
      {
        id: 2,
        name: "Shakil",
        status: status,
        payables: [...payables],
      },
      {
        id: 3,
        name: "Ahad",
        status: status,
        payables: [...payables],
      },
      {
        id: 4,
        name: "Mafi",
        status: status,
        payables: [...payables],
      },
      {
        id: 5,
        name: "Pran",
        status: status,
        payables: [...payables],
      },
      {
        id: 6,
        name: "Alhaz",
        status: status,
        payables: [...payables],
      },
      {
        id: 7,
        name: "Abdan",
        status: status,
        payables: [...payables],
      },
      {
        id: 8,
        name: "AbdKhan",
        status: status,
        payables: [...payables],
      },
      // Add other members here if needed
    ];

    // Create the Firestore document
    const billData = {
      month: selectedMonth, // Store the selected month
      bills, // Store the bills array
    };

    try {
      // Check if data already exists for the selected month
      const billsCollectionRef = collection(db, "payables"); // Firestore collection
      const q = query(billsCollectionRef, where("month", "==", selectedMonth)); // Query for the selected month
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If data exists, update the existing document
        const docId = querySnapshot.docs[0].id; // Get the document ID
        const docRef = doc(db, "payables", docId); // Reference the document
        await updateDoc(docRef, billData); // Update the document
        console.log("Data updated successfully");
      } else {
        // If data does not exist, create a new document
        await addDoc(billsCollectionRef, billData); // Add the document
        console.log("Data uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading/updating data: ", error);
    }
  };

  const handleFormTypeChange = (e) => {
    setFormType(e.target.value);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">
        Add payables for {selectedMonth} {/* Display selected month */}
      </h1>

      {/* Month Selection */}
      <div className="mb-6">
        <Label htmlFor="monthPicker" className="block mb-1">
          Select Month
        </Label>
        <SingleMonthYearPicker onChange={handleMonthChange} />
      </div>

      {/* Radio Button for Form Type */}
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
            {/* Room rent and Dining rent in the same row */}
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

            {/* Service charge */}
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

            {/* Khala's bill */}
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

            {/* Utility bill */}
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

            {/* Submit Button */}
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