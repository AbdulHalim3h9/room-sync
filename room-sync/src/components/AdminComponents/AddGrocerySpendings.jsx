import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// Import the members data from the JSON file
import { membersData } from "@/membersData"; // Adjust the import path as needed

const AddGrocerySpendings = () => {
  const [amountSpent, setAmountSpent] = useState("");
  const [selectedShopper, setSelectedShopper] = useState(""); // State for selected shopper

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Amount Spent:", amountSpent);
    console.log("Shopper:", selectedShopper);
    // Here you can handle form submission logic
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Expense Form</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Spent Field */}
        <div>
          <Label htmlFor="amount" className="block mb-1">
            Amount Spent
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount spent"
            value={amountSpent}
            onChange={(e) => setAmountSpent(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Shopper Dropdown */}
        <div>
          <Label htmlFor="shopper" className="block mb-1">
            Shopper
          </Label>
          <select
            id="shopper"
            value={selectedShopper}
            onChange={(e) => setSelectedShopper(e.target.value)}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Select a shopper</option>
            {membersData.map((member) => (
              <option key={member.member_id} value={member.member_name}>
                {member.member_name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default AddGrocerySpendings;
