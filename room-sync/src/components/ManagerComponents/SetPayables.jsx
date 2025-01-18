import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// Import the members data from the JSON file
import { membersData } from "@/membersData"; // Adjust the import path as needed

const SetPayables = () => {
  const [formType, setFormType] = useState("apartment"); // Default is "apartment"
  const [individuals, setIndividuals] = useState([
    { member: "", title: "", amount: "" },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted");
  };

  const handleAddField = () => {
    setIndividuals([...individuals, { member: "", title: "", amount: "" }]);
  };

  const handleIndividualChange = (index, e) => {
    const newIndividuals = [...individuals];
    newIndividuals[index][e.target.name] = e.target.value;
    setIndividuals(newIndividuals);
  };

  const handleFormTypeChange = (e) => {
    setFormType(e.target.value);
  };

  const totalAmount = individuals.reduce((sum, individual) => {
    return sum + (parseFloat(individual.amount) || 0);
  }, 0);

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Expense Form</h1>

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
          </>
        ) : (
          <>
            {/* Set Individuals Form */}
            {individuals.map((individual, index) => (
              <div key={index} className="space-y-4">
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

                <div>
                  <Label htmlFor={`title-${index}`} className="block mb-1">
                    Title
                  </Label>
                  <Input
                    id={`title-${index}`}
                    name="title"
                    type="text"
                    value={individual.title}
                    onChange={(e) => handleIndividualChange(index, e)}
                    placeholder="Enter title"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor={`amount-${index}`} className="block mb-1">
                    Amount
                  </Label>
                  <Input
                    id={`amount-${index}`}
                    name="amount"
                    type="number"
                    value={individual.amount}
                    onChange={(e) => handleIndividualChange(index, e)}
                    placeholder="Enter amount"
                    className="w-full"
                  />
                </div>
              </div>
            ))}

            {/* Button to add more fields */}
            <div className="mb-6">
              <Button type="button" onClick={handleAddField}>
                Add Member
              </Button>
            </div>

            {/* Total Amount */}
            <div className="font-bold text-lg">
              Total Amount: {totalAmount.toFixed(2)}
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="">
          <Button className="w-full" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SetPayables;
