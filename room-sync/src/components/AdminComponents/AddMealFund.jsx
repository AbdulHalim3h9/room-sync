import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// Import the members data from the JSON file
import { membersData } from "@/membersData";// Adjust the import path as needed

const AddMealFund = () => {
  const [selectedDonor, setSelectedDonor] = useState(""); // State to hold selected donor
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Donor:", selectedDonor);
    console.log("Amount:", amount);
    // Here you would handle form submission (e.g., API call)
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Donation Form</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donor Dropdown */}
        <div>
          <Label htmlFor="donor" className="block mb-1">
            Donor Name
          </Label>
          <select
            id="donor"
            value={selectedDonor}
            onChange={(e) => setSelectedDonor(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Select a donor</option>
            {membersData.map((member) => (
              <option key={member.member_id} value={member.member_name}>
                {member.member_name}
              </option>
            ))}
          </select>
        </div>

        {/* Donation Amount */}
        <div>
          <Label htmlFor="amount" className="block mb-1">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter donation amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default AddMealFund;
