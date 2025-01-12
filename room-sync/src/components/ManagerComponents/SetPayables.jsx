import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const SetPayables = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted");
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Apartment Expense Form</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room rent and Dining rent in the same row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="roomRent" className="block mb-1">
              Room Rent
            </Label>
            <Input
              id="roomRent"
              type="number"
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
            placeholder="Enter utility bill"
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

export default SetPayables;
