"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import SingleMonthYearPicker from "../SingleMonthYearPicker";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { membersData } from "@/membersData";

const SetIndividual = () => {
  const [individuals, setIndividuals] = useState([
    { member: "", fields: [{ title: "", amount: "" }] },
  ]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );

  const { toast } = useToast(); // Initialize toast hook

  // Handle individual input changes
  const handleIndividualChange = (index, e) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[index][e.target.name] = e.target.value;
    setIndividuals(updatedIndividuals);
  };

  // Handle field changes (Title and Amount)
  const handleFieldChange = (individualIndex, fieldIndex, e) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[individualIndex].fields[fieldIndex][e.target.name] = e.target.value;
    setIndividuals(updatedIndividuals);
  };

  // Add a new field (Title and Amount) for a specific individual
  const handleAddField = (index) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[index].fields.push({ title: "", amount: "" });
    setIndividuals(updatedIndividuals);
  };

  // Remove a field for a specific individual
  const handleRemoveField = (individualIndex, fieldIndex) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[individualIndex].fields.splice(fieldIndex, 1);
    setIndividuals(updatedIndividuals);
  };

  // Handle month change from MonthYearPicker
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate the form data
    const validationErrors = [];
    individuals.forEach((individual, index) => {
      if (!individual.member) {
        validationErrors.push(`Member ${index + 1} is not selected`);
      }
      individual.fields.forEach((field, fieldIndex) => {
        if (!field.title) {
          validationErrors.push(`Title for field ${fieldIndex + 1} of Member ${index + 1} is required`);
        }
        if (!field.amount) {
          validationErrors.push(`Amount for field ${fieldIndex + 1} of Member ${index + 1} is required`);
        } else if (!/^\d+$/.test(field.amount)) {
          validationErrors.push(`Amount for field ${fieldIndex + 1} of Member ${index + 1} must be a number`);
        }
      });
    });

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Format the data to match the shared bills structure
    const bills = individuals.map((individual) => ({
      name: individual.member,
      status: "Pending",
      payables: individual.fields.map((field) => ({
        name: field.title,
        amount: parseInt(field.amount) || 0,
      })),
    }));

    // Create the Firestore document
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
          description: "Individual payables have been successfully updated.",
          variant: "success",
        });
      } else {
        await addDoc(billsCollectionRef, billData);
        toast({
          title: "Success!",
          description: "Individual payables have been successfully set.",
          variant: "success",
        });
      }

      // Reset form after successful submission
      setIndividuals([{ member: "", fields: [{ title: "", amount: "" }] }]);
    } catch (error) {
      console.error("Error uploading/updating data: ", error);
      toast({
        title: "Error",
        description: "Failed to set/update individual payables. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Set Payables for Individual</h1>

      {/* Month Selection */}
      <div className="mb-6">
        <Label htmlFor="monthPicker" className="block mb-1">
          Select Month
        </Label>
        <SingleMonthYearPicker onChange={handleMonthChange} />
      </div>

      {individuals.map((individual, index) => (
        <div key={index} className="space-y-4">
          {/* Member Dropdown */}
          <div>
            <Label htmlFor={`member-${index}`} className="block mb-1">
              Member
            </Label>
            <select
              id={`member-${index}`}
              name="member"
              value={individual.member}
              onChange={(e) => handleIndividualChange(index, e)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">Select a member</option>
              {membersData.map((member) => (
                <option key={member.member_id} value={member.member_name}>
                  {member.member_name}
                </option>
              ))}
            </select>
          </div>

          {/* Fields for Title and Amount */}
          {individual.fields.map((field, fieldIndex) => (
            <div key={fieldIndex} className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <div>
                    <Label htmlFor={`title-${fieldIndex}`} className="block mb-1">
                      Title
                    </Label>
                    <Input
                      id={`title-${fieldIndex}`}
                      name="title"
                      type="text"
                      value={field.title}
                      onChange={(e) => handleFieldChange(index, fieldIndex, e)}
                      placeholder="Enter title"
                      className="w-full mb-2"
                    />
                  </div>

                  <Label htmlFor={`amount-${fieldIndex}`} className="block mb-1">
                    Amount
                  </Label>
                  <Input
                    id={`amount-${fieldIndex}`}
                    name="amount"
                    type="number"
                    value={field.amount}
                    onChange={(e) => handleFieldChange(index, fieldIndex, e)}
                    placeholder="Enter amount"
                    className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Button to remove the field */}
                <div>
                  <Button
                    type="button"
                    onClick={() => handleRemoveField(index, fieldIndex)}
                    variant="destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Button to add more fields */}
          <div className="mt-4">
            <Button type="button" onClick={() => handleAddField(index)}>
              Add Field
            </Button>
          </div>
        </div>
      ))}

      {/* Total Amount (Placeholder - needs calculation logic) */}
      <div className="font-bold text-lg mt-6">
        Total Amount: {individuals.reduce((total, ind) => 
          total + ind.fields.reduce((sum, field) => 
            sum + (parseInt(field.amount) || 0), 0), 0)} tk
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <Button type="button" onClick={handleSubmit} className="w-full">
          Submit
        </Button>
      </div>
    </div>
  );
};

export default SetIndividual;