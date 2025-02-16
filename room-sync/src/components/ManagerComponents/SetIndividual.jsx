import { membersData } from '@/membersData';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { db } from "@/firebase"; // Import Firestore config
import { collection, addDoc } from "firebase/firestore"; // Firestore imports
import SingleMonthYearPicker from "../SingleMonthYearPicker"; // Import the MonthYearPicker component

const SetIndividual = () => {
  const [individuals, setIndividuals] = useState([
    { member: "", fields: [{ title: "", amount: "" }] },
  ]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" }) // Default to current month
  );
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
    updatedIndividuals[individualIndex].fields.splice(fieldIndex, 1); // Remove the field
    setIndividuals(updatedIndividuals);
  };

  // Handle month change from MonthYearPicker
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };
  // Handle form submission
  const handleSubmit = async () => {
    // Validate the form data
    const isValid = individuals.every((individual) => {
      return (
        individual.member && // Member is selected
        individual.fields.every((field) => field.title && field.amount) // All fields are filled
      );
    });

    if (!isValid) {
      alert("Please fill out all fields before submitting.");
      return;
    }

    // Format the data to match the shared bills structure
    const bills = individuals.map((individual) => ({
      name: individual.member,
      status: "Pending", // Default status
      payables: individual.fields.map((field) => ({
        name: field.title,
        amount: parseInt(field.amount) || 0,
      })),
    }));

    // Create the Firestore document
    const billData = {
      month: selectedMonth, // Include the selected month
      bills, // Include the formatted bills array
    };

    try {
      // Add bill data to Firestore
      const billsCollectionRef = collection(db, "payables"); // Firestore collection
      await addDoc(billsCollectionRef, billData); // Add the document
      console.log("Data uploaded successfully");
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error uploading data: ", error);
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
                    className="w-full"
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

      {/* Total Amount */}
      <div className="font-bold text-lg mt-6">
        Total Amount: {} tk
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