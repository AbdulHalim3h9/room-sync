"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/firebase";
import {
  collection,
  getDoc,
  setDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const PayableField = ({ field, fieldIndex, individualIndex, onChange, onRemove }) => (
  <div className="flex items-end gap-4">
    <div className="flex-1 space-y-4">
      <div>
        <Label htmlFor={`title-${individualIndex}-${fieldIndex}`} className="block mb-2 text-sm font-medium text-gray-700">
          Title
        </Label>
        <Input
          id={`title-${individualIndex}-${fieldIndex}`}
          name="title"
          type="text"
          value={field.title}
          onChange={(e) => onChange(e, fieldIndex)}
          placeholder="Enter title"
          className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <Label htmlFor={`amount-${individualIndex}-${fieldIndex}`} className="block mb-2 text-sm font-medium text-gray-700">
          Amount
        </Label>
        <Input
          id={`amount-${individualIndex}-${fieldIndex}`}
          name="amount"
          type="number"
          value={field.amount}
          onChange={(e) => onChange(e, fieldIndex)}
          placeholder="Enter amount (BDT)"
          className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>
    <Button
      type="button"
      onClick={() => onRemove(fieldIndex)}
      variant="destructive"
      className="rounded-md"
    >
      Remove
    </Button>
  </div>
);

const IndividualSection = ({ individual, index, activeMembers, onChange, onAddField, onRemoveField }) => (
  <div className="space-y-4 mb-6 border p-4 rounded-md bg-gray-50">
    <div>
      <Label htmlFor={`member-${index}`} className="block mb-2 text-sm font-medium text-gray-700">
        Member
      </Label>
      <Select
        value={individual.member}
        onValueChange={(value) => onChange({ target: { name: "member", value } }, index)}
      >
        <SelectTrigger
          id={`member-${index}`}
          className="w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
        >
          <SelectValue placeholder="Select a member" />
        </SelectTrigger>
        <SelectContent>
          {activeMembers.length > 0 ? (
            activeMembers.map((member) => (
              <SelectItem key={member.id} value={member.name}>
                {member.name}
              </SelectItem>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No active members for this month
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
    {individual.fields.map((field, fieldIndex) => (
      <PayableField
        key={fieldIndex}
        field={field}
        fieldIndex={fieldIndex}
        individualIndex={index}
        onChange={(e, idx) => {
          const updatedIndividuals = [...individual.fields];
          updatedIndividuals[idx][e.target.name] = e.target.value;
          onChange({ target: { name: "fields", value: updatedIndividuals } }, index);
        }}
        onRemove={(idx) => onRemoveField(index, idx)}
      />
    ))}
    <Button
      type="button"
      onClick={() => onAddField(index)}
      className="bg-blue-500 text-white hover:bg-blue-600 rounded-md"
    >
      Add Field
    </Button>
  </div>
);

const IndividualPayablesForm = ({ selectedMonth }) => {
  const [individuals, setIndividuals] = useState([
    { member: "", fields: [{ title: "", amount: "" }] },
  ]);
  const [activeMembers, setActiveMembers] = useState([]);
  const { toast } = useToast();

  const fetchActiveMembers = useCallback(async () => {
    try {
      const membersCollectionRef = collection(db, "members");
      const querySnapshot = await getDocs(membersCollectionRef);
      const membersList = querySnapshot.docs
        .map((doc) => ({
          id: doc.data().id,
          name: doc.data().fullname,
          resident: doc.data().resident,
          activeFrom: doc.data().activeFrom,
          archiveFrom: doc.data().archiveFrom,
        }))
        .filter((member) => {
          if (!member.activeFrom) return false;
          const activeFromDate = new Date(member.activeFrom + "-01");
          const selectedMonthDate = new Date(selectedMonth + "-01");
          if (activeFromDate > selectedMonthDate) return false;
          if (member.archiveFrom) {
            const archiveFromDate = new Date(member.archiveFrom + "-01");
            return selectedMonthDate < archiveFromDate;
          }
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      setActiveMembers(membersList);
      console.log("Fetched active members for", selectedMonth, ":", membersList);
      if (membersList.length === 0) {
        toast({
          title: "No Active Members",
          description: `No members are active for ${selectedMonth}.`,
          variant: "destructive",
          className: "z-[1002]",
        });
      }
    } catch (error) {
      console.error("Error fetching active members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch active members.",
        variant: "destructive",
        className: "z-[1002]",
      });
    }
  }, [selectedMonth, toast]);

  useEffect(() => {
    fetchActiveMembers();
  }, [fetchActiveMembers]);

  const handleIndividualChange = (e, index) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[index][e.target.name] = e.target.value;
    setIndividuals(updatedIndividuals);
  };

  const handleAddField = (index) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[index].fields.push({ title: "", amount: "" });
    setIndividuals(updatedIndividuals);
  };

  const handleRemoveField = (individualIndex, fieldIndex) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[individualIndex].fields.splice(fieldIndex, 1);
    setIndividuals(updatedIndividuals);
  };

  const handleAddIndividual = () => {
    setIndividuals([
      ...individuals,
      { member: "", fields: [{ title: "", amount: "" }] },
    ]);
  };

  const validateForm = () => {
    const errors = [];
    individuals.forEach((individual, index) => {
      if (!individual.member) {
        errors.push(`Member ${index + 1}`);
      }
      individual.fields.forEach((field, fieldIndex) => {
        if (!field.title) {
          errors.push(`Title for field ${fieldIndex + 1} of Member ${index + 1}`);
        }
        if (!field.amount) {
          errors.push(`Amount for field ${fieldIndex + 1} of Member ${index + 1}`);
        } else if (!/^\d+$/.test(field.amount)) {
          errors.push(
            `Amount for field ${fieldIndex + 1} of Member ${index + 1} must be a number`
          );
        }
      });
    });
    return errors;
  };

  const calculateTotalAmount = () =>
    individuals.reduce(
      (total, ind) =>
        total +
        ind.fields.reduce((sum, field) => sum + (parseInt(field.amount) || 0), 0),
      0
    );

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", ") + " is required.",
        variant: "destructive",
        className: "z-[1002]",
      });
      return;
    }

    try {
      const docRef = doc(db, "payables", selectedMonth);
      const docSnap = await getDoc(docRef);
      let existingBills = docSnap.exists() ? docSnap.data().bills || [] : [];

      const newIndividualBills = individuals.map((individual) => {
        const selectedMember = activeMembers.find(
          (member) => member.name === individual.member
        );
        return {
          id: selectedMember?.id || "",
          name: individual.member,
          status: "Pending",
          payables: individual.fields.map((field) => ({
            name: field.title,
            amount: parseInt(field.amount) || 0,
          })),
        };
      });

      const updatedBills = activeMembers.map((member) => {
        const newBill = newIndividualBills.find((bill) => bill.id === member.id);
        return newBill || existingBills.find((bill) => bill.id === member.id) || {
          id: member.id,
          name: member.name,
          status: "Pending",
          payables: [],
        };
      });

      await setDoc(docRef, { bills: updatedBills }, { merge: true });

      toast({
        title: "Success",
        description: `Individual payables for ${selectedMonth} have been set.`,
        className: "z-[1002]",
      });

      setIndividuals([{ member: "", fields: [{ title: "", amount: "" }] }]);
    } catch (error) {
      console.error("Error uploading/updating data:", error);
      toast({
        title: "Error",
        description: "Failed to set individual payables. Please try again.",
        variant: "destructive",
        className: "z-[1002]",
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        Set Individual Payables for {selectedMonth}
      </h1>
      {individuals.map((individual, index) => (
        <IndividualSection
          key={index}
          individual={individual}
          index={index}
          activeMembers={activeMembers}
          onChange={handleIndividualChange}
          onAddField={handleAddField}
          onRemoveField={handleRemoveField}
        />
      ))}
      <div className="mt-4">
        <Button
          type="button"
          onClick={handleAddIndividual}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
        >
          Add Another Individual
        </Button>
      </div>
      <div className="font-bold text-lg mt-6 text-gray-900">
        Total Amount: {calculateTotalAmount()} BDT
      </div>
      <div className="mt-6">
        <Button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-md"
          disabled={activeMembers.length === 0}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default IndividualPayablesForm;