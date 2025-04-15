"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/firebase";
import {
  collection,
  getDoc,
  setDoc,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const PayableField = ({ field, fieldIndex, individualIndex, onChange, onRemove }) => (
  <div className="flex items-end gap-4">
    <div className="flex-1 space-y-4">
      <div>
        <Label htmlFor={`title-${individualIndex}-${fieldIndex}`} className="block mb-1">
          Title
        </Label>
        <Input
          id={`title-${individualIndex}-${fieldIndex}`}
          name="title"
          type="text"
          value={field.title}
          onChange={(e) => onChange(e, fieldIndex)}
          placeholder="Enter title"
        />
      </div>
      <div>
        <Label htmlFor={`amount-${individualIndex}-${fieldIndex}`} className="block mb-1">
          Amount
        </Label>
        <Input
          id={`amount-${individualIndex}-${fieldIndex}`}
          name="amount"
          type="number"
          value={field.amount}
          onChange={(e) => onChange(e, fieldIndex)}
          placeholder="Enter amount"
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>
    <Button
      type="button"
      onClick={() => onRemove(fieldIndex)}
      variant="destructive"
    >
      Remove
    </Button>
  </div>
);

const IndividualSection = ({ individual, index, activeMembers, onChange, onAddField, onRemoveField }) => (
  <div className="space-y-4 mb-6 border p-4 rounded-md">
    <div>
      <Label htmlFor={`member-${index}`} className="block mb-1">
        Member
      </Label>
      <select
        id={`member-${index}`}
        name="member"
        value={individual.member}
        onChange={(e) => onChange(e, index)}
        className="w-full border px-3 py-2 rounded-md"
      >
        <option value="">Select a member</option>
        {activeMembers.map((member) => (
          <option key={member.id} value={member.name}>
            {member.name}
          </option>
        ))}
      </select>
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
          onChange({ target: { name: 'fields', value: updatedIndividuals } }, index);
        }}
        onRemove={(idx) => onRemoveField(index, idx)}
      />
    ))}
    <Button type="button" onClick={() => onAddField(index)}>
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
      const q = query(membersCollectionRef, where("status", "==", "active"));
      const querySnapshot = await getDocs(q);
      const membersList = querySnapshot.docs.map((doc) => ({
        id: doc.data().id,
        name: doc.data().fullname,
        resident: doc.data().resident,
      }));
      setActiveMembers(membersList);
    } catch (error) {
      console.error("Error fetching active members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch active members.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchActiveMembers();
  }, [fetchActiveMembers]);

  const handleIndividualChange = (e, index) => {
    const updatedIndividuals = [...individuals];
    updatedIndividuals[index][ e.target.name] = e.target.value;
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
        title: "Success!",
        description: "Individual payables have been successfully set/updated.",
        variant: "success",
      });

      setIndividuals([{ member: "", fields: [{ title: "", amount: "" }] }]);
    } catch (error) {
      console.error("Error uploading/updating data:", error);
      toast({
        title: "Error",
        description: "Failed to set/update individual payables. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">
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
        <Button type="button" onClick={handleAddIndividual} variant="outline">
          Add Another Individual
        </Button>
      </div>
      <div className="font-bold text-lg mt-6">
        Total Amount: {calculateTotalAmount()} tk
      </div>
      <div className="mt-6">
        <Button type="button" onClick={handleSubmit} className="w-full">
          Submit
        </Button>
      </div>
    </div>
  );
};

export default IndividualPayablesForm;