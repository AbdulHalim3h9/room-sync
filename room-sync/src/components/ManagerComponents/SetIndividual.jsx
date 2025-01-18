import { membersData } from '@/membersData';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const SetIndividual = () => {
  const [individuals, setIndividuals] = useState([
    { member: "", fields: [{ title: "", amount: "" }] },
  ]);

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

  // Calculate the total amount
  const calculateTotalAmount = () => {
    return individuals.reduce((total, individual) => {
      const individualTotal = individual.fields.reduce((sum, field) => {
        return sum + (parseFloat(field.amount) || 0);
      }, 0);
      return total + individualTotal;
    }, 0);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Set Payables for Individual</h1>
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
                  className="w-full"
                />
              </div>

              <div>
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
        Total Amount: {calculateTotalAmount()} tk
      </div>
    </div>
  );
};

export default SetIndividual;
